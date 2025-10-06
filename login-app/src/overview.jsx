import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Overview() {
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [membersError, setMembersError] = useState("");

  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState("");
   const [pieData, setPieData] = useState([
    { name: "Completed", value: 0 },
    { name: "In Progress", value: 0 },
    { name: "Pending", value: 0 },
  ]);

  // Fetch Team Members
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch("http://localhost:5000/admin/team-members");
        const data = await res.json();
        if (data.success) {
          setMembers(data.members);
        } else {
          setMembersError("Failed to load members");
        }
      } catch (err) {
        setMembersError("Error fetching members: " + err.message);
      } finally {
        setMembersLoading(false);
      }
    };
    fetchMembers();
  }, []);

  // Fetch Progress Tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch("http://localhost:5000/admin/progress");
        const data = await res.json();
        if (data.success) {
          setTasks(data.tasks);
        } else {
          setTasksError("Failed to load tasks");
        }
      } catch (err) {
        setTasksError("Error fetching tasks: " + err.message);
      } finally {
        setTasksLoading(false);
      }
    };
    fetchTasks();
  }, []);

  // Assign Member Handler
  const assignMember = async (taskId, memberId) => {
    try {
      const res = await fetch("http://localhost:5000/admin/assign-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, memberId }),
      });

      const data = await res.json();
      if (data.success) {
        alert("✅ Member assigned successfully!");
      } else {
        alert("❌ Failed to assign member: " + data.message);
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };
  
  const COLORS = ["#4caf50", "#1976d2", "#ff9800"];

  return (
    <div>
      <h2>Overview</h2>

      <div
        className="overview-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
          marginTop: "1rem",
        }}
      >
        {/* Team Members Card */}
        <div className="card">
          <div className="card-header d-flex justify-content-between">
            <h3>Team Members</h3>
            <button className="see-all">See all</button>
          </div>

          {membersLoading && <p>Loading members...</p>}
          {membersError && <p style={{ color: "red" }}>{membersError}</p>}

          {!membersLoading && !membersError && (
            <div
              style={{
                maxHeight: "350px",
                overflowY: "auto",
                border: "1px solid #eee",
                marginBottom: "1rem",
              }}
            >
              <ul className="team-list">
                {members.map((member) => (
                  <li
                    key={member._id}
                    className="team-member"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.5rem 0",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <div
                        className="avatar"
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          backgroundColor: "#ccc",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: "10px",
                        }}
                      >
                        {member.name ? member.name.charAt(0) : "?"}
                      </div>
                      <div className="info">
                        <p className="name">{member.name}</p>
                        <p className="status">
                          <span
                            className="status-dot"
                            style={{
                              display: "inline-block",
                              width: "10px",
                              height: "10px",
                              borderRadius: "50%",
                              backgroundColor:
                                member.status === "online"
                                  ? "green"
                                  : member.status === "in a meeting"
                                  ? "orange"
                                  : "red",
                              marginRight: "5px",
                            }}
                          ></span>
                          {member.status}
                        </p>
                      </div>
                    </div>
                    <button
                      className={`action-btn ${
                        member.status === "offline" ? "invite" : "message"
                      }`}
                    >
                      {member.status === "offline" ? "Invite" : "Message"}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Progress Track Card */}
        <div className="card">
          <div className="card-header d-flex justify-content-between">
            <h3>Progress Track</h3>
            <button className="see-all">View All</button>
          </div>
          <div className="card-body" style={{ padding: "1rem" }}>
            {tasksLoading && <p>Loading tasks...</p>}
            {tasksError && <p style={{ color: "red" }}>{tasksError}</p>}
            {!tasksLoading && !tasksError && tasks.length === 0 && (
              <p>No tasks found.</p>
            )}

            {!tasksLoading &&
              !tasksError &&
              tasks.map((item) => (
                <div key={item._id} style={{ marginBottom: "1.5rem" }}>
                  {/* Task Header */}
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>{item.name}</span>
                    <span>{item.progress}%</span>
                  </div>

                  {/* 🧑 Assign Member Dropdown */}
                  <select
                    style={{
                      width: "100%",
                      marginTop: "8px",
                      padding: "5px",
                      borderRadius: "5px",
                    }}
                    onChange={(e) => {
                      const memberId = e.target.value;
                      if (memberId) assignMember(item._id, memberId);
                    }}
                    defaultValue=""
                  >
                    <option value="">Assign Member</option>
                    {members.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name}
                      </option>
                    ))}
                  </select>

                  {/* Progress Bar */}
                  <div
                    style={{
                      background: "#eee",
                      borderRadius: "5px",
                      height: "8px",
                      marginTop: "5px",
                    }}
                  >
                    <div
                      style={{
                        width: `${item.progress}%`,
                        background: "#4caf50",
                        height: "100%",
                        borderRadius: "5px",
                      }}
                    ></div>
                  </div>
                </div>
              ))}
          
          </div>
        {/* Pie Chart for Task Overview */}
      <div style={{ width: "100%", height: 250 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {pieData.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
        </div>
      </div>
    </div>
  );
}
