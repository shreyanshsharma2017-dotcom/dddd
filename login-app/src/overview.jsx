import React, { useEffect, useState } from "react";
import { Briefcase, List, Users } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import "./overview.css";

export default function Overview({ projectId }) {
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

  const COLORS = ["#16a34a", "#2563eb", "#f59e0b"];

  useEffect(() => {
    let mounted = true;
    fetch("http://localhost:5000/admin/overview-stats")
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        setStats(data || {});
        const t = data?.tasks || {};
        setPieData([
          { name: "Completed", value: t.completed || 0 },
          { name: "In Progress", value: t.inProgress || 0 },
          { name: "Pending", value: t.pending || 0 },
        ]);
      })
      .catch(() => {
        if (!mounted) return;
        setStats({});
      });
    return () => {
      mounted = false;
    };
  }, []);

  const fetchProjectMembers = async () => {
    setMembersLoading(true);
    setMembersError("");
    try {
      const res = await fetch(
        `http://localhost:5000/admin/projects/${projectId}/members`
      );
      const data = await res.json();
      if (data?.success) setMembers(data.members || []);
      else setMembersError(data?.message || "Failed to load members");
    } catch (err) {
      setMembersError(err?.message || "Failed to load members");
    } finally {
      setMembersLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchProjectMembers();
  }, [projectId]);

  useEffect(() => {
    let mounted = true;
    const fetchTasks = async () => {
      setTasksLoading(true);
      setTasksError("");
      try {
        const res = await fetch("http://localhost:5000/admin/progress");
        const data = await res.json();
        if (!mounted) return;
        if (data?.success) setTasks(data.tasks || []);
        else setTasksError(data?.message || "Failed to load tasks");
      } catch (err) {
        if (!mounted) return;
        setTasksError(err?.message || "Failed to load tasks");
      } finally {
        if (mounted) setTasksLoading(false);
      }
    };
    fetchTasks();
    return () => {
      mounted = false;
    };
  }, []);

  const addNewMember = async () => {
    if (!projectId) return alert("Project ID is missing!");
    if (!newMember.name.trim() || !newMember.email.trim())
      return alert("Please fill both name and email");
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
      if (data?.success) {
        alert("Member added");
        setNewMember({ name: "", email: "" });
        fetchProjectMembers();
      } else {
        alert(data?.message || "Failed to add member");
      }
    } catch (err) {
      alert(err?.message || "Network error");
    }
  };

  return (
    <div className="overview-page" role="region" aria-label="Project overview">
      <div className="overview-container">
        <div className="overview-header">
          <h2 className="page-title">Overview</h2>
          <p className="page-subtitle">Project summary and team progress</p>
        </div>

        <div className="overview-stats" aria-hidden={false}>
          <div className="stat-card">
            <div>
              <div className="stat-title">Projects</div>
              <div className="stat-number">{stats?.projects?.total ?? 0}</div>
              <div className="stat-label">{stats?.projects?.completed ?? 0} completed</div>
            </div>
            <div className="stat-icon-wrap" title="Projects">
              <Briefcase className="stat-icon" />
            </div>
          </div>

          <div className="stat-card">
            <div>
              <div className="stat-title">Tasks</div>
              <div className="stat-number">{stats?.tasks?.total ?? 0}</div>
              <div className="stat-label">{stats?.tasks?.completed ?? 0} completed</div>
            </div>
            <div className="stat-icon-wrap" title="Tasks">
              <List className="stat-icon" />
            </div>
          </div>

          <div className="stat-card">
            <div>
              <div className="stat-title">Members</div>
              <div className="stat-number">{stats?.members?.total ?? 0}</div>
              <div className="stat-label">{stats?.members?.active ?? 0} active</div>
            </div>
            <div className="stat-icon-wrap" title="Members">
              <Users className="stat-icon" />
            </div>
          </div>
        </div>

        <div className="add-and-grid">
          <aside className="add-member-section" aria-label="Add member">
            <h4>Add New Member</h4>
            <p className="muted">Invite a team member and assign them to this project</p>
            <div className="add-member-row">
              <input
                type="text"
                aria-label="Full name"
                placeholder="Full name"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
              />
              <input
                type="email"
                aria-label="Email address"
                placeholder="Email address"
                value={newMember.email}
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
              />
              <button onClick={addNewMember} className="btn-primary">
                Add & Assign
              </button>
            </div>
          </aside>

          <main className="overview-grid" aria-live="polite">
            <section className="card" aria-labelledby="team-members-heading">
              <h4 id="team-members-heading">Team Members</h4>
              {membersLoading && <div className="muted">Loading members…</div>}
              {membersError && <div className="error">{membersError}</div>}
              {!membersLoading && !membersError && (
                <div className="scrollable">
                  <ul>
                    {members.length === 0 && <li className="muted">No members found</li>}
                    {members.map((m) => (
                      <li key={m._id} className="member-row">
                        <div className="member-left">
                          <div className="member-avatar" aria-hidden>
                            {m.name ? m.name.charAt(0).toUpperCase() : "?"}
                          </div>
                          <div className="member-meta">
                            <div className="member-name">{m.name || "Unnamed"}</div>
                            <div className="member-email">{m.email || "—"}</div>
                          </div>
                        </div>
                        <div className={`member-badge ${m.status?.toLowerCase() || "unknown"}`}>
                          {m.status || "Unknown"}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            <section className="card" aria-labelledby="progress-heading">
              <h4 id="progress-heading">Progress Track</h4>
              {tasksLoading && <div className="muted">Loading tasks…</div>}
              {tasksError && <div className="error">{tasksError}</div>}
              {!tasksLoading && !tasksError && (
                <div className="scrollable">
                  <ul>
                    {tasks.length === 0 && <li className="muted">No tasks found</li>}
                    {tasks.map((t) => (
                      <li key={t._id} className="task-item">
                        <div className="task-head">
                          <div className="task-name">{t.name}</div>
                          <div className="task-percent">{t.progress ?? 0}%</div>
                        </div>
                        <div className="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={t.progress ?? 0}>
                          <div
                            className="progress-fill"
                            style={{ width: `${Math.max(0, Math.min(100, t.progress || 0))}%` }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            <section className="card" aria-labelledby="pie-heading">
              <h4 id="pie-heading">Task Overview</h4>
              <div className="chart-wrap" role="img" aria-label="Tasks distribution chart">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={40}
                      paddingAngle={4}
                    >
                      {pieData.map((entry, idx) => (
                        <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="legend">
                {pieData.map((p, i) => (
                  <div key={p.name} className="legend-item">
                    <span className="legend-swatch" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="legend-label">{p.name}</span>
                    <span className="legend-value">{p.value}</span>
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
