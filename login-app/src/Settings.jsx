import React, { useState } from "react";
import { Sun, Moon, Globe, Clock, FileText } from "lucide-react";
import "./settings.css";

export default function Settings() {
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("English");
  const [timezone, setTimezone] = useState("Asia/Kolkata");

  const logs = [
    { action: "User logged in", timestamp: new Date() },
    { action: "Project created", timestamp: new Date() },
    { action: "Settings updated", timestamp: new Date() },
    { action: "Payroll approved", timestamp: new Date() },
    { action: "Announcement posted", timestamp: new Date() },
    { action: "Member invited", timestamp: new Date() },
  ];

  const handleSave = () => {
    // Replace alert with real save logic when ready
    alert(`Settings saved!\nTheme: ${theme}\nLanguage: ${language}\nTimezone: ${timezone}`);
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        <header className="settings-header">
          <div>
            <h1 className="settings-title">System Configuration</h1>
            <p className="settings-sub">Manage theme, language, timezone and view recent admin activity</p>
          </div>
        </header>

        <div className="settings-grid">
          <section className="settings-card">
            <div className="card-header">
              <div className="icon-wrap">{theme === "light" ? <Sun /> : <Moon />}</div>
              <div className="card-title">
                <h3>Theme</h3>
                <p className="card-desc">Switch between light and dark mode</p>
              </div>
            </div>

            <div className="control-row">
              <label className="select-label">Theme</label>
              <select value={theme} onChange={(e) => setTheme(e.target.value)} className="select">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </section>

          <section className="settings-card">
            <div className="card-header">
              <div className="icon-wrap"><Globe /></div>
              <div className="card-title">
                <h3>Language</h3>
                <p className="card-desc">Select system display language</p>
              </div>
            </div>

            <div className="control-row">
              <label className="select-label">Language</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="select">
                <option>English</option>
                <option>Hindi</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>

            <hr className="divider" />

            <div className="card-header small">
              <div className="icon-wrap"><Clock /></div>
              <div className="card-title">
                <h3>Timezone</h3>
                <p className="card-desc">Set your local timezone</p>
              </div>
            </div>

            <div className="control-row">
              <label className="select-label">Timezone</label>
              <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="select">
                <option>Asia/Kolkata</option>
                <option>America/New_York</option>
                <option>Europe/London</option>
                <option>Asia/Tokyo</option>
              </select>
            </div>
          </section>

          <aside className="settings-card logs-card">
            <div className="card-header">
              <div className="icon-wrap"><FileText /></div>
              <div className="card-title">
                <h3>Audit Logs</h3>
                <p className="card-desc">Recent admin activity</p>
              </div>
            </div>

            <div className="audit-logs" role="log" aria-live="polite">
              {logs.map((log, i) => (
                <div className="log-row" key={i}>
                  <div className="log-action">{log.action}</div>
                  <div className="log-time">{log.timestamp.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </aside>
        </div>

        <div className="save-btn-container">
          <button className="save-btn" onClick={handleSave}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}
