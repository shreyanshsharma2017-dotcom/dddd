import React, { useEffect, useState } from "react";
import "./announcement.css";

export default function Announcements({ currentUser }) {
  // currentUser must have: { _id, firstName, lastName, role }
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all announcements
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/announcements");
      const data = await res.json();
      if (data.success) setAnnouncements(data.announcements);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch announcements:", err);
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
    if (!title || !message) return alert("Title and message are required");

    const role = currentUser.role?.toLowerCase() || "user";

    const url =
      role === "admin"
        ? "http://localhost:5000/admin/announcements"
        : "http://localhost:5000/announcements";

    const payload =
      role === "admin"
        ? { title, message }
        : { title, message, userId: currentUser._id };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(role === "admin" && { userId: currentUser._id }), // required for isAdmin
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setTitle("");
        setMessage("");
        fetchAnnouncements(); // refresh list
      } else {
        alert(data.message || "Failed to post announcement");
      }
    } catch (err) {
      console.error("Error posting announcement:", err);
    }
  };

  return (
    <div className="announcements-container">
      <h2>Announcements</h2>

      {/* Post Announcement Form */}
      <form onSubmit={handleSubmit} className="announcement-form">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit">Post Announcement</button>
      </form>

      {/* Announcement List */}
      <div className="announcement-list">
        {loading ? (
          <p>Loading announcements...</p>
        ) : announcements.length === 0 ? (
          <p>No announcements yet.</p>
        ) : (
          announcements.map((a) => (
            <div key={a._id} className="announcement-card">
              <h3>{a.title}</h3>
              <p>{a.message}</p>
              <small>
                {a.createdBy
                  ? `${a.createdBy.firstName} ${a.createdBy.lastName} (${a.role})`
                  : a.role}{" "}
                | {new Date(a.date).toLocaleString()}
              </small>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
