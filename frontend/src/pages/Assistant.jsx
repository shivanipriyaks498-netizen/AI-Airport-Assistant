
function Assistant() {
  const features = [
    {
      icon: "✈️",
      title: "Flight Assistance",
      description: "Get help with flight information and travel updates.",
    },
    {
      icon: "🧳",
      title: "Baggage Support",
      description: "Find guidance about lost, delayed and damaged baggage.",
    },
    {
      icon: "📍",
      title: "Airport Navigation",
      description: "Get help finding gates and airport facilities.",
    },
    {
      icon: "🎫",
      title: "Travel Guidance",
      description: "Ask questions about check-in and boarding.",
    },
  ];

  return (
    <div className="assistant-page">
      <section className="assistant-hero">
        <div className="assistant-hero-content">
          <span className="assistant-tag">YOUR SMART TRAVEL COMPANION</span>

          <h1>
            Meet Your <span>AI Airport Assistant</span> 🤖
          </h1>

          <p>
            Your journey made easier. Ask questions and get assistance
            with flights, baggage, airport navigation and more.
          </p>

          <div className="assistant-live">
            <span className="assistant-live-dot"></span>
            AI Assistant is ready to help
          </div>

          <p className="assistant-marquee">
            ✈️ Flight Assistance &nbsp; • &nbsp; 🧳 Baggage Support
            &nbsp; • &nbsp; 📍 Airport Navigation &nbsp; • &nbsp;
            🎫 Travel Guidance &nbsp; • &nbsp; ✈️ Flight Assistance
          </p>

          <div className="assistant-chat-hint">
            <span>💬</span>
            <div>
              <strong>Start a conversation</strong>
              <p>
                Click the chat button at the bottom-right corner to
                talk to your airport assistant.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="assistant-features">
        <div className="assistant-section-heading">
          <span>SMART AIRPORT SERVICES</span>
          <h2>How Can I Help You?</h2>
          <p>Explore the assistance available through your AI companion.</p>
        </div>

        <div className="assistant-feature-grid">
          {features.map((feature) => (
            <div className="assistant-feature-card" key={feature.title}>
              <div className="assistant-feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Assistant;
