const { getAdvice } = require("../services/llm.service");

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

  try {
    const answer = await getAdvice(question);

    res.status(200).json({
      success: true,
      answer
    });
  } catch (error) {
    if (error.code === "GROQ_API_KEY_MISSING") {
      return res.status(503).json({
        success: false,
        message: "The advisor is not configured. Add GROQ_API_KEY to the backend environment."
      });
    }

    console.error("Groq advisor request failed:", error.message);
    return res.status(502).json({
      success: false,
      message: "The AI advisor could not generate a response. Please try again."
    });
  }
};

module.exports = {
  askAdvisor
};