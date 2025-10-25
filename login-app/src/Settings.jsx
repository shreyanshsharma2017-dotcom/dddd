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
  ];

  const handleSave = () => {
    alert(`Settings saved!\nTheme: ${theme}\nLanguage: ${language}\nTimezone: ${timezone}`);
  };

  return (
    <div className="settings-page">
      <h2 className="page-title">System Configuration</h2>
      <div className="settings-grid">
        {/* Theme */}
        <div className="settings-card">
          <div className="card-header">
            {theme === "light" ? <Sun className="icon" /> : <Moon className="icon" />}
            <h3>Theme</h3>
          </div>
          <p className="card-desc">Switch between Light or Dark mode</p>
          <select value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        {/* Language & Timezone */}
        <div className="settings-card">
          <div className="card-header">
            <Globe className="icon" />
            <h3>Language</h3>
          </div>
          <p className="card-desc">Select system display language</p>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option>English</option>
            <option>Hindi</option>
            <option>Spanish</option>
            <option>French</option>
          </select>

          <div className="card-header mt-4">
            <Clock className="icon" />
            <h3>Timezone</h3>
          </div>
          <p className="card-desc">Set your local timezone</p>
          <select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
            <option>Asia/Kolkata</option>
            <option>America/New_York</option>
            <option>Europe/London</option>
            <option>Asia/Tokyo</option>
          </select>
        </div>

        {/* Audit Logs */}
        <div className="settings-card logs-card">
          <div className="card-header">
            <FileText className="icon" />
            <h3>Audit Logs</h3>
          </div>
          <p className="card-desc">Recent admin activity</p>
          <div className="audit-logs">
            {logs.map((log, i) => (
              <p key={i}>
                • {log.action} — <span className="log-date">{log.timestamp.toLocaleString()}</span>
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="save-btn-container">
        <button className="save-btn" onClick={handleSave}>
          Save Changes
        </button>
      </div>
    </div>
  );
}
