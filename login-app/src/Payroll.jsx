import React, { useEffect, useState } from "react";
import "./payroll.css";

export default function Payroll() {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

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
      if (data?.success) setPayrolls(data.payroll || []);
      else setPayrolls([]);
    } catch (err) {
      console.error("Error fetching payroll:", err);
      setPayrolls([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    if (!id) return;
    setUpdatingId(id);
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
      if (data?.success) {
        alert(`Payroll ${status.toLowerCase()}!`);
        fetchPayroll();
      } else {
        alert(data?.message || "Failed to update payroll");
      }
    } catch (err) {
      console.error("Error updating payroll:", err);
      alert("Network error while updating payroll");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="pay-page">
      <div className="pay-container">
        <header className="pay-header">
          <div>
            <h1 className="pay-title">Payroll</h1>
            <p className="pay-sub">Review and approve monthly salary disbursements</p>
          </div>
        </header>

        <section className="pay-card" aria-live="polite">
          {loading ? (
            <div className="pay-loading">Loading payrolls…</div>
          ) : payrolls.length === 0 ? (
            <div className="pay-empty">No payroll records found.</div>
          ) : (
            <div className="pay-table-wrap" role="region" aria-label="Payroll table">
              <table className="pay-table">
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
                      <td className="pay-name">{p.userId?.name || "Unknown"}</td>
                      <td className="pay-email">{p.userId?.email || "Unknown"}</td>
                      <td className="pay-month">{p.month || "—"}</td>
                      <td className="pay-salary">{p.salary != null ? p.salary : "—"}</td>
                      <td>
                        <span className={`pay-status ${String(p.status || "unknown").toLowerCase()}`}>
                          {p.status || "Unknown"}
                        </span>
                      </td>
                      <td className="pay-actions">
                        {p.status === "Pending" ? (
                          <>
                            <button
                              className="btn btn-approve"
                              onClick={() => handleStatusChange(p._id, "Approved")}
                              disabled={updatingId === p._id}
                            >
                              {updatingId === p._id ? "..." : "Approve"}
                            </button>
                            <button
                              className="btn btn-reject"
                              onClick={() => handleStatusChange(p._id, "Rejected")}
                              disabled={updatingId === p._id}
                            >
                              {updatingId === p._id ? "..." : "Reject"}
                            </button>
                          </>
                        ) : (
                          <span className="pay-dash">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
