import React from "react";
import './DashboardCss/HeroDash.css';

const HeroDash = ({ onStartToday, onLearnMore }) => {
  return (
    <section className="HeroDash">
      <h1> Mental Health Monitoring System</h1>
      <p>
        A private space for students to track mood and reflect daily. 
        Entries will sync to the database once Firebase is connected. An AI heuristic 
        estimates well-being and updates your score.
      </p>
      <div className="cta-buttons">
        <button className="btn btn-primary btn-cta" onClick={onStartToday}>
          Start today
        </button>
        <button className="btn btn-secondary btn-cta" onClick={onLearnMore}>
          Learn more
        </button>
      </div>
    </section>
  );
};

export default HeroDash;
