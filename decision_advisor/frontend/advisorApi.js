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

  return response.data;
};

export const recordDecisionOutcomeApi = async (decision, outcome) => {
  const response = await axios.post(`${API_URL}/api/advisor/memories`, {
    decision,
    outcome
  });

  return response.data;
};