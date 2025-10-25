import React, { useState, useEffect } from "react";
import {
  Users, Calendar, Clock, DollarSign, Megaphone,
  Settings as SettingsIcon, HelpCircle, LogOut, User
} from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from "recharts";
import "./dashboard.css";


const sidebarOptions = [
  { label: "Employee Directory", icon: <Users size={18} /> },
  { label: "Leave Requests", icon: <Calendar size={18} /> },
  { label: "Attendance", icon: <Clock size={18} /> },
  { label: "Payroll", icon: <DollarSign size={18} /> },
  { label: "Announcements", icon: <Megaphone size={18} /> },
  { label: "Analytics & Report", icon: <SettingsIcon size={18} /> },
  { label: "Settings", icon: <SettingsIcon size={18} /> },
  { label: "Help & FAQ", icon: <HelpCircle size={18} /> },
  { label: "Log Out", icon: <LogOut size={18} /> },
];

const COLORS = ["#4f46e5", "#ef4444", "#f59e0b", "#10b981", "#06b6d4"];

export default function Dashboard({ user, onLogout, onupdateUser }) {
  const [active, setActive] = useState("Analytics & Report");

  // Data states
  const [employees, setEmployees] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [attendanceList, setAttendanceList] = useState([]);
  const [payroll, setPayroll] = useState(null);
  const [payrollList, setPayrollList] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [settings, setSettings] = useState(null);
  const [faq, setFaq] = useState([]);

  // Profile states
  const [profileOpen, setProfileOpen] = useState(false);
 const [profileForm, setProfileForm] = useState({
  firstName: user?.firstName || "",
  lastName: user?.lastName || "",
  email: user?.email || "",
  phone: user?.phone || "",
  address: user?.address || "",
  avatar: user?.avatar || "",
});

// Sync profile form whenever user updates
useEffect(() => {
  if (user) {
    setProfileForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
      avatar: user.avatar || "",
    });
  }
}, [user]);

