import React, { useState, useRef, useEffect } from 'react';
import EditProfile from './EditProfile';
import './DashboardCss/Profile.css';

const ProfileDropdown = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      console.log('Logging out...');
      onLogout && onLogout();
      setIsOpen(false);
    }
  };

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
    setIsOpen(false); // Close dropdown when opening modal
  };

  const handleSaveProfile = async (formData) => {
    console.log('Saving profile data from dropdown:', formData);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Here you would typically make an API call to save the data
    alert('Profile updated successfully!');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getUserDisplayName = () => user?.displayName || user?.name || 'User';
  const getUserUsername = () => user?.email?.split('@')[0] || 'username';

  return (
    <>
      <div className="profile-container" ref={dropdownRef}>
        <div className="profile-wrapper">
          <button className="profile-button" onClick={toggleDropdown}>
            <div className="profile-avatar">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" />
              ) : (
                <div className="profile-avatar-fallback">
                  {getInitials(getUserDisplayName())}
                </div>
              )}
              <div className="status-indicator"></div>
            </div>
            <div className="profile-info">
              <div className="profile-name">{getUserDisplayName()}</div>
              <div className="profile-username">{getUserUsername()}</div>
            </div>
            <MoreIcon />
          </button>

          <div className={`profile-dropdown ${isOpen ? 'open' : ''}`}>
            {/* Header */}
            <div className="dropdown-header">
              <div className="dropdown-user-info">
                <div className="dropdown-avatar">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="Profile" />
                  ) : (
                    <div className="dropdown-avatar-fallback">
                      {getInitials(getUserDisplayName())}
                    </div>
                  )}
                  <div className="dropdown-status-indicator"></div>
                </div>
                <div className="dropdown-user-details">
                  <div className="dropdown-display-name">{getUserDisplayName()}</div>
                  <div className="dropdown-username">{getUserUsername()}</div>
                  <div className="dropdown-tagline">Tag line here!</div>
                </div>
              </div>
            </div>

            {/* Status Section */}
            <div className="dropdown-section">
              <div className="section-title">Mental Health Grade:</div>
              <div className="status-item">
                <div className="status-dot"></div>
                <div className="status-text">Edit me</div>
              </div>
            </div>

            {/* Actions */}
            <div className="dropdown-actions">
              <button className="action-item" onClick={handleEditProfile}>
                <EditIcon />
                Edit Profile
              </button>
              
              <div className="action-divider"></div>

              <button className="action-item danger" onClick={handleLogout}>
                <LogoutIcon />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfile
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentUser={user}
        onSave={handleSaveProfile}
      />
    </>
  );
};

// Icon Components
const MoreIcon = () => (
  <svg className="more-icon icon" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="1"/>
    <circle cx="19" cy="12" r="1"/>
    <circle cx="5" cy="12" r="1"/>
  </svg>
);

const EditIcon = () => (
  <svg className="action-icon icon" viewBox="0 0 24 24">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="m18.5 2.5 a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const LogoutIcon = () => (
  <svg className="action-icon icon" viewBox="0 0 24 24">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16,17 21,12 16,7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

export default ProfileDropdown;