import "./App.css";
import { useState } from "react";
import { askAdvisorApi } from "../decision_advisor/frontend/advisorApi";

export default function App() {
  const [question, setQuestion] = useState("");
const [answer, setAnswer] = useState("");
  return (
    <div className="container">

      <nav className="navbar">
        <h2>AI Decision Advisor</h2>

        <button className="nav-btn">
          Dashboard
        </button>
      </nav>

      <section className="hero">
        <h1>
          Make Better Decisions With Memory
        </h1>

        <p>
          AI that remembers your past decisions,
          outcomes, habits, and lessons to help
          you make smarter choices.
        </p>
      </section>

      <section className="advisor-card">
  <h2>Ask Your Advisor</h2>

  <textarea
  value={question}
  onChange={(e) => setQuestion(e.target.value)}
  placeholder="Should I join a startup?"
/>

  <button
  onClick={async () => {
    const result = await askAdvisorApi(question);
    setAnswer(result.answer);
  }}
>
  Ask Advisor
</button>

  <div className="response-card">
    <h3>Recommendation</h3>

    <p>
  {answer || "Your AI response will appear here..."}
</p>
  </div>

  <div className="memory-card">
    <h3>Memory Used</h3>

    <p>
      Previous Startup Decision
    </p>

    <p>
      Outcome: Burnout
    </p>
  </div>
  <div className="history-card">
  <h3>Decision History</h3>

  <ul>
    <li>Joined Startup → Burnout</li>
    <li>Changed Company → Salary +40%</li>
    <li>Started Exercise Plan → Successful</li>
  </ul>
</div>

</section>

    </div>
  );
}
