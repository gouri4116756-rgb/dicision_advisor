import axios from "axios";

const API_URL =
  "http://localhost:5000/api/advisor";

export const askAdvisor = async (
  question
) => {

  const response =
    await axios.post(
      `${API_URL}/ask`,
      {
        question
      }
    );

  return response.data;
};
