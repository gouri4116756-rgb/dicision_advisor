require("dotenv").config();

module.exports = {
  PORT: process.env.PORT,
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  HINDSIGHT_API_KEY: process.env.HINDSIGHT_API_KEY
};