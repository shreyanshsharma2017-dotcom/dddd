import React, { useEffect, useState } from "react";

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
          userId: user?.id,
        },
      });
      const data = await res.json();
      if (data.success) setAttendance(data.attendance || []);
    } catch (err) {
      console.error("Error fetching attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Attendance</h2>
      {loading ? (
        <p>Loading attendance records...</p>
      ) : (
        <table className="employee-table">
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
                <td>{a.userId?.firstName || "Unknown"}</td>
                <td>{a.userId?.email || "Unknown"}</td>
                <td>{a.date}</td>
                <td>{a.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
