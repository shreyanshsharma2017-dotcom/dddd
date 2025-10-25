import React, { useEffect, useState } from "react";
import { Briefcase, List, Users } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import "./overview.css";

export default function Overview({ projectId }) {
  console.log("Project ID:", projectId); // Will log the correct ID
  const [stats, setStats] = useState(null);
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
  const [newMember, setNewMember] = useState({ name: "", email: "" });

  const COLORS = ["#4caf50", "#1976d2", "#ff9800"];

  // Fetch overview stats
  useEffect(() => {
    fetch("http://localhost:5000/admin/overview-stats")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        if (data.tasks) {
          setPieData([
            { name: "Completed", value: data.tasks.completed },
            { name: "In Progress", value: data.tasks.inProgress },
            { name: "Pending", value: data.tasks.pending },
          ]);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // Fetch project members
  const fetchProjectMembers = async () => {
    setMembersLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/admin/projects/${projectId}/members`
      );
      const data = await res.json();
      if (data.success) setMembers(data.members);
      else setMembersError("Failed to load members");
    } catch (err) {
      setMembersError(err.message);
    } finally {
      setMembersLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchProjectMembers();
  }, [projectId]);

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch("http://localhost:5000/admin/progress");
        const data = await res.json();
        if (data.success) setTasks(data.tasks);
        else setTasksError("Failed to load tasks");
      } catch (err) {
        setTasksError(err.message);
      } finally {
        setTasksLoading(false);
      }
    };
    fetchTasks();
  }, []);

  // Add new member to project
  const addNewMember = async () => {
    if (!projectId) return alert("Project ID is missing!");
    try {
      const res = await fetch(
        `http://localhost:5000/admin/projects/${projectId}/add-member`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newMember),
        }
      );
      const data = await res.json();
      if (data.success) {
        alert("✅ Member added!");
        setNewMember({ name: "", email: "" });
        fetchProjectMembers();
      } else alert("❌ " + data.message);
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <>
    <div className="overview-container">
      {/* Top Stats Cards */}
      <div className="overview-stats">
        <div className="stat-card">
          <h3>Total Projects</h3>
          <p className="stat-number">{stats?.projects?.total || 0}</p>
          <p className="stat-label">{stats?.projects?.completed || 0} Completed</p>
          <Briefcase className="stat-icon" />
        </div>

        <div className="stat-card">
          <h3>Total Tasks</h3>
          <p className="stat-number">{stats?.tasks?.total || 0}</p>
          <p className="stat-label">{stats?.tasks?.completed || 0} Completed</p>
          <List className="stat-icon" />
        </div>

        <div className="stat-card">
          <h3>Total Members</h3>
          <p className="stat-number">{stats?.members?.total || 0}</p>
          <p className="stat-label">{stats?.members?.completed || 0} Completed</p>
          <Users className="stat-icon" />
        </div>
      </div>

      {/* Add Member Section */}
      <div className="add-member-section bg-white p-6 rounded-2xl shadow-md border border-gray-100 max-w-2xl">
        <h4 className="text-xl font-semibold text-gray-800 mb-4">Add New Member</h4>

        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative w-full md:w-1/3">
            <input
              type="text"
              id="memberName"
              value={newMember.name}
              onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
              placeholder="Full Name"
              className="peer w-full border border-gray-300 rounded-xl px-4 py-2 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <label
              htmlFor="memberName"
              className="absolute left-3 -top-2.5 bg-white px-1 text-gray-500 text-sm transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-gray-500"
            >
              Full Name
            </label>
          </div>

          <div className="relative w-full md:w-1/3">
            <input
              type="email"
              id="memberEmail"
              value={newMember.email}
              onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
              placeholder="Email Address"
              className="peer w-full border border-gray-300 rounded-xl px-4 py-2 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <label
              htmlFor="memberEmail"
              className="absolute left-3 -top-2.5 bg-white px-1 text-gray-500 text-sm transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-gray-500"
            >
              Email Address
            </label>
          </div>

          <button
            onClick={addNewMember}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2 rounded-xl shadow-sm transition-all duration-200"
          >
            Add & Assign
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="overview-grid">
        {/* Team Members */}
        <div className="card">
          <h3>Team Members</h3>
          {membersLoading && <p>Loading...</p>}
          {membersError && <p style={{ color: "red" }}>{membersError}</p>}
          {!membersLoading && !membersError && (
            <div className="scrollable-list">
              <ul>
                {members.map((m) => (
                  <li key={m._id}>
                    {m.name} — <span>{m.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Progress Track */}
        <div className="card">
          <h3>Progress Track</h3>
          {tasksLoading && <p>Loading tasks...</p>}
          {tasksError && <p style={{ color: "red" }}>{tasksError}</p>}
          {!tasksLoading && !tasksError && tasks.length > 0 && (
            <ul>
              {tasks.map((t) => (
                <li key={t._id}>
                  {t.name} — {t.progress}%
                  <div
                    className="progress-bar"
                    style={{ width: `${t.progress}%` }}
                  ></div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Task Overview Pie Chart */}
        <div className="card">
          <h3>Task Overview</h3>
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
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
