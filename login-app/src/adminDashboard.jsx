import React, { useEffect, useState } from "react";
import {
  Users,
  Calendar,
  Clock,
  DollarSign,
  Megaphone,
  Settings as SettingsIcon,
  HelpCircle,
  LogOut,
} from "lucide-react";
import Overview from "./overview.jsx";
import Announcements from "./Announcements.jsx";
import LeaveRequests from "./leaveRequests.jsx";
import Attendance from "./Attendance.jsx";
import Payroll from "./Payroll.jsx";
import Settings from "./Settings.jsx";
import Help from "./help.jsx";
import { useNavigate } from "react-router-dom";

import "./admin.css";

export default function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState("employees");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/admin/projects")
      .then((res) => res.json())
      .then((data) => setProjects(data.projects || []))
      .catch((err) => console.error(err));
  }, []);

  // Check admin status on mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setIsAdmin(user?.role?.toLowerCase() === "admin");
  }, []);

  // Fetch employees when Employee tab is active
  useEffect(() => {
    if (activeTab === "employees" && isAdmin) {
      fetchEmployees();
    }
  }, [activeTab, isAdmin]);
  

  const fetchEmployees = async () => {
    setLoading(true);
    setError("");
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.id) {
        setError("No user ID found. Please log in as admin.");
        setLoading(false);
        return;
      }
      const res = await fetch("http://localhost:5000/admin/employees", {
        headers: {
          "Content-Type": "application/json",
          userId: user.id,
        },
      });
      if (!res.ok) {
        setError("Failed to fetch employees.");
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "No data returned.");
        setEmployees([]);
      } else {
        setEmployees(data.employees || []);
      }
    } catch (err) {
      setError("Error fetching employees: " + err.message);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      const res = await fetch(`http://localhost:5000/admin/users/${id}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", userId: JSON.parse(localStorage.getItem("user"))?.id },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Role updated!");
        fetchEmployees();
      } else {
        alert("Failed to update role");
      }
    } catch (err) {
      console.error("Error updating role:", err);
    }
  };

  const sidebarOptions = [
    { label: "Overview", icon: <Users size={20} />, tab: "overview" },
    { label: "Employee Details", icon: <Users size={20} />, tab: "employees" },
    { label: "Leave Requests", icon: <Calendar size={20} />, tab: "leave" },
    { label: "Attendance", icon: <Clock size={20} />, tab: "attendance" },
    { label: "Payroll", icon: <DollarSign size={20} />, tab: "payroll" },
    { label: "Announcements", icon: <Megaphone size={20} />, tab: "announcements" },
    { label: "Settings", icon: <SettingsIcon size={20} />, tab: "settings" },
    { label: "Help", icon: <HelpCircle size={20} />, tab: "help" },
  ];

  return (
    <>
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="sidebar-title">Admin Panel</h2>
        <ul className="sidebar-list">
          {sidebarOptions.map((item, idx) => (
            <li
              key={idx}
              className={`sidebar-item ${activeTab === item.tab ? "active" : ""}`}
              onClick={() => setActiveTab(item.tab)}
            >
              {item.icon} <span>{item.label}</span>
            </li>
          ))}
          <li className="sidebar-item logout" onClick={onLogout}>
            <LogOut size={20} /> <span>Logout</span>
          </li>
        </ul>
      </aside>
       
    
      {/* Main Content */}
      <main className="main-content">
        <h1 className="main-title">Admin Dashboard</h1>

        {/* Employee Management */}
        {activeTab === "employees" && (
          <div>
            <h2>Employee Management</h2>
            {!isAdmin && <p style={{color:'red'}}>You must be logged in as admin to view this section.</p>}
            {error && <p style={{color:'red'}}>{error}</p>}
            {loading && <p>Loading employees...</p>}
            {!loading && isAdmin && !error && employees.length === 0 && <p>No employees found.</p>}
            {!loading && isAdmin && employees.length > 0 && (
              <table className="employee-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Change Role</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp._id}>
                      <td>
                        {emp.firstName && emp.lastName
                          ? `${emp.firstName} ${emp.lastName}`
                          : emp.name}
                      </td>
                      <td>{emp.email}</td>
                      <td>{emp.role}</td>
                      <td>
                        <select
                          value={emp.role.toLowerCase()}
                          onChange={(e) => handleRoleChange(emp._id, e.target.value)}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        {/* Overview */}
        {activeTab === "overview" && <Overview projectId={selectedProjectId} />}

        {/* Leave Requests */}
        {activeTab === "leave" && <LeaveRequests />}

        {/* Attendance */}
        {activeTab === "attendance" && <Attendance />}

        {/* Payroll */}
        {activeTab === "payroll" && <Payroll />}

        {/* Announcements */}
        {activeTab === "announcements" && <Announcements />}

        {/* Settings */}
        {activeTab === "settings" && <Settings />}

        {/* Help */}
        {activeTab === "help" && < Help/>}
      </main>
    </div>
   </> 
  );
}
