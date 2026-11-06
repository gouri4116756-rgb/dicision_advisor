const Groq = require("groq-sdk");
const env = require("../env");
const advisorPrompt = require("../prompts/advisorprompt");

const getAdvice = async (question) => {
  if (!env.GROQ_API_KEY) {
    const error = new Error("GROQ_API_KEY is not configured.");
    error.code = "GROQ_API_KEY_MISSING";
    throw error;
  }

  const groq = new Groq({ apiKey: env.GROQ_API_KEY });
  const completion = await groq.chat.completions.create({
    model: env.GROQ_MODEL,
    messages: [
      { role: "system", content: advisorPrompt },
      { role: "user", content: question }
    ],
    temperature: 0.6,
    max_tokens: 1024
  });

  const answer = completion.choices[0]?.message?.content?.trim();
  if (!answer) {
    throw new Error("Groq returned an empty response.");
  }

  return answer;
};

module.exports = {
  getAdvice
};
