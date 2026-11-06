const { getAdvice, assertGroqConfigured } = require("../services/llm.service");
const { retrieveMemories, saveMemory } = require("../services/hindsight.service");

const sendServiceError = (res, error) => {
  if (error.code === "GROQ_API_KEY_MISSING") {
    return res.status(503).json({
      success: false,
      message: "The advisor is not configured. Add GROQ_API_KEY to the backend environment."
    });
  }

  if (error.code === "HINDSIGHT_API_KEY_MISSING") {
    return res.status(503).json({
      success: false,
      message: "Memory is not configured. Add HINDSIGHT_API_KEY to the backend environment."
    });
  }

  if (error.status === 404 && error.code === "model_not_found") {
    return res.status(503).json({
      success: false,
      message: "The configured Groq model is unavailable. Set GROQ_MODEL to a chat model enabled for your Groq account."
    });
  }

  console.error("Advisor service request failed:", {
    code: error.code || "UPSTREAM_ERROR",
    statusCode: error.statusCode || error.status,
    message: error.message
  });
  return res.status(502).json({
    success: false,
    message: "The advisor could not complete the request. Check the Groq and Hindsight backend configuration and try again."
  });
};

const askAdvisor = async (req, res) => {
  const question =
    typeof req.body?.question === "string" ? req.body.question.trim() : "";

  if (!question) {
    return res.status(400).json({
      success: false,
      message: "Please provide a question."
    });
  }

  if (question.length > 4000) {
    return res.status(400).json({
      success: false,
      message: "Please keep your question under 4000 characters."
    });
  }

  const currentSituation =
    typeof req.body?.currentSituation === "string"
      ? req.body.currentSituation.trim()
      : "";

  if (currentSituation.length > 4000) {
    return res.status(400).json({
      success: false,
      message: "Please keep the current situation under 4000 characters."
    });
  }

  try {
    assertGroqConfigured();
    const memoryQuery = [question, currentSituation].filter(Boolean).join("\n");
    const memories = await retrieveMemories(memoryQuery);

    await saveMemory({
      content: [
        `Decision question: ${question}`,
        currentSituation && `Current situation: ${currentSituation}`
      ].filter(Boolean).join("\n"),
      context: "User-provided decision question and current situation",
      metadata: { source: "advisor_question" },
      tags: ["decision-advisor"]
    });

    const answer = await getAdvice(question, currentSituation, memories);

    return res.status(200).json({
      success: true,
      answer,
      memoriesUsed: memories
    });
  } catch (error) {
    return sendServiceError(res, error);
  }
};

const recordDecisionOutcome = async (req, res) => {
  const decision =
    typeof req.body?.decision === "string" ? req.body.decision.trim() : "";
  const outcome =
    typeof req.body?.outcome === "string" ? req.body.outcome.trim() : "";

  if (!decision || !outcome) {
    return res.status(400).json({
      success: false,
      message: "Please provide both the decision and what happened."
    });
  }

  if (decision.length > 2000 || outcome.length > 4000) {
    return res.status(400).json({
      success: false,
      message: "Keep the decision under 2000 characters and the outcome under 4000 characters."
    });
  }

  try {
    await saveMemory({
      content: `User-reported decision: ${decision}\nUser-reported outcome: ${outcome}`,
      context: "A decision and its user-reported outcome",
      metadata: { source: "decision_outcome" },
      tags: ["decision-advisor", "decision-outcome"]
    });

    return res.status(201).json({
      success: true,
      message: "Decision outcome saved to memory."
    });
  } catch (error) {
    return sendServiceError(res, error);
  }
};

module.exports = {
  askAdvisor,
  recordDecisionOutcome
};