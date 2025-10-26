import React, { useState } from "react";
import "./help.css";

export default function Help() {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return alert("Please enter a message");
    try {
      setSending(true);
      // Example: send to support endpoint (adjust URL as needed)
      await fetch("http://localhost:5000/support/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim() }),
      });
      setMessage("");
      alert("Support request submitted");
    } catch (err) {
      console.error("Failed to submit support request", err);
      alert("Failed to submit request");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="help-page">
      <div className="help-container">
        <header className="help-header">
          <div>
            <h1 className="help-title">Help & Support</h1>
            <p className="help-sub">Find docs, FAQs, or contact support directly</p>
          </div>
        </header>

        <section className="help-card">
          <div className="help-grid">
            <div className="help-left">
              <h2 className="help-section-title">Quick contacts</h2>
              <div className="help-contact">
                <div className="help-contact-row">
                  <strong>Support Email</strong>
                  <a href="mailto:support@company.com" className="help-link">support@company.com</a>
                </div>
                <div className="help-contact-row">
                  <strong>Documentation</strong>
                  <a href="http://localhost:5000/docs" target="_blank" rel="noreferrer" className="help-link">Developer Docs</a>
                </div>
                <div className="help-contact-row">
                  <strong>Live Chat</strong>
                  <span className="help-muted">Available Mon–Fri, 9am–6pm</span>
                </div>
              </div>

              <h3 className="help-section-title">Frequently asked</h3>
              <ul className="help-faq">
                <li>
                  <strong>How to reset password?</strong>
                  <p className="help-muted">Use the Forgot Password link on login page to request a reset email.</p>
                </li>
                <li>
                  <strong>Where are API docs?</strong>
                  <p className="help-muted">Open Developer Docs link above for endpoints and examples.</p>
                </li>
                <li>
                  <strong>How to report a bug?</strong>
                  <p className="help-muted">Use the form on the right or email support with steps to reproduce.</p>
                </li>
              </ul>
            </div>

            <aside className="help-right" aria-label="Contact support">
              <h3 className="help-section-title">Contact Support</h3>
              <form className="help-form" onSubmit={handleSubmit}>
                <label className="help-label">
                  Message
                  <textarea
                    className="help-textarea"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your issue or question..."
                    rows={6}
                    aria-label="Support message"
                  />
                </label>

                <div className="help-actions">
                  <button type="submit" className="help-btn" disabled={sending}>
                    {sending ? "Sending…" : "Send Request"}
                  </button>
                  <button
                    type="button"
                    className="help-btn help-btn-ghost"
                    onClick={() => setMessage("")}
                    disabled={sending}
                  >
                    Clear
                  </button>
                </div>

                <div className="help-note">
                  <small className="help-muted">We aim to respond within 24 hours on business days.</small>
                </div>
              </form>
            </aside>
          </div>
        </section>
      </div>
    </div>
  );
}
