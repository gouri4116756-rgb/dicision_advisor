import "./App.css";
import { useState } from "react";
import { askAdvisorApi } from "../decision_advisor/frontend/advisorApi";

export default function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!question.trim() || isLoading) {
      setError("Enter a question to get started.");
      return;
    }

    setIsLoading(true);
    setError("");
    setAnswer("");

    try {
      const result = await askAdvisorApi(question.trim());
      setAnswer(result.answer);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Could not reach the advisor. Check that the backend is running and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <nav className="navbar">
        <h2>AI Decision Advisor</h2>
      </nav>

      <section className="hero">
        <h1>Make Better Decisions</h1>
        <p>
          Get thoughtful, practical guidance to weigh your options and decide
          what to do next.
        </p>
      </section>

      <section className="advisor-card">
        <h2>Ask Your Advisor</h2>
        <form onSubmit={handleSubmit}>
          <label className="question-label" htmlFor="advisor-question">
            What decision are you thinking through?
          </label>
          <textarea
            id="advisor-question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Should I join a startup? What factors should I consider?"
            maxLength={4000}
            aria-describedby={error ? "advisor-error" : undefined}
          />
          {error && (
            <p className="error-message" id="advisor-error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Thinking..." : "Ask Advisor"}
          </button>
        </form>

        <div className="response-card" aria-live="polite">
          <h3>Advisor response</h3>
          <p>
            {isLoading
              ? "Considering your question..."
              : answer || "Your AI response will appear here."}
          </p>
        </div>
      </section>
    </div>
  );
}