const handleSave = async () => {
  try {
    const res = await fetch(`http://localhost:5000/users/${user._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profileForm),
    });

    const data = await res.json();

    if (!data.success) {
      console.error("❌ Update failed:", data.message);
      return;
    }
    
    const updatedUser = data.user;
    onupdateUser(updatedUser); // update parent state
    localStorage.setItem("user", JSON.stringify(updatedUser)); // update localStorage
    setProfileOpen(false);
    console.log("✅ User updated:", updatedUser);
  } catch (err) {
    console.error("❌ Network error:", err);
  }
};

  // Forms
  const [leaveForm, setLeaveForm] = useState({ type: "Annual", from: "", to: "" });
  const [attendanceForm, setAttendanceForm] = useState({ present: "", absent: "", late: "" });
  const [payrollForm, setPayrollForm] = useState({ basic: "", allowances: "", deductions: "" });
  const [announcementForm, setAnnouncementForm] = useState({ message: "" });
  const [settingsForm, setSettingsForm] = useState({ notifications: false, theme: "light" });
  
  
  // Fetch helpers
  const fetchEmployees = async () => {
    try {
      let url = `http://localhost:5000/employees`;
      if (user?.role !== "admin") url = `http://localhost:5000/employees?email=${user?.email}`;
      const res = await fetch(url);
      const data = await res.json();
      setEmployees(data.employees || (user ? [user] : []));
    } catch (e) { setEmployees(user ? [user] : []); }
  };

  // ================= Fetch functions =================
  const fetchLeaveRequests = async () => {
    // admin: fetch all leave requests
    try {
      const adminUser = JSON.parse(localStorage.getItem("user"));
      const res = await fetch("http://localhost:5000/admin/leave-requests", {
        headers: {
          "Content-Type": "application/json",
          userId: adminUser?._id,
        },
      });
      const data = await res.json();
      if (data.success) setLeaveRequests(data.leaveRequests || []);
    } catch (err) {
      console.error("Error fetching leave requests:", err);
    }
  };

  const fetchUserLeaveRequests = async () => {
    // user: fetch only their own leave requests
    try {
      const res = await fetch(`http://localhost:5000/leave-request/${user._id}`);
      const data = await res.json();
      if (data.success) setLeaveRequests(data.leaves || []);
    } catch (err) {
      console.error("Error fetching user leave requests:", err);
    }
  };

  // ================= useEffect =================
  useEffect(() => {
    if (!user) return;

    if (active === "Leave Requests") {
      if (user.role === "admin") fetchLeaveRequests();
      else fetchUserLeaveRequests();
    }
  }, [active, user]);

  

  const fetchAttendance = async () => {
    try {
      const res = await fetch(`http://localhost:5000/attendance?email=${user?.email}`);
      const data = await res.json();
      setAttendance(data.attendance || null);
    } catch (e) { console.error(e); }
  };

  const fetchAttendanceList = async () => {
    try {
      const res = await fetch(`http://localhost:5000/attendance/all`);
      const data = await res.json();
      setAttendanceList(data.attendance || []);
    } catch (e) {}
  };

  const fetchPayroll = async () => {
    try {
      const res = await fetch(`http://localhost:5000/payroll?email=${user?.email}`);
      const data = await res.json();
      setPayroll(data.payroll || null);
    } catch (e) { console.error(e); }
  };

  const fetchPayrollList = async () => {
    try {
      const res = await fetch(`http://localhost:5000/payroll?email=${user?.email}`);
      const data = await res.json();
      setPayrollList(data.payroll || []);
    } catch (e) {}
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch(`http://localhost:5000/announcements`);
      const data = await res.json();
      setAnnouncements(data.announcements || []);
    } catch (e) { console.error(e); }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`http://localhost:5000/analytics?email=${user?.email}`);
      const data = await res.json();
      setAnalytics(data.analytics || null);
    } catch (e) { console.error(e); }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch(`http://localhost:5000/settings?email=${user?.email}`);
      const data = await res.json();
      setSettings(data.settings || null);
      if (data.settings) setSettingsForm({ notifications: data.settings.notifications, theme: data.settings.theme || "light" });
    } catch (e) { console.error(e); }
  };

  const fetchFaq = async () => {
    try {
      const res = await fetch(`http://localhost:5000/faq`);
      const data = await res.json();
      setFaq(data.faq || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (!user) return;
    switch (active) {
      case "Analytics & Report": fetchAnalytics(); break;
      case "Employee Directory": fetchEmployees(); break;
      case "Leave Requests": fetchLeaveRequests(); break;
      case "Attendance": fetchAttendance(); fetchAttendanceList(); break;
      case "Payroll": fetchPayroll(); fetchPayrollList(); break;
      case "Announcements": fetchAnnouncements(); break;
      case "Settings": fetchSettings(); break;
      case "Help & FAQ": fetchFaq(); break;
      default: break;
    }
  }, [active, user]);

  

  // Analytics and charts
  const analyticsSafe = analytics || { 
    totalEmployees: (employees.length || 1), 
    leavesTaken: leaveRequests.length || 0, 
    attendanceRate: (attendance?.present ? Math.round((attendance.present / (attendance.present + attendance.absent + attendance.late || 1)) * 100) : 88), 
    payrollProcessed: (payrollList.reduce((s, p) => s + (p.net || 0), 0) || 0) 
  };
  const attendanceChart = [
    { name: "Present", value: analyticsSafe.attendanceRate },
    { name: "Absent", value: 100 - analyticsSafe.attendanceRate }
  ];
  const payrollChart = payrollList.slice(-6).map((p, i) => ({ name: p.month || `P${i+1}`, payroll: p.net || ((p.basic||0)+(p.allowances||0)-(p.deductions||0)) }));

  // Submit helpers (Leave, Attendance, Payroll, Announcement)
  const submitLeaveRequest = async e => {
    e.preventDefault();
    await fetch("http://localhost:5000/leave-request", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ userId: user?._id, email: user?.email, ...leaveForm })
    });
    setLeaveForm({ type:"Annual",from:"",to:"" });
    await fetchLeaveRequests();
  };

  const submitAttendance = async e => {
    e.preventDefault();
    await fetch("http://localhost:5000/attendance", {
      method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ email:user?.email,...attendanceForm })
    });
    setAttendanceForm({ present:"",absent:"",late:"" }); await fetchAttendance(); await fetchAttendanceList();
  };

  const submitPayroll = async e => {
    e.preventDefault();
    await fetch("http://localhost:5000/payroll", {
      method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ email:user?.email,...payrollForm })
    });
    setPayrollForm({ basic:"",allowances:"",deductions:"" }); await fetchPayroll(); await fetchPayrollList();
  };

  const submitAnnouncement = async e => {
    e.preventDefault();
    await fetch("http://localhost:5000/announcements", {
      method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ ...announcementForm })
    });
    setAnnouncementForm({ message:"" }); await fetchAnnouncements();
  };

  const submitSettings = async e => {
    e.preventDefault();
    await fetch("http://localhost:5000/settings", {
      method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ email:user?.email,...settingsForm })
    });
    await fetchSettings();
  };

  // Delete helpers
  const deleteLeave = async id => { if(window.confirm("Delete this leave?")){await fetch(`http://localhost:5000/leave-requests/${id}`,{method:"DELETE"}); await fetchLeaveRequests();}};
  const deleteAttendance = async id => { if(window.confirm("Delete this attendance?")){await fetch(`http://localhost:5000/attendance/${id}`,{method:"DELETE"}); await fetchAttendance(); await fetchAttendanceList();}};
  const deletePayroll = async id => { if(window.confirm("Delete this payroll?")){await fetch(`http://localhost:5000/payroll/${id}`,{method:"DELETE"}); await fetchPayroll(); await fetchPayrollList();}};
  const deleteAnnouncement = async id => { if(window.confirm("Delete this announcement?")){await fetch(`http://localhost:5000/announcements/${id}`,{method:"DELETE"}); await fetchAnnouncements();}};

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">Company HRMS</div>
        <div className="sidebar-list">
          {sidebarOptions.map(opt=>(
            <button key={opt.label} className={active===opt.label?"active":""} onClick={()=>{ if(opt.label==="Log Out") onLogout(); else setActive(opt.label) }}>
              <span className="icon">{opt.icon}</span><span className="label">{opt.label}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        <header>
          <input className="search" placeholder="Search..." />
          <div className="user-block">
            <div className="greeting">Hi, <strong>{user?.firstName}</strong></div>
            <div className="role">{user?.role==="admin"?"Admin":"Employee"}</div>
            <User size={36} className="avatar" onClick={()=>setProfileOpen(true)} style={{cursor:"pointer"}}/>
          </div>
        </header>

        {/* Stats */}
        <section className="stats-grid">
          <div className="stat-card"><div className="stat-value">{analyticsSafe.totalEmployees}</div><div className="stat-label">Total Employees</div></div>
          <div className="stat-card"><div className="stat-value">{analyticsSafe.attendanceRate}%</div><div className="stat-label">Attendance Rate</div></div>
          <div className="stat-card"><div className="stat-value">${analyticsSafe.payrollProcessed}</div><div className="stat-label">Payroll Processed</div></div>
          <div className="stat-card"><div className="stat-value">{analyticsSafe.leavesTaken}</div><div className="stat-label">Leaves Taken</div></div>
        </section>

        {/* Content Grid */}
        <section className="content-grid">
          <div className="col-left">
            {active==="Employee Directory" && (
              <div className="widget-card">
                <h3>Employee Directory</h3>
                <table>
                  <thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead>
                  <tbody>{employees.map(emp=>(
                    <tr key={emp._id||emp.email}><td>{emp.firstName} {emp.lastName}</td><td>{emp.email}</td><td>{emp.role}</td></tr>
                  ))}</tbody>
                </table>
              </div>
            )}

            {active==="Leave Requests" && (
              <div className="widget-card">
                <h3>Leave Requests</h3>
                <form onSubmit={submitLeaveRequest}>
                  <div className="form-row">
                    <label>Type</label>
                    <select value={leaveForm.type} onChange={e=>setLeaveForm(f=>({...f,type:e.target.value}))}>
                      <option>Annual</option><option>Sick</option><option>Unpaid</option>
                    </select>
                  </div>
                  <div className="form-row">
                    <label>From</label><input type="date" value={leaveForm.from} onChange={e=>setLeaveForm(f=>({...f,from:e.target.value}))}/>
                    <label>To</label><input type="date" value={leaveForm.to} onChange={e=>setLeaveForm(f=>({...f,to:e.target.value}))}/>
                  </div>
                  <div className="form-row"><button className="submit">Submit Request</button></div>
                </form>
                <div className="list">{leaveRequests.length===0?<div className="muted">No leave requests</div>:
                  leaveRequests.map(lr=>(<div key={lr._id} className="list-row"><div>{lr.type} — {lr.from} → {lr.to}</div><div className="row-actions"><span className="status">{lr.status||"Pending"}</span><button className="delete" onClick={()=>deleteLeave(lr._id)}>Delete</button></div></div>))
                }</div>
              </div>
            )}

            {active==="Attendance" && (
              <div className="widget-card">
                <h3>Attendance</h3>
                <form onSubmit={submitAttendance} className="attendance-form">
                  <div className="form-row">
                    <label>Present</label><input type="number" value={attendanceForm.present} onChange={e=>setAttendanceForm(f=>({...f,present:+e.target.value}))}/>
                    <label>Absent</label><input type="number" value={attendanceForm.absent} onChange={e=>setAttendanceForm(f=>({...f,absent:+e.target.value}))}/>
                    <label>Late</label><input type="number" value={attendanceForm.late} onChange={e=>setAttendanceForm(f=>({...f,late:+e.target.value}))}/>
                  </div>
                  <div className="form-row"><button className="submit">Save Attendance</button></div>
                </form>
                <div className="list">{attendanceList.length===0?<div className="muted">No attendance records</div>:
                  attendanceList.map(a=>(<div key={a._id} className="list-row"><div>{a.name||a.email||"Record"} — P:{a.present} A:{a.absent} L:{a.late}</div><div className="row-actions"><button className="delete" onClick={()=>deleteAttendance(a._id)}>Delete</button></div></div>))
                }</div>
              </div>
            )}

            {active==="Payroll" && (
              <div className="widget-card">
                <h3>Payroll</h3>
                <form onSubmit={submitPayroll}>
                  <div className="form-row">
                    <label>Basic</label><input type="number" value={payrollForm.basic} onChange={e=>setPayrollForm(f=>({...f,basic:+e.target.value}))}/>
                    <label>Allowances</label><input type="number" value={payrollForm.allowances} onChange={e=>setPayrollForm(f=>({...f,allowances:+e.target.value}))}/>
                    <label>Deductions</label><input type="number" value={payrollForm.deductions} onChange={e=>setPayrollForm(f=>({...f,deductions:+e.target.value}))}/>
                  </div>
                  <div className="form-row"><button className="submit">Save Payroll</button></div>
                </form>
                <div className="list">{payrollList.length===0?<div className="muted">No payroll records</div>:
                  payrollList.map(p=>(<div key={p._id} className="list-row"><div>{p.month||p._id} — Net: ${p.net||((p.basic||0)+(p.allowances||0)-(p.deductions||0))}</div><div className="row-actions"><button className="delete" onClick={()=>deletePayroll(p._id)}>Delete</button></div></div>))
                }</div>
              </div>
            )}

            {active==="Announcements" && (
              <div className="widget-card">
                <h3>Announcements</h3>
                <form onSubmit={submitAnnouncement}>
                  <div className="form-row">
                    <input placeholder="Write announcement..." value={announcementForm.message} onChange={e=>setAnnouncementForm({message:e.target.value})}/>
                    <button className="submit">Post</button>
                  </div>
                </form>
                <div className="list">{announcements.length===0?<div className="muted">No announcements</div>:
                  announcements.map(a=>(<div key={a._id||a.date} className="list-row"><div>{a.message}</div><div className="row-actions"><button className="delete" onClick={()=>deleteAnnouncement(a._id)}>Delete</button></div></div>))
                }</div>
              </div>
            )}

            {active==="Settings" && (
              <div className="widget-card">
                <h3>Settings</h3>
                <form onSubmit={submitSettings}>
                  <div className="form-row">
                    <label>Notifications</label>
                    <input type="checkbox" checked={settingsForm.notifications} onChange={e=>setSettingsForm(s=>({...s,notifications:e.target.checked}))}/>
                  </div>
                  <div className="form-row">
                    <label>Theme</label>
                    <select value={settingsForm.theme} onChange={e=>setSettingsForm(s=>({...s,theme:e.target.value}))}>
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </div>
                  <div className="form-row"><button className="submit">Save Settings</button></div>
                </form>
                <div className="muted">Saved settings will apply to your account.</div>
              </div>
            )}

            {active==="Help & FAQ" && (
              <div className="widget-card">
                <h3>Help & FAQ</h3>
                <div className="list">{faq.length===0?<div className="muted">No FAQ items</div>:
                  faq.map(f=>(<div key={f._id} className="list-row"><div className="faq-q">{f.question}</div><div className="faq-a muted">{f.answer}</div></div>))
                }</div>
              </div>
            )}
          </div>

          {/* Middle charts */}
          <div className="col-mid">
            <div className="widget-card">
              <h3>Attendance Overview</h3>
              <div style={{height:280}}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={attendanceChart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                      {attendanceChart.map((entry, idx)=><Cell key={idx} fill={COLORS[idx % COLORS.length]}/>)}
                    </Pie>
                    <Tooltip/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="widget-card">
              <h3>Payroll History</h3>
              <div style={{height:280}}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={payrollChart.length?payrollChart:[{name:"No Data",payroll:0}]}>
                    <CartesianGrid strokeDasharray="3 3"/>
                    <XAxis dataKey="name"/>
                    <YAxis/>
                    <Tooltip/>
                    <Bar dataKey="payroll" fill={COLORS[0]} radius={[6,6,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="col-right">
            <div className="widget-card">
              <h3>Quick Actions</h3>
              <div className="quick-list">
                <button className="submit" onClick={()=>setActive("Leave Requests")}>New Leave</button>
                <button className="submit" onClick={()=>setActive("Attendance")}>Mark Attendance</button>
                <button className="submit" onClick={()=>setActive("Payroll")}>Run Payroll</button>
              </div>
            </div>

            <div className="widget-card">
              <h3>Announcements</h3>
              <ul>{announcements.slice(0,5).map(a=><li key={a._id}>{a.message}</li>)}
              {announcements.length===0 && <li className="muted">No announcements</li>}
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* Profile modal */}
      {profileOpen && (
        <div className="profile-modal" onClick={() => setProfileOpen(false)}>
          <div className="profile-card" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Profile</h3>
            <div className="avatar-preview-container">
              <img
                src={profileForm.avatar || "/default-avatar.png"}
                alt="avatar"
                className="avatar-preview"
                onError={(e) => (e.target.src = "/default-avatar.png")}
              />
            </div>
            {/* File upload */}
            <label>
              Upload Avatar:
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () =>
                      setProfileForm((f) => ({ ...f, avatar: reader.result }));
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
            {/* URL option */}
            <label>
              Avatar URL:
              <input
                type="text"
                placeholder="Enter image URL"
                value={profileForm.avatar || ""}
                onChange={(e) =>
                  setProfileForm((f) => ({ ...f, avatar: e.target.value }))
                }
              />
            </label>
            {/* ...existing profile fields and save button... */}
            <div className="form-row"><label>First Name</label><input value={profileForm.firstName} onChange={e=>setProfileForm(f=>({...f,firstName:e.target.value}))}/></div>
            <div className="form-row"><label>Last Name</label><input value={profileForm.lastName} onChange={e=>setProfileForm(f=>({...f,lastName:e.target.value}))}/></div>
            <div className="form-row"><label>Email</label><input value={profileForm.email} onChange={e=>setProfileForm(f=>({...f,email:e.target.value}))}/></div>
            <div className="form-row"><label>Phone</label><input value={profileForm.phone} onChange={e=>setProfileForm(f=>({...f,phone:e.target.value}))}/></div>
            <div className="form-row"><label>Address</label><input value={profileForm.address} onChange={e=>setProfileForm(f=>({...f,address:e.target.value}))}/></div>
            <div className="form-row"><button className="submit" onClick={handleSave}>Save</button></div>
          </div>
        </div>
    )}
    </div>
  );
}
