import React from "react";
import { Code, Server, Smartphone, Monitor } from "lucide-react";
import "./services.css";

export default function Services() {
  const services = [
    {
      icon: <Code size={48} />,
      title: "Web Development",
      description: "Responsive and modern websites built with the latest technologies.",
    },
    {
      icon: <Server size={48} />,
      title: "Backend Development",
      description: "Robust and scalable server-side applications with smooth APIs.",
    },
    {
      icon: <Smartphone size={48} />,
      title: "Mobile App Development",
      description: "iOS & Android apps with seamless user experiences.",
    },
    {
      icon: <Monitor size={48} />,
      title: "UI/UX Design",
      description: "Intuitive and attractive user interfaces for web and mobile.",
    },
  ];

  return (
    <div className="services-container">
      <header className="services-header">
        <h1>Our Services</h1>
        <p>We deliver high-quality solutions tailored for your business needs.</p>
      </header>

      <div className="services-grid">
        {services.map((service, index) => (
          <div key={index} className="service-card">
            <div className="service-icon">{service.icon}</div>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
            <button className="learn-more">Learn More</button>
          </div>
        ))}
      </div>

      <section className="why-choose-us">
        <h2>Why Choose Us?</h2>
        <p>We combine expertise, innovation, and dedication to deliver top-notch solutions that help your business grow.</p>
      </section>
    </div>
  );
}
