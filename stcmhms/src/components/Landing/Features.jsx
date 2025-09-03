import React from 'react'
import './LandingCss/Features.css'
import video_1 from '../../assets/ai.mp4'

const Features = () => {
  return (
    <div className='features'>
        <div className="feature">
                <video 
                    src={video_1}
                         controls 
                         autoPlay 
                         muted // Required for autoplay to work
                         loop // Optional: makes it repeat
                         width="800" // Adjust size as needed
                         height="450"
                    >       
                        Your browser does not support the video tag.
                </video> 
      </div>
       <div className='feature-right'>
                <h2>About our AI-Feature</h2>
                <p>With the help of AI, the Student Mental Health Monitoring System becomes more intelligent, responsive, and adaptive. AI enables the system to analyze large amounts of student input data, detect emotional patterns, and make accurate assessments of mental well-being over time. It learns from behavior trends, adjusts recommendations based on individual needs, and continuously improves through data-driven insights. This makes the AI not just a tool for monitoring, but a smart, evolving engine capable of understanding and supporting complex human emotions with speed and precision.</p>
        </div>
    </div>
  )
}

export default Features
