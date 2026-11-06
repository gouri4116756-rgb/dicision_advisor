const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");
const Module = require("node:module");

process.env.GROQ_API_KEY = "test-groq-key";
process.env.HINDSIGHT_API_KEY = "test-hindsight-key";
process.env.HINDSIGHT_BASE_URL = "http://hindsight.test";
process.env.HINDSIGHT_BANK_ID = "test-advisor-bank";

const calls = [];
const storedMemories = [];

class MockHindsightClient {
  constructor(options) {
    calls.push({ method: "client", options });
  }

  async createBank(bankId, options) {
    calls.push({ method: "createBank", bankId, options });
  }

  async recall(bankId, query, options) {
    calls.push({ method: "recall", bankId, query, options });
    return {
      results: storedMemories.length
        ? storedMemories.map((text) => ({ type: "experience", text }))
        : [{ type: "experience", text: "A previous move caused significant stress." }]
    };
  }

  async retain(bankId, content, options) {
    calls.push({ method: "retain", bankId, content, options });
    storedMemories.push(content);
    return { success: true };
  }
}

class MockGroq {
  constructor() {
    this.chat = {
      completions: {
        create: async (request) => {
          calls.push({ method: "groq", request });
          return {
            choices: [{ message: { content: "Consider the workload trade-off." } }]
          };
        }
      }
    };
  }
}

const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === "groq-sdk") {
    return MockGroq;
  }
  if (request === "@vectorize-io/hindsight-client") {
    return { HindsightClient: MockHindsightClient };
  }
  return originalLoad.call(this, request, parent, isMain);
};

const app = require("../app");
Module._load = originalLoad;

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
});

test("asks Hindsight for memories, sends them to Groq, and returns the answer", async () => {
  calls.length = 0;
  const response = await fetch(`${baseUrl}/api/advisor/ask`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      question: "Should I accept the new job?",
      currentSituation: "The role has longer hours."
    })
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.answer, "Consider the workload trade-off.");
  assert.equal(body.memoriesUsed[0].text, "A previous move caused significant stress.");

  const recallCall = calls.find((call) => call.method === "recall");
  assert.match(recallCall.query, /Should I accept the new job\?/);
  assert.match(recallCall.query, /The role has longer hours\./);

  const groqCall = calls.find((call) => call.method === "groq");
  assert.match(groqCall.request.messages[1].content, /A previous move caused significant stress/);
  assert.match(groqCall.request.messages[1].content, /The role has longer hours/);

  const retainedQuestion = calls.find(
    (call) => call.method === "retain" && call.options.metadata.source === "advisor_question"
  );
  assert.match(retainedQuestion.content, /Decision question: Should I accept the new job\?/);
});

test("stores decision outcomes in Hindsight", async () => {
  calls.length = 0;
  storedMemories.length = 0;
  const response = await fetch(`${baseUrl}/api/advisor/memories`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      decision: "I accepted a startup role.",
      outcome: "I learned quickly but struggled with the hours."
    })
  });
  const body = await response.json();

  assert.equal(response.status, 201);
  assert.equal(body.success, true);
  const retainedOutcome = calls.find((call) => call.method === "retain");
  assert.match(retainedOutcome.content, /I accepted a startup role/);
  assert.match(retainedOutcome.content, /struggled with the hours/);
  assert.deepEqual(retainedOutcome.options.tags, ["decision-advisor", "decision-outcome"]);

  const askResponse = await fetch(`${baseUrl}/api/advisor/ask`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ question: "Should I take another startup role?" })
  });
  assert.equal(askResponse.status, 200);
  const groqCall = calls.find((call) => call.method === "groq");
  assert.match(groqCall.request.messages[1].content, /I accepted a startup role/);
  assert.match(groqCall.request.messages[1].content, /struggled with the hours/);
});

test("rejects empty questions before contacting memory or AI services", async () => {
  calls.length = 0;
  const response = await fetch(`${baseUrl}/api/advisor/ask`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ question: " " })
  });

  assert.equal(response.status, 400);
  assert.equal(calls.length, 0);
});
