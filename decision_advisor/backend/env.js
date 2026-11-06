const path = require("path");

require("dotenv").config({ path: path.join(__dirname, ".env") });

module.exports = {
  PORT: process.env.PORT || 5000,
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  GROQ_MODEL: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
  HINDSIGHT_API_KEY: process.env.HINDSIGHT_API_KEY,
  HINDSIGHT_BASE_URL:
    process.env.HINDSIGHT_BASE_URL || "https://api.hindsight.vectorize.io",
  HINDSIGHT_BANK_ID: process.env.HINDSIGHT_BANK_ID || "decision-advisor"
};