import React, { useEffect, useState } from "react";

export default function Payroll() {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPayroll();
  }, []);

  const fetchPayroll = async () => {
    setLoading(true);
    try {
      const adminUser = JSON.parse(localStorage.getItem("user"));
      const res = await fetch("http://localhost:5000/admin/payroll", {
        headers: {
          "Content-Type": "application/json",
          userId: adminUser?._id,
        },
      });
      const data = await res.json();
      if (data.success) setPayrolls(data.payroll || []);
    } catch (err) {
      console.error("Error fetching payroll:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const adminUser = JSON.parse(localStorage.getItem("user"));
      const res = await fetch(`http://localhost:5000/admin/payroll/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          userId: adminUser?._id,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Payroll ${status.toLowerCase()}!`);
        fetchPayroll();
      } else {
        alert("Failed to update payroll");
      }
    } catch (err) {
      console.error("Error updating payroll:", err);
    }
  };

  return (
    <div>
      <h2>Payroll</h2>
      {loading ? (
        <p>Loading payrolls...</p>
      ) : (
        <table className="employee-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Month</th>
              <th>Salary</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {payrolls.map((p) => (
              <tr key={p._id}>
                <td>{p.userId?.name || "Unknown"}</td>
                <td>{p.userId?.email || "Unknown"}</td>
                <td>{p.month}</td>
                <td>{p.salary}</td>
                <td>{p.status}</td>
                <td>
                  {p.status === "Pending" && (
                    <>
                      <button
                        className="approve-btn"
                        onClick={() => handleStatusChange(p._id, "Approved")}
                      >
                        Approve
                      </button>
                      <button
                        className="reject-btn"
                        onClick={() => handleStatusChange(p._id, "Rejected")}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {p.status !== "Pending" && <span>—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
