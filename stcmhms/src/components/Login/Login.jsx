import React, { useState, useEffect } from 'react';
import { useAuth } from './Auth';
import './Login.css';

const Login = ({ isOpen, onClose }) => {
  const [fadeOut, setFadeOut] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login, signup, signInWithGoogle, error, setError, user } = useAuth();

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isOpen]);

  // Auto-close modal when user becomes authenticated
  useEffect(() => {
    if (user && isOpen) {
      closeWithFade();
    }
  }, [user, isOpen]);

  const closeWithFade = () => {
    setFadeOut(true);
    setTimeout(() => {
      onClose();
      setEmail('');
      setPassword('');
      setShowPassword(false);
      setError('');
      setIsSignup(false);
      setFadeOut(false);
    }, 300);
  };

  useEffect(() => {
    setFadeOut(false);
    if (isOpen) setError('');
  }, [isOpen, setError]);

  const togglePassword = () => setShowPassword(!showPassword);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    try {
      setIsLoading(true);
      setError('');
      await login(email, password);
      // Don't call closeWithFade here - let the useEffect handle it
      console.log('Login successful!');
    } catch (error) {
      console.error('Login error:', error);
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    try {
      setIsLoading(true);
      setError('');
      await signup(email, password);
      // Don't call closeWithFade here - let the useEffect handle it
      console.log('Signup successful!');
    } catch (error) {
      console.error('Signup error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`modal-overlay ${fadeOut ? 'fade-out' : 'fade-in'}`}
      onClick={closeWithFade}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{isSignup ? 'Sign Up' : 'Login'}</h2>
          <button className="close-btn" onClick={closeWithFade}>×</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className={`form-slider ${isSignup ? 'show-signup' : 'show-login'}`}>
          {/* Login form */}
          <form className="login-form form-panel" onSubmit={handleLogin}>
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="input-group">
              <label>Password</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <button 
                  type="button" 
                  onClick={togglePassword} 
                  className="toggle-password-btn"
                  disabled={isLoading}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            <button type="submit" className="login-submit-btn" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
            <button type="button" onClick={signInWithGoogle} className="google-signin-btn">
              Sign in with Google
            </button>
          </form>

          {/* Signup form */}
          <form className="signup-form form-panel" onSubmit={handleSignup}>
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <button type="submit" className="signup-submit-btn" disabled={isLoading}>
              {isLoading ? "Signing up..." : "Sign Up"}
            </button>
          </form>
        </div>

        <div className="modal-footer">
          {isSignup ? (
            <p>Already have an account? <a href="#" onClick={() => setIsSignup(false)}>Login</a></p>
          ) : (
            <p>Don't have an account? <a href="#" onClick={() => setIsSignup(true)}>Sign up</a></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;