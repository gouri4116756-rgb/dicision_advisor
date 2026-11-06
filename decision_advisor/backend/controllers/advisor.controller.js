const { getAdvice } = require("../services/llm.service");

const askAdvisor = async (req, res) => {
  try {
    const { question } = req.body;

    const answer = await getAdvice(question);

    res.status(200).json({
      success: true,
      answer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  askAdvisor
};