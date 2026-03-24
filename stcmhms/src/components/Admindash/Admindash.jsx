import React, { useState, useEffect } from 'react';
import './Admindash.css';
import stclogo from '../../assets/stc.png';
import { useNavigate } from 'react-router-dom';
import { db } from "../../firebase/Firebase"; // import db
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";



const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("Users");
  const [users, setUsers] = useState([]);

  // Fetch users from Firestore
 useEffect(() => {
  const fetchUsersAndScores = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    const usersData = [];

    for (let docSnap of querySnapshot.docs) {
      const user = { id: docSnap.id, ...docSnap.data() };

      // 🔹 Aggregate scaled scores from userData instead of mentalHealthScores
      const userData = user.userData || [];
      const validScores = userData
        .map(entry => Number(entry.scaledScore))
        .filter(score => !isNaN(score));

      user.mentalHealthScore =
        validScores.length > 0
          ? Math.round(validScores.reduce((sum, s) => sum + s, 0) / validScores.length)
          : 50; 

      usersData.push(user);
    }

    setUsers(usersData);
  } catch (error) {
    console.error("Error fetching users or scores:", error);
  }
};


  fetchUsersAndScores();
}, []);

  const getScoreColor = (score) => {
    if (score >= 80) return '#22c55e'; // Green
    if (score >= 60) return '#eab308'; // Yellow
    if (score >= 40) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  const getScoreLevel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Attention';
  };

  const navigate = useNavigate();

const handleLogout = () => {
  if (window.confirm("Are you sure you want to logout?")) {
    console.log("Admin logged out");
    navigate("/");
  }
};

  const renderUsers = () => {
    // Sort users: lowest to highest score for those with sufficient data, then insufficient data
    const sortedUsers = [...users].sort((a, b) => {
      const aHasData = a.userData && a.userData.length >= 10;
      const bHasData = b.userData && b.userData.length >= 10;
      if (aHasData && bHasData) {
        return a.mentalHealthScore - b.mentalHealthScore;
      } else if (aHasData && !bHasData) {
        return -1;
      } else if (!aHasData && bHasData) {
        return 1;
      } else {
        return 0;
      }
    });

    return (
      <div className="table-container">
        <div className="table-header">
          <h2>User Management</h2>
          <div className="stats">
            <span>Total Users: {users.length}</span>
          </div>
        </div>
        
        <div className="table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Guardian</th>
                <th>Contact no.</th>
                <th>Mental Health Score</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map(user => (
                <tr key={user.id}>
                  <td className="name-cell">{user.name}</td>
                  <td className="email-cell">{user.email}</td>
                  <td className="guardian-cell">{user.guardian}</td>
                  <td className="contact-cell">{user.contactNo}</td>
                  <td className="score-cell">
                    {user.userData && user.userData.length < 10 ? (
                      <span>Insufficient data</span>
                    ) : (
                      <div 
                        className="score-badge"
                        style={{ backgroundColor: getScoreColor(user.mentalHealthScore) }}
                      >
                        {user.mentalHealthScore}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderMisc = () => (
    <div className="misc-container">
      <h2>Miscellaneous</h2>
      <div className="misc-grid">
        <div className="misc-card">
          <h3>System Statistics</h3>
          <div className="stat-item">
            <span>Total Users:</span>
            <span>{users.length}</span>
          </div>
          <div className="stat-item">
            <span>High Risk Users:</span>
            <span>{users.filter(u => u.mentalHealthScore < 40).length}</span>
          </div>
          <div className="stat-item">
            <span>Healthy Users:</span>
            <span>{users.filter(u => u.mentalHealthScore >= 80).length}</span>
          </div>
        </div>
        
        <div className="misc-card">
          <h3>Quick Actions</h3>
          <button className="action-btn">Export User Data</button>
          <button className="action-btn">Generate Report</button>
          <button className="action-btn">Send Notifications</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo-section">
          <div className="logo">
            <div className="logo-circle">
              <img src={stclogo} alt="STC Logo" />
            </div>
          </div>
        </div>
        
        <navdash className="navigation">
          <button 
            className={`nav-item ${activeTab === 'Users' ? 'active' : ''}`}
            onClick={() => setActiveTab('Users')}
          >
            Users
          </button>
          <button 
            className={`nav-item ${activeTab === 'Misc' ? 'active' : ''}`}
            onClick={() => setActiveTab('Misc')}
          >
            Misc
          </button>
          <button 
            className="nav-item logout"
            onClick={handleLogout}
          >
            Logout
          </button>
        </navdash>
      </div>

      {/* Main Content */}
      <div className="admin-main-content">
        {activeTab === 'Users' && renderUsers()}
        {activeTab === 'Misc' && renderMisc()}
      </div>
    </div>
  );
};

export default AdminDashboard;