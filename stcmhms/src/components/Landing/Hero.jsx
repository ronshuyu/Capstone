import React from 'react'
import './LandingCss/Hero.css'
import dark_arrow from '../../assets/dark-arrow.png'
import { Link } from 'react-scroll';

const Hero = () => {
  return (
    <section id="home" className="home">
      <div className='hero container'>
          <div className='hero-text'>
              <h1>Your Mental Health Matters.</h1>
              <p>At Sta. Teresa College, we believe that mental health is just as important as physical health. Our platform empowers you to monitor your emotional well-being, recognize patterns, and take control of your mental health journey. Whether you're managing stress, anxiety, or simply aiming for a more balanced life, our institution provides tools, insights, and support tailored to your unique needs. Let’s take the first step together—toward awareness, growth, and healing.
              </p>
              <button className='btn'><Link to="whys" smooth={true} offset={-240} duration={500}>Explore More <img src={dark_arrow} alt="" /></Link></button>
          </div>
      </div>
    </section>
  )
}

export default Hero
