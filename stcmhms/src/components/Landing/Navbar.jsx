import React, { useState, useEffect } from 'react'
import { Link } from 'react-scroll'
import './LandingCss/Navbar.css'
import stclogo from '../../assets/stc.png'

const Navbar = ({ onLoginClick }) => {

  const[sticky, setSticky] = useState(false);

  useEffect(()=>{
    const handleScroll = () => {
      window.scrollY > 50 ? setSticky(true) : setSticky(false);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  },[]);

  return (
    <nav className={`container ${sticky? 'dark-nav' : '' } `}>
      <img src={stclogo} alt="" className='logo'/>
      <ul>
        <li><Link to="home" smooth={true} offset={0} duration={500}>Home</Link></li>
        <li><Link to="about" smooth={true} offset={-170} duration={500}>About Us</Link></li>
        <li><Link to="contact" smooth={true} offset={-240} duration={500}>Contact</Link></li> 
        <li><button className='btn' onClick={onLoginClick}>Login</button></li>
      </ul>
    </nav>
  )
}

export default Navbar
