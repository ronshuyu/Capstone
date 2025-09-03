import React, { useState } from 'react';
import Navbar from '../components/Landing/Navbar.jsx';
import Hero from '../components/Landing/Hero.jsx';
import Why from '../components/Landing/Why';
import About from '../components/Landing/About';
import Title from '../components/Landing/Title';
import Features from '../components/Landing/Features';
import Developers from '../components/Landing/Developers';
import Contact from '../components/Landing/Contact';
import Footer from '../components/Landing/Footer';

const LandingPage = ({ onShowLogin }) => {
  // keep only landing-specific state (e.g., mood diary etc.) if needed
  // removed: showLogin/email/password/showPassword and <Login />

  return (
    <div>
      <Navbar onLoginClick={onShowLogin} />
      <Hero />
      <div className="container">
        <Title subtitle="Our System" title="What Our System Offers" />
        <Why />
        <About />
        <Title subtitle="Feature" title="AI-Integrated System" />
        <Features />
        <Title subtitle="Computer Information Society" title="Developers" />
        <Developers />
        <Title subtitle="Contact Us" title="Get in Touch" />
        <Contact />
        <Footer />
      </div>
    </div>
  );
};

export default LandingPage;
