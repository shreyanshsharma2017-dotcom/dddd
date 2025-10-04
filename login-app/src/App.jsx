import { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import logo from "./assets/nadah logo.jpg";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import ProjectImg from "./assets/project.png";
import CollabIcons from "./assets/collab.png";
import "./App.css";
import Dashboard from "./dashboard.jsx";
import AdminDashboard from "./adminDashboard.jsx";

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        // Ensure _id is present
        const userObj = { ...data.user, _id: data.user._id || data.user.id };
        localStorage.setItem("user", JSON.stringify(userObj));
        setUser(userObj);
        if (userObj.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to server");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });
      const data = await res.json();
      alert(data.message);
      if (data.success) setActiveTab("login");
    } catch (err) {
      console.error(err);
      alert("Error registering user");
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    const newPassword = prompt("Enter new password:");
    if (!newPassword) return;
    try {
      const res = await fetch("http://localhost:5000/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });
      const data = await res.json();
      alert(data.message);
      if (data.success) setActiveTab("login");
    } catch (err) {
      console.error(err);
      alert("Error resetting password");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="app">
            {/* Navbar */}
            <header className="navbar">
              <img src={logo} alt="Logo" className="logo" />
              <nav>
                <a href="#" onClick={() => setActiveTab("home")}>Home</a>
                <a href="#" onClick={() => setActiveTab("about")}>About Us</a>
                <a href="#" onClick={() => setActiveTab("services")}>Services</a>
                <a href="#" onClick={() => setActiveTab("contact")}>Contact</a>
              </nav>
              <div className="nav-buttons">
                <button className="btn btn-outline" onClick={() => setActiveTab("login")}>Login</button>
                <button className="btn btn-accent" onClick={() => setActiveTab("register")}>Register</button>
              </div>
            </header>

            {/* Main Content */}
            <main>
              {activeTab === "home" && (
                <>
                  <section className="hero">
                    <div className="hero-text">
                      <h1>Welcome to <span>nadahweb</span> Solutions</h1>
                      <p>Your trusted partner in cyber defense, surveillance, and enterprise security.</p>
                      <button className="btn btn-primary" onClick={() => setActiveTab("register")}>Get Started</button>
                    </div>
                    <div className="hero-image">
                      {/* <img src="./assets/hero-illustration.png" alt="Hero" /> */}
                      <DotLottieReact
                        src="https://lottie.host/53b63b3a-600f-4661-9c1b-2a92db20adbb/XZCNy2RYs6.lottie"
                        loop
                        autoplay
                      />
                    </div>
                  </section>

                  <section className="section project">
                    <div className="text">
                      <h2>Project Management</h2>
                      <p>Seamlessly manage your projects with real-time collaboration tools and robust security features.</p>
                      <button className="btn btn-primary">Learn More</button>
                    </div>
                    <div className="image">
                      <img src={ProjectImg} alt="Project" />
                    </div>
                  </section>

                  <section className="section collaborate">
                    <h2>Work together</h2>
                    <p>Foster a collaborative environment while maintaining top-level security across your teams.</p>
                    <div className="collab-icons">
                      <img src={CollabIcons} alt="Collab" />
                    </div>
                    <button className="btn btn-primary">Read More</button>
                  </section>
                </>
              )}

              {activeTab === "login" && (
                <div className="auth-box">
                  <h1>Login</h1>
                  <form onSubmit={handleLogin}>
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <button type="submit" className="btn btn-primary">Login</button>
                  </form>
                  <p className="link" onClick={() => setActiveTab("forgot")}>Forgot Password?</p>
                </div>
              )}

              {activeTab === "register" && (
                <div className="auth-box">
                  <h1>Create Account</h1>
                  <form onSubmit={handleRegister}>
                    <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                    <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <button type="submit" className="btn btn-primary">Register</button>
                  </form>
                </div>
              )}

              {activeTab === "forgot" && (
                <div className="auth-box">
                  <h1>Reset Password</h1>
                  <form onSubmit={handleForgot}>
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <button type="submit" className="btn btn-primary">Reset</button>
                  </form>
                </div>
              )}
            </main>
          </div>
        }
      />

      <Route
  path="/dashboard"
  element={
    <Dashboard
      user={user}
      onupdateUser={(updatedUser) => {
        // update state
        setUser(updatedUser);

        // also keep localStorage in sync
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }}
      onLogout={() => {
        localStorage.removeItem("user");
        setUser(null);
        navigate("/");
      }}
    />
  }
/>
     {/* Admin Dashboard Route */}
      <Route
        path="/admin"
        element={
          user && user.role === "admin" ? (
            <AdminDashboard
              admin={user}
              onLogout={handleLogout}
            />
          ) : (
            <h1 style={{ textAlign: "center", marginTop: "50px" }}>
              ❌ Access Denied: Admins only
            </h1>
          )}
      />
    </Routes>
  );
}
