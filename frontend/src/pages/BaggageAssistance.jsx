
import { useState } from "react";

function BaggageAssistance() {
  const [topic, setTopic] = useState("lost");
  const [details, setDetails] = useState("");
  const [response, setResponse] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!details.trim()) {
      setResponse("Please enter a few details so we can guide you.");
      return;
    }

    const guidance = {
      lost:
        "For lost baggage, contact your airline's baggage service desk at the airport. Keep your baggage tag and boarding pass ready. Provide the details you entered when speaking with airline staff.",
      delayed:
        "For delayed baggage, contact your airline's baggage service desk. Share your baggage tag number and flight details, and ask for a baggage reference or tracking number.",
      damaged:
        "For damaged baggage, report the damage to your airline's baggage service desk before leaving the airport. Keep photographs and your baggage tag as evidence.",
      allowance:
        "Baggage allowance depends on your airline, ticket type, and route. Check your airline's official website or contact the airline before travelling."
    };

    setResponse(guidance[topic]);
  };

  return (
    <div className="baggage-page">
      <header className="baggage-header">
        <h1>🧳 Baggage Assistance</h1>
        <p>Get guidance for common baggage-related issues.</p>
      </header>

      <main className="baggage-container">
        <form onSubmit={handleSubmit} className="baggage-form">
          <label htmlFor="baggage-topic">What do you need help with?</label>

          <select
            id="baggage-topic"
            value={topic}
            onChange={(e) => {
              setTopic(e.target.value);
              setResponse("");
            }}
          >
            <option value="lost">Lost baggage</option>
            <option value="delayed">Delayed baggage</option>
            <option value="damaged">Damaged baggage</option>
            <option value="allowance">Baggage allowance</option>
          </select>

          <label htmlFor="baggage-details">Enter your details</label>

          <textarea
            id="baggage-details"
            rows="5"
            placeholder="Example: My baggage did not arrive after landing..."
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />

          <button type="submit">Get Assistance</button>
        </form>

        {response && (
          <div className="baggage-response">
            <h3>Suggested Guidance</h3>
            <p>{response}</p>
            <small>
              Demo guidance only. This page does not track actual baggage.
              Contact your airline for official assistance.
            </small>
          </div>
        )}
      </main>
    </div>
  );
}

export default BaggageAssistance;
