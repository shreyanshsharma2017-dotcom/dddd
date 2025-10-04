import React, { useEffect, useState } from "react";

export default function Settings() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    profilePic: "",
    role: "User",
    location: "Unknown"
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Example: fetch logged-in user
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.id) {
      fetch(`http://localhost:5000/user/${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setFormData(data.user);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user"));
    const res = await fetch(`http://localhost:5000/user/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (data.success) alert("Profile updated!");
    else alert("Update failed");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, profilePic: URL.createObjectURL(file) });
      // You can also upload to server via FormData
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="settings-container">
      <div style={{ maxHeight: "400px", overflowY: "auto", border: "1px solid #eee", marginBottom: "1rem" }}>
        <form className="settings-form" onSubmit={handleSubmit}>
          <h2>Profile Settings</h2>
          <label>Name</label>
          <input name="name" value={formData.name} onChange={handleChange} />

          <label>Email</label>
          <input name="email" type="email" value={formData.email} onChange={handleChange} />

          <label>Phone</label>
          <input name="phone" value={formData.phone} onChange={handleChange} />

          <label>Gender</label>
          <select name="gender" value={formData.gender} onChange={handleChange}>
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          <label>Address</label>
          <input name="address" value={formData.address} onChange={handleChange} />

          <label>City</label>
          <input name="city" value={formData.city} onChange={handleChange} />

          <label>State</label>
          <input name="state" value={formData.state} onChange={handleChange} />

          <label>ZIP</label>
          <input name="zip" value={formData.zip} onChange={handleChange} />

          <button type="submit">Save All</button>
        </form>
      </div>

      {/* Profile Card */}
      <div className="profile-card">
        <img
          src={formData.profilePic || "https://via.placeholder.com/150"}
          alt="Profile"
          className="profile-pic"
        />
        <h3>{formData.name}</h3>
        <p>{formData.role}</p>
        <p>{formData.location}</p>
        <button className="connect-btn">Connect</button>
        <button className="message-btn">Send Message</button>

        <div className="upload">
          <label>Select profile photo</label>
          <input type="file" onChange={handleFileUpload} />
        </div>
      </div>
    </div>
  );
}
