import React, { useState, useEffect } from "react";
import { Link } from "react-scroll";
import { useNavigate } from "react-router-dom";
import "./LandingCss/Navbar.css";
import stclogo from "../../assets/stc.png";

const Navbar = ({ onLoginClick, onAdminAccess }) => {
  const [sticky, setSticky] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  // Admin passcode
  const Admin_pass = "012301";

  useEffect(() => {
    const handleScroll = () => {
      setSticky(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle secret logo clicks
  const handleLogoClick = (e) => {
    e.preventDefault();
    setClickCount((prev) => {
      const newCount = prev + 1;
      if (newCount === 6) {
        setIsModalOpen(true);
        return 0; // reset counter after opening modal
      }
      return newCount;
    });
  };

  // Handle modal actions
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPassword("");
  };

  const handleSubmit = (enteredPassword) => {
    if (enteredPassword === Admin_pass) {
      alert("Access Granted ✅");
      handleCloseModal();
      if (onAdminAccess) {
        onAdminAccess(); // 🚀 notify App if admin login succeeded
      } else {
        navigate("/admin"); // optional: direct navigation
      }
    } else {
      alert("Wrong Passcode ❌");
      setPassword("");
      const first = document.getElementById("digit-0");
      if (first) first.focus();
    }
  };

  return (
    <>
      <nav className={`container ${sticky ? "dark-nav" : ""}`}>
        {/* Logo - secret 6 clicks */}
        <a href="#" onClick={handleLogoClick}>
          <img src={stclogo} alt="Logo" className="logo" />
        </a>

        <ul>
          <li>
            <Link to="home" smooth={true} offset={0} duration={500}>
              Home
            </Link>
          </li>
          <li>
            <Link to="about" smooth={true} offset={-170} duration={500}>
              About Us
            </Link>
          </li>
          <li>
            <Link to="contact" smooth={true} offset={-240} duration={500}>
              Contact
            </Link>
          </li>
          <li>
            <button className="btn" onClick={onLoginClick}>
              Login
            </button>
          </li>
        </ul>
      </nav>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box passcode-box">
            <h2>Administrator Panel</h2>
            <div className="passcode-inputs">
              {Array.from({ length: 6 }).map((_, i) => (
                <input
                  key={i}
                  type="password"
                  maxLength="1"
                  value={password[i] || ""}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    if (val) {
                      const newPass = password.split("");
                      newPass[i] = val;
                      const joined = newPass.join("");
                      setPassword(joined);

                      // Auto focus next input
                      const next = document.getElementById(`digit-${i + 1}`);
                      if (next) next.focus();

                      // Auto-submit when 6 digits are entered
                      if (joined.length === 6) {
                        handleSubmit(joined);
                      }
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !password[i]) {
                      const prev = document.getElementById(`digit-${i - 1}`);
                      if (prev) prev.focus();
                    }
                  }}
                  id={`digit-${i}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
