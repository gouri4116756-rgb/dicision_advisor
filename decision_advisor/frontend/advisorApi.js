import axios from "axios";

export const askAdvisorApi = async (question) => {
  const response = await axios.post(
    "http://localhost:5000/api/advisor/ask",
    {
      question,
    }
  );

  return response.data;
};