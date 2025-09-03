import React, { useState } from 'react';
import { X, Camera, User, Edit3 } from 'lucide-react';
import './DashboardCss/EditProfile.css';

const EditProfile = ({ isOpen, onClose, currentUser, onSave }) => {
  const [formData, setFormData] = useState({
    username: currentUser?.username || '',
    tagline: currentUser?.tagline || '',
    profilePicture: currentUser?.profilePicture || null
  });
  const [previewImage, setPreviewImage] = useState(currentUser?.profilePicture || null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
      
      // Store file in form data
      setFormData(prev => ({
        ...prev,
        profilePicture: file
      }));
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Call the parent's save function with the form data
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      username: currentUser?.username || '',
      tagline: currentUser?.tagline || '',
      profilePicture: currentUser?.profilePicture || null
    });
    setPreviewImage(currentUser?.profilePicture || null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">Edit Profile</h2>
          <button onClick={handleClose} className="close-button">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="modal-content">
          {/* Profile Picture Upload */}
          <div className="profile-picture-section">
            <div className="profile-picture-container">
              <div className="profile-picture">
                {previewImage ? (
                  <img src={previewImage} alt="Profile preview" />
                ) : (
                  <div className="profile-picture-placeholder">
                    <User size={32} />
                  </div>
                )}
              </div>
              <label className="camera-button">
                <Camera size={16} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="file-input"
                />
              </label>
            </div>
            <p className="upload-hint">
              Click the camera icon to upload a new profile picture
            </p>
          </div>

          {/* Username Field */}
          <div className="form-section">
            <label className="form-label">
              <div className="label-with-icon">
                <User size={16} />
                <span>Username</span>
              </div>
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Enter your username"
              className="form-input"
              maxLength={30}
            />
            <div className="character-count">
              {formData.username.length}/30 characters
            </div>
          </div>

          {/* Tagline Field */}
          <div className="form-section">
            <label className="form-label">
              <div className="label-with-icon">
                <Edit3 size={16} />
                <span>Tagline</span>
              </div>
            </label>
            <textarea
              name="tagline"
              value={formData.tagline}
              onChange={handleInputChange}
              placeholder="Write a short bio or tagline..."
              rows={3}
              className="form-input form-textarea"
              maxLength={150}
            />
            <div className="character-count">
              {formData.tagline.length}/150 characters
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button
            onClick={handleClose}
            className="footer-button cancel-button"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || !formData.username.trim()}
            className="footer-button save-button"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;