import React, { useEffect, useState } from "react";

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
      if (data.success) setLeaveRequests(data.leaveRequests || []);
    } catch (err) {
      console.error("Error fetching leave requests:", err);
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
      if (data.success) {
        alert(`Leave ${status.toLowerCase()}!`);
        fetchLeaveRequests();
      } else {
        alert("Failed to update leave request");
      }
    } catch (err) {
      console.error("Error updating leave request:", err);
    }
  };

  return (
    <div>
      <h2>Leave Requests</h2>
      {loading ? (
        <p>Loading leave requests...</p>
      ) : (
        <div style={{ maxHeight: "400px", overflowY: "auto", border: "1px solid #eee" }}>
          <table className="employee-table">
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
                  <td>{leave.userId?.firstName || "Unknown"}</td>
                  <td>{leave.userId?.email || "Unknown"}</td>
                  <td>{leave.from}</td>
                  <td>{leave.to}</td>
                  <td>{leave.reason}</td>
                  <td>{leave.status}</td>
                  <td>
                    {leave.status === "Pending" && (
                      <>
                        <button
                          className="approve-btn"
                          onClick={() => handleStatusChange(leave._id, "Approved")}
                        >
                          Approve
                        </button>
                        <button
                          className="reject-btn"
                          onClick={() => handleStatusChange(leave._id, "Rejected")}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {leave.status !== "Pending" && <span>—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
