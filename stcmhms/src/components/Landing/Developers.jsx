import React, { useState, useEffect } from 'react'
import './LandingCss/Developers.css'
import next_icon from '../../assets/next-icon.png'
import back_icon from '../../assets/back-icon.png'
import dev1 from '../../assets/ron.jpg'
import dev2 from '../../assets/del.jpg'
import dev3 from '../../assets/kate.jpg'

const Developers = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const totalSlides = 3;

    // Auto-slide functionality
    useEffect(() => {
        const autoSlide = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % totalSlides);
        }, 5000);

        return () => clearInterval(autoSlide);
    }, [totalSlides]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    };

    return (
        <div className='developers'>
            <img src={next_icon} alt='' className='next-btn' onClick={nextSlide}/>
            <img src={back_icon} alt='' className='back-btn' onClick={prevSlide}/>
            <div className="slider">
                <ul style={{ transform: `translateX(-${currentSlide * 33.33}%)` }}>
                    <li>
                        <div className='slide'>
                            <div className="user-info">
                                <img src={dev1} alt=''/>
                                <div>
                                    <h3>Ron Julius Carandang</h3>
                                    <span>BSIT-IV</span>
                                </div>
                            </div>
                            <p>
                                 First developer description here...
                            </p>
                        </div>
                    </li>
                    <li>
                        <div className='slide'>
                            <div className="user-info">
                                <img src={dev2} alt=''/>
                                <div>
                                    <h3>Randel Joseph Atienza</h3>
                                    <span>BSIT-IV</span>
                                </div>
                            </div>
                            <p>
                                Second developer description here...
                            </p>
                        </div>
                    </li>
                    <li>
                        <div className='slide'>
                            <div className="user-info">
                                <img src={dev3} alt=''/>
                                <div>
                                    <h3>Kate Allen Castillo</h3>
                                    <span>BSIT-IV</span>
                                </div>
                            </div>
                            <p>
                                Third developer description here...
                            </p>
                        </div>
                    </li>
                </ul>
            </div>
            
            {/* Optional: Dots indicator */}
            <div className="dots">
                {[...Array(totalSlides)].map((_, index) => (
                    <span 
                        key={index}
                        className={`dot ${index === currentSlide ? 'active' : ''}`}
                        onClick={() => setCurrentSlide(index)}
                    ></span>
                ))}
            </div>
        </div>
    )
}

export default Developers