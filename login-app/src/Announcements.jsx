import React, { useEffect, useState } from "react";
import "./announcement.css";

export default function Announcements({ currentUser }) {
  // currentUser must have: { _id, firstName, lastName, role }
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);

  // Fetch all announcements
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/announcements");
      const data = await res.json();
      if (data?.success) setAnnouncements(data.announcements || []);
      else setAnnouncements([]);
    } catch (err) {
      console.error("Failed to fetch announcements:", err);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Submit announcement
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return alert("User not loaded yet");
    if (!title.trim() || !message.trim()) return alert("Title and message are required");

    const role = (currentUser.role || "user").toLowerCase();

    const url =
      role === "admin"
        ? "http://localhost:5000/admin/announcements"
        : "http://localhost:5000/announcements";

    const payload =
      role === "admin"
        ? { title: title.trim(), message: message.trim() }
        : { title: title.trim(), message: message.trim(), userId: currentUser._id };

    try {
      setPosting(true);
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(role === "admin" && { userId: currentUser._id }),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data?.success) {
        setTitle("");
        setMessage("");
        fetchAnnouncements();
      } else {
        alert(data?.message || "Failed to post announcement");
      }
    } catch (err) {
      console.error("Error posting announcement:", err);
      alert("Network error while posting announcement");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="ann-page">
      <div className="ann-container">
        <header className="ann-header">
          <div>
            <h1 className="ann-title">Announcements</h1>
            <p className="ann-sub">Post updates for your team and view recent notices</p>
          </div>

          <div className="ann-user">
            {currentUser ? (
              <>
                <div className="ann-avatar">
                  {(currentUser.firstName || "?").charAt(0).toUpperCase()}
                </div>
                <div className="ann-user-meta">
                  <div className="ann-user-name">
                    {currentUser.firstName} {currentUser.lastName}
                  </div>
                  <div className="ann-user-role">{currentUser.role}</div>
                </div>
              </>
            ) : (
              <div className="ann-muted">User not loaded</div>
            )}
          </div>
        </header>

        <section className="ann-form-card">
          <form className="ann-form" onSubmit={handleSubmit}>
            <div className="ann-form-row">
              <input
                type="text"
                className="ann-input"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                aria-label="Title"
              />
              <button type="submit" className="ann-btn" disabled={posting}>
                {posting ? "Posting…" : "Post"}
              </button>
            </div>

            <textarea
              className="ann-textarea"
              placeholder="Write your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              aria-label="Message"
            />
          </form>
        </section>

        <section className="ann-list" aria-live="polite">
          {loading ? (
            <div className="ann-loading">Loading announcements…</div>
          ) : announcements.length === 0 ? (
            <div className="ann-empty">No announcements yet.</div>
          ) : (
            <div className="ann-scroll" role="region" aria-label="Announcements list">
              {announcements.map((a) => (
                <article key={a._id} className="ann-item">
                  <div className="ann-item-head">
                    <h3 className="ann-item-title">{a.title}</h3>
                    <div className="ann-item-meta">
                      <span className={`ann-badge ${a.role ? a.role.toLowerCase() : "user"}`}>
                        {a.role || "user"}
                      </span>
                      <time className="ann-time">
                        {a.date ? new Date(a.date).toLocaleString() : ""}
                      </time>
                    </div>
                  </div>

                  <p className="ann-item-body">{a.message}</p>

                  <div className="ann-item-footer">
                    <span className="ann-author">
                      {a.createdBy ? `${a.createdBy.firstName} ${a.createdBy.lastName}` : "System"}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
