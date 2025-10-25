import React from "react";
import { Users, Target, Rocket, Heart } from "lucide-react";
import "./aboutus.css";

export default function AboutUs() {
  return (
    <div className="about-container">
      <section className="about-hero">
        <h1>About Our HRMS Platform</h1>
        <p>
          We are passionate about simplifying employee management and creating
          seamless workplace experiences. Our Human Resource Management System
          empowers teams to collaborate, grow, and succeed together.
        </p>
      </section>

      <section className="about-section">
        <div className="about-card">
          <Users className="about-icon" />
          <h2>Who We Are</h2>
          <p>
            We’re a dedicated team of developers, designers, and HR professionals
            committed to transforming how companies manage their workforce.
          </p>
        </div>

        <div className="about-card">
          <Target className="about-icon" />
          <h2>Our Mission</h2>
          <p>
            To build intelligent, efficient, and user-friendly tools that help
            organizations streamline HR operations and enhance employee
            engagement.
          </p>
        </div>

        <div className="about-card">
          <Rocket className="about-icon" />
          <h2>Our Vision</h2>
          <p>
            To become a trusted platform that bridges technology and human
            potential—making every workplace smarter and more connected.
          </p>
        </div>

        <div className="about-card">
          <Heart className="about-icon" />
          <h2>Our Values</h2>
          <p>
            Transparency, innovation, teamwork, and empathy are at the heart of
            everything we do.
          </p>
        </div>
      </section>

      <section className="about-footer">
        <p>
          © {new Date().getFullYear()} HRMS Platform — Designed with ❤️ by the
          DevOps Team.
        </p>
      </section>
    </div>
  );
}
