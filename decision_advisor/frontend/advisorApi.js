import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const askAdvisorApi = async (question, currentSituation) => {
  const response = await axios.post(
    `${API_URL}/api/advisor/ask`,
    {
      question,
      currentSituation
    }
  );

  const result = response.data;
  if (!result || typeof result.answer !== "string" || !result.answer.trim()) {
    throw new Error(result?.message || "The advisor returned an invalid response.");
  }

  return {
    ...result,
    memoriesUsed: Array.isArray(result.memoriesUsed) ? result.memoriesUsed : []
  };
};

export const recordDecisionOutcomeApi = async (decision, outcome) => {
  const response = await axios.post(`${API_URL}/api/advisor/memories`, {
    decision,
    outcome
  });

  return response.data;
};