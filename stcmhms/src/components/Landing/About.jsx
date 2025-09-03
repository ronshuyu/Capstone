import React from 'react'
import './LandingCss/About.css'
import student from '../../assets/students.jpg'
import play_icon from '../../assets/play-icon.png'


const About = () => {
  return (
    <div className='about'>
      <div className='about-left'>
        <img src={student} alt='' className='student'/>
        <img src={play_icon} alt='' className='play_icon'/>
      </div>
      <div className='about-right'>
        <h3>About our System</h3>
        <h2>AI-Driven Mental Health Monitoring System</h2>
        <p>
            Our mental health monitoring system is a proactive, secure, and insightful platform designed to support students' emotional well-being through early detection and guided intervention. It combines self-reported data, behavioral patterns, and emotional tone analysis to assess a user's mental state and provide personalized feedback. The system continuously monitors changes in engagement, such as how often a user logs in, fil ls out mood check-ins, or abruptly exits without input—signals that may reflect fear, denial, or emotional distress. 
        </p>
        <p>
           While it cannot fully support users who refuse to engage at all, it can identify these patterns and refer concerning cases to human counselors for careful follow-up. By blending AI and compassionate oversight, the system aims to create a safe space where students can open up at their own pace without fear of judgment.
        </p>
      </div>
    </div>
  )
}

export default About
