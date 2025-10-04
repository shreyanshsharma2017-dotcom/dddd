import React, { useEffect, useState } from "react";

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const adminUser = JSON.parse(localStorage.getItem("user"));
      const res = await fetch("http://localhost:5000/announcements", {
        headers: {
          "Content-Type": "application/json"
        },
      });
      const data = await res.json();
      if (data.success) setAnnouncements(data.announcements || []);
    } catch (err) {
      console.error("Error fetching announcements:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAnnouncement = async () => {
    if (!title || !message) return alert("Title and message required");

    try {
      const adminUser = JSON.parse(localStorage.getItem("user"));
      const res = await fetch("http://localhost:5000/admin/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          userId: adminUser?._id,
        },
        body: JSON.stringify({ title, message }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Announcement posted!");
        setTitle("");
        setMessage("");
        fetchAnnouncements();
      } else {
        alert("Failed to post announcement");
      }
    } catch (err) {
      console.error("Error posting announcement:", err);
    }
  };

  return (
    <div>
      <h2>Announcements</h2>

      {/* Add Announcement Form */}
      <div className="announcement-form">
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
        <button onClick={handleAddAnnouncement}>Post</button>
      </div>

      {/* Existing Announcements */}
      {loading ? (
        <p>Loading announcements...</p>
      ) : (
        <table className="employee-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Message</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {announcements.map((a) => (
              <tr key={a._id}>
                <td>{a.title}</td>
                <td>{a.message}</td>
                <td>{new Date(a.date).toLocaleDateString()}</td>
                <td>
                  <button onClick={async () => {
                    if (window.confirm("Delete this announcement?")) {
                      try {
                        const res = await fetch(`http://localhost:5000/announcements/${a._id}`, {
                          method: "DELETE",
                        });
                        const data = await res.json();
                        if (data.success) {
                          fetchAnnouncements();
                        } else if (data.message && data.message.includes("not found")) {
                          alert("Announcement not found. It may have already been deleted.");
                          fetchAnnouncements();
                        } else {
                          alert(data.message || "Failed to delete");
                        }
                      } catch (err) {
                        alert("Error deleting announcement");
                      }
                    }
                  }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
