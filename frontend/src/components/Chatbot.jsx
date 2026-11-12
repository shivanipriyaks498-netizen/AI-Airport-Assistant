
import { useEffect, useRef, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

const quickQuestions = [
  "How can I check my flight status?",
  "What should I do if my baggage is lost?",
  "How early should I reach the airport?",
  "Where can I find my boarding gate?",
];

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello! 👋 Welcome to AI Airport Assistant. How can I help you today?",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Load previous conversation
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await API.get("/chat/history");

        if (
          response.data.success &&
          Array.isArray(response.data.messages) &&
          response.data.messages.length > 0
        ) {
          setMessages(response.data.messages);
        }
      } catch (error) {
        console.error(
          "Unable to load chat history:",
          error.response?.data?.message || error.message
        );
      }
    };

    loadHistory();
  }, []);

  // Scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  // Send a message to the backend
  const sendMessage = async (messageText) => {
    const userMessage = messageText.trim();

    if (!userMessage || loading) return;

    if (userMessage.length > 1000) {
      toast.error("Message cannot exceed 1000 characters.");
      return;
    }

    setMessages((previous) => [
      ...previous,
      { role: "user", text: userMessage },
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await API.post("/chat/message", {
        message: userMessage,
      });

      if (!response.data.success || !response.data.reply) {
        throw new Error(
          response.data.message || "The assistant returned no answer."
        );
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: response.data.reply,
        },
      ]);
    } catch (error) {
      console.error("Chat request failed:", error);

      let errorMessage =
        "Unable to send your message. Please try again.";

      if (error.code === "ECONNABORTED") {
        errorMessage = "The request took too long. Please try again.";
      } else if (error.response?.status === 401) {
        errorMessage = "Your login session has expired. Please log in again.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: errorMessage,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSend = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* Floating chatbot button */}
      <button
        className="chatbot-toggle"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-label={isOpen ? "Close airport assistant chat" : "Open airport assistant chat"}
        type="button"
      >
        {isOpen ? "✕" : "💬"}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">✈️</div>
              <div>
                <h3>AI Airport Assistant</h3>
                <p>
                  <span className="chatbot-online-dot"></span>
                  Online • Ready to help
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <div
                key={message._id || index}
                className={`chat-message ${
                  message.role === "user"
                    ? "user-message"
                    : "assistant-message"
                }`}
              >
                <div className="message-bubble">
                  {message.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat-message assistant-message">
                <div className="message-bubble typing">
                  Assistant is typing
                  <span className="typing-dots">...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick questions shown before the first conversation */}
          {messages.length <= 1 && !loading && (
            <div className="chatbot-quick-questions">
              <p>Try asking:</p>

              {quickQuestions.map((question) => (
                <button
                  type="button"
                  key={question}
                  onClick={() => sendMessage(question)}
                >
                  {question}
                </button>
              ))}
            </div>
          )}

          <form className="chatbot-input" onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Ask me about your journey..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={1000}
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send message"
            >
              {loading ? "..." : "➤"}
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default Chatbot;
