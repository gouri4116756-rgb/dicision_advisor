const { HindsightClient } = require("@vectorize-io/hindsight-client");
const env = require("../env");

let hindsightClient;
let bankReady;

const getClient = () => {
  if (!env.HINDSIGHT_API_KEY) {
    const error = new Error("HINDSIGHT_API_KEY is not configured.");
    error.code = "HINDSIGHT_API_KEY_MISSING";
    throw error;
  }

  if (!hindsightClient) {
    hindsightClient = new HindsightClient({
      baseUrl: env.HINDSIGHT_BASE_URL,
      apiKey: env.HINDSIGHT_API_KEY
    });
  }

  return hindsightClient;
};

const ensureBank = async () => {
  const client = getClient();
  if (!bankReady) {
    bankReady = client.createBank(env.HINDSIGHT_BANK_ID, {
      name: "AI Decision Advisor",
      retainMission:
        "Remember user-provided decision context, preferences, choices, and reported outcomes. Do not treat generated advice as a user fact."
    }).catch((error) => {
      bankReady = undefined;
      throw error;
    });
  }
  await bankReady;
  return client;
};

const saveMemory = async ({ content, context, metadata, tags = [] }) => {
  const client = await ensureBank();
  return client.retain(env.HINDSIGHT_BANK_ID, content, {
    context,
    timestamp: new Date(),
    metadata,
    tags,
    async: false
  });
};

const retrieveMemories = async (query) => {
  const client = await ensureBank();
  const response = await client.recall(env.HINDSIGHT_BANK_ID, query, {
    budget: "mid",
    maxTokens: 2000,
    preferObservations: true
  });

  return response.results.map(({ text, type }) => ({ text, type }));
};

module.exports = {
  saveMemory,
  retrieveMemories
};