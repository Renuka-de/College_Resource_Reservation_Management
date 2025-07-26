// src/pages/AdminDashboard.js

import React from 'react';
import '../assets/styles/Dashboard.css';
import kpImage from '../assets/uploads/kp.jpeg'; 
import { useNavigate } from 'react-router-dom';
import Cse from '../assets/uploads/CSE.png';
import { logout } from '../utils/auth';

const Dashboard1 = () => {
  const navigate = useNavigate();
  

  const handleKPClick = () => {
    navigate('/admin-kp');
  };

  const handleLabRegister = () => {
    
      navigate('/admin-lab'); 
  };
  const handleLogout = () => {
    logout();
    navigate('/'); // Navigate back to login page
  };

  return (
    <div className="dashboard-container">
      <div className="overlay"></div>
      <div className="dashboard-content">
            <button className="back-button1" onClick={handleLogout}>
        ← Logout
      </button>
        <h2 className="text-center mb-5 text-white">Select an Option</h2>
        <div className="row justify-content-center">
          <div className="col-md-5 mb-4">
            <div className="card option-card h-100">
              <img src={kpImage} className="card-img-top" alt="Knowledge Park" />
              <div className="card-body text-center">
                <h5 className="card-title">Manage KP Rooms</h5>
                <p className="card-text">Add new Classrooms or delete existing Classrooms in KP</p>
                <button className="btn btn-primary" onClick={handleKPClick}>Manage KP</button>
              </div>
            </div>
          </div>
          <div className="col-md-5 mb-4">
            <div className="card option-card h-100">
                        <img src={Cse} className="card-img-top" alt="Computer science and engineering" />
                          <div className="card-body text-center">
                            <h5 className="card-title">Manage CSE Labs</h5>
                            <p className="card-text">Add new Labs or delete existing Labs in CSE Department</p>
                            <button className="btn btn-primary" onClick={handleLabRegister}>Manage Labs</button>
                          </div>
                        </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard1;