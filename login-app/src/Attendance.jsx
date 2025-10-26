import React, { useEffect, useState } from "react";
import "./attendance.css";

export default function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const res = await fetch("http://localhost:5000/admin/attendance", {
        headers: {
          "Content-Type": "application/json",
          userId: user?._id ?? user?.id,
        },
      });
      const data = await res.json();
      if (data?.success) setAttendance(data.attendance || []);
      else setAttendance([]);
    } catch (err) {
      console.error("Error fetching attendance:", err);
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="att-page">
      <div className="att-container">
        <header className="att-header">
          <div>
            <h1 className="att-title">Attendance</h1>
            <p className="att-sub">View daily attendance records for your team</p>
          </div>
        </header>

        <main className="att-card" aria-live="polite">
          {loading ? (
            <div className="att-loading">Loading attendance records…</div>
          ) : attendance.length === 0 ? (
            <div className="att-empty">No attendance records found.</div>
          ) : (
            <div className="att-table-wrap" role="region" aria-label="Attendance table">
              <table className="att-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((a) => (
                    <tr key={a._id}>
                      <td className="att-name">{a.userId?.firstName || a.userId?.name || "Unknown"}</td>
                      <td className="att-email">{a.userId?.email || "Unknown"}</td>
                      <td className="att-date">{a.date ? new Date(a.date).toLocaleDateString() : "—"}</td>
                      <td>
                        <span className={`att-status ${String(a.status || "unknown").toLowerCase()}`}>
                          {a.status || "Unknown"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
