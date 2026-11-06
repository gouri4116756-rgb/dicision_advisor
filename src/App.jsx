import "./App.css";
import { useState } from "react";
import {
  askAdvisorApi,
  recordDecisionOutcomeApi
} from "../decision_advisor/frontend/advisorApi";

export default function App() {
  const [question, setQuestion] = useState("");
  const [currentSituation, setCurrentSituation] = useState("");
  const [answer, setAnswer] = useState("");
  const [memoriesUsed, setMemoriesUsed] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [decision, setDecision] = useState("");
  const [outcome, setOutcome] = useState("");
  const [memoryMessage, setMemoryMessage] = useState("");
  const [memoryError, setMemoryError] = useState("");
  const [isSavingMemory, setIsSavingMemory] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!question.trim() || isLoading) {
      setError("Enter a question to get started.");
      return;
    }

    setIsLoading(true);
    setError("");
    setAnswer("");
    setMemoriesUsed([]);

    try {
      const result = await askAdvisorApi(
        question.trim(),
        currentSituation.trim()
      );
      setAnswer(result.answer);
      setMemoriesUsed(result.memoriesUsed);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Could not reach the advisor. Check that the backend is running and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOutcomeSubmit = async (event) => {
    event.preventDefault();
    if (!decision.trim() || !outcome.trim() || isSavingMemory) {
      setMemoryError("Enter both the decision and what happened.");
      return;
    }

    setIsSavingMemory(true);
    setMemoryError("");
    setMemoryMessage("");

    try {
      const result = await recordDecisionOutcomeApi(
        decision.trim(),
        outcome.trim()
      );
      setMemoryMessage(result.message);
      setDecision("");
      setOutcome("");
    } catch (requestError) {
      setMemoryError(
        requestError.response?.data?.message ||
          "Could not save this decision outcome. Check that the backend is running and try again."
      );
    } finally {
      setIsSavingMemory(false);
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
          <label className="question-label" htmlFor="current-situation">
            What is happening right now? (optional)
          </label>
          <textarea
            id="current-situation"
            className="situation-input"
            value={currentSituation}
            onChange={(event) => setCurrentSituation(event.target.value)}
            placeholder="Share relevant deadlines, options, constraints, or concerns."
            maxLength={4000}
          />
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

        <div className="memory-card">
          <h3>Past context used</h3>
          {memoriesUsed.length > 0 ? (
            <ul>
              {memoriesUsed.map((memory, index) => (
                <li key={`${memory.type}-${index}`}>
                  <span className="memory-type">{memory.type}</span>
                  {memory.text}
                </li>
              ))}
            </ul>
          ) : (
            <p>
              Relevant past experiences will appear here after you ask. Add a
              decision outcome below so the advisor can learn from it.
            </p>
          )}
        </div>

        <div className="history-card">
          <h3>Teach your advisor from past decisions</h3>
          <p>
            Record what you chose and what happened. Hindsight will save it and
            retrieve it for relevant future questions.
          </p>
          <form onSubmit={handleOutcomeSubmit}>
            <label className="question-label" htmlFor="past-decision">
              What decision did you make?
            </label>
            <textarea
              id="past-decision"
              className="outcome-input"
              value={decision}
              onChange={(event) => setDecision(event.target.value)}
              placeholder="I joined an early-stage startup."
              maxLength={2000}
            />
            <label className="question-label" htmlFor="decision-outcome">
              What was the outcome?
            </label>
            <textarea
              id="decision-outcome"
              className="outcome-input"
              value={outcome}
              onChange={(event) => setOutcome(event.target.value)}
              placeholder="The role helped me grow, but the long hours led to burnout."
              maxLength={4000}
            />
            {memoryError && (
              <p className="error-message" role="alert">
                {memoryError}
              </p>
            )}
            {memoryMessage && (
              <p className="success-message" role="status">
                {memoryMessage}
              </p>
            )}
            <button type="submit" disabled={isSavingMemory}>
              {isSavingMemory ? "Saving..." : "Save decision outcome"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
