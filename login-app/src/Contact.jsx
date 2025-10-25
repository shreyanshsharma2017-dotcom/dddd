import React, { useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import "./contact.css";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    alert("Message sent successfully!");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="contact-container">
      <header className="contact-header">
        <h1>Contact Us</h1>
        <p>We'd love to hear from you! Send us a message or reach out directly.</p>
      </header>

      <div className="contact-grid">
        <div className="contact-info">
          <div className="info-item">
            <MapPin size={24} /> <p>123 Main Street, Your City, Country</p>
          </div>
          <div className="info-item">
            <Phone size={24} /> <p>+1 (555) 123-4567</p>
          </div>
          <div className="info-item">
            <Mail size={24} /> <p>info@yourcompany.com</p>
          </div>

          <div className="map-container">
            <iframe
              title="company-location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3023.8248242340696!2d-74.00601528459384!3d40.71277597933039!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a316bbf91ef%3A0x4d6a1291c3f1a98f!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2sin!4v1698143432524!5m2!1sen!2sin"
              width="100%"
              height="200"
              style={{ border: 0, borderRadius: "15px" }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <textarea
            name="message"
            placeholder="Your Message"
            rows="5"
            value={formData.message}
            onChange={handleChange}
            required
          ></textarea>
          <button type="submit">Send Message</button>
        </form>
      </div>
      <div className="animated-bg"></div>
    </div>
  );
}
