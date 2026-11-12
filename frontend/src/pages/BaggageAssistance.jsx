
import { useState } from "react";

function BaggageAssistance() {
  const [topic, setTopic] = useState("lost");
  const [details, setDetails] = useState("");
  const [response, setResponse] = useState("");

  const guidance = {
    lost: "For lost baggage, contact your airline's baggage service desk. Keep your baggage tag and boarding pass ready.",
    delayed: "For delayed baggage, contact your airline's baggage service desk. Share your baggage tag number and flight details. Ask for a tracking reference.",
    damaged: "For damaged baggage, report the damage before leaving the airport. Take photographs and keep your baggage tag as evidence.",
    allowance: "Baggage allowance depends on your airline, ticket type, and route. Check your airline's official website before travelling."
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!details.trim()) {
      setResponse("Please enter a few details so we can guide you.");
      return;
    }

    setResponse(guidance[topic]);
  };

  return (
    <div className="baggage-page">
      <section className="baggage-hero">
        <div className="baggage-hero-content">
          <span className="baggage-tag">TRAVEL SUPPORT</span>
          <h1>Baggage Assistance</h1>
          <p>
            Your journey matters. Get helpful guidance for lost,
            delayed, damaged baggage and baggage allowance.
          </p>
        </div>
      </section>

      <main className="baggage-container">
        <div className="baggage-intro">
          <h2>How can we help you?</h2>
          <p>Select your baggage issue and tell us a little more.</p>
        </div>

        <form onSubmit={handleSubmit} className="baggage-form">
          <label htmlFor="baggage-topic">
            Select your baggage issue
          </label>

          <select
            id="baggage-topic"
            value={topic}
            onChange={(e) => {
              setTopic(e.target.value);
              setResponse("");
            }}
          >
            <option value="lost">🧳 Lost baggage</option>
            <option value="delayed">⏰ Delayed baggage</option>
            <option value="damaged">💼 Damaged baggage</option>
            <option value="allowance">✈️ Baggage allowance</option>
          </select>

          <label htmlFor="baggage-details">
            Describe your issue
          </label>

          <textarea
            id="baggage-details"
            rows="5"
            placeholder="Describe your baggage issue here..."
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />

          <button type="submit">
            Get Assistance →
          </button>
        </form>

        {response && (
          <div className="baggage-response">
            <h3>✈️ Your Assistance Guide</h3>
            <p>{response}</p>
            <small>
              Demo guidance only. This page does not track actual baggage.
              Contact your airline for official assistance.
            </small>
          </div>
        )}

        <div className="baggage-help-note">
          <span>ℹ️</span>
          <div>
            <h3>Need additional help?</h3>
            <p>
              For urgent baggage concerns, please visit your airline's
              baggage service counter at the airport.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default BaggageAssistance;
