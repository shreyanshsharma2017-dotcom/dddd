import React, { useEffect, useState } from "react";
import "./leaveRequests.css";

export default function LeaveRequests() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const res = await fetch("http://localhost:5000/admin/leave-requests", {
        headers: {
          "Content-Type": "application/json",
          userId: user?.id,
        },
      });
      const data = await res.json();
      if (data?.success) setLeaveRequests(data.leaveRequests || []);
      else setLeaveRequests([]);
    } catch (err) {
      console.error("Error fetching leave requests:", err);
      setLeaveRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const res = await fetch(`http://localhost:5000/admin/leave-requests/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          userId: user?.id,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data?.success) {
        alert(`Leave ${status.toLowerCase()}!`);
        fetchLeaveRequests();
      } else {
        alert(data?.message || "Failed to update leave request");
      }
    } catch (err) {
      console.error("Error updating leave request:", err);
      alert("Network error while updating leave request");
    }
  };

  return (
    <div className="lr-page">
      <div className="lr-container">
        <header className="lr-header">
          <h2 className="lr-title">Leave Requests</h2>
          <p className="lr-sub">Review and respond to team leave requests</p>
        </header>

        <section className="lr-card" aria-live="polite">
          {loading ? (
            <div className="lr-loading">Loading leave requests…</div>
          ) : (
            <>
              {leaveRequests.length === 0 ? (
                <div className="lr-empty">No leave requests found.</div>
              ) : (
                <div className="lr-table-wrap" role="region" aria-label="Leave requests table">
                  <table className="lr-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Reason</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaveRequests.map((leave) => (
                        <tr key={leave._id}>
                          <td className="lr-name">{leave.userId?.firstName || "Unknown"}</td>
                          <td className="lr-email">{leave.userId?.email || "Unknown"}</td>
                          <td>{leave.from || "—"}</td>
                          <td>{leave.to || "—"}</td>
                          <td className="lr-reason">{leave.reason || "—"}</td>
                          <td>
                            <span className={`lr-status ${leave.status?.toLowerCase() || "unknown"}`}>
                              {leave.status || "Unknown"}
                            </span>
                          </td>
                          <td className="lr-actions">
                            {leave.status === "Pending" ? (
                              <>
                                <button
                                  className="btn btn-approve"
                                  onClick={() => handleStatusChange(leave._id, "Approved")}
                                >
                                  Approve
                                </button>
                                <button
                                  className="btn btn-reject"
                                  onClick={() => handleStatusChange(leave._id, "Rejected")}
                                >
                                  Reject
                                </button>
                              </>
                            ) : (
                              <span className="lr-dash">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
