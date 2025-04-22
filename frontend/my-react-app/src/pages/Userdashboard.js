// src/pages/UserDashboard.js

import React, { useState } from 'react';
import './Dashboard.css';
import kpImage from './kp.jpeg';
import logo from './logo.png';
import { useNavigate } from 'react-router-dom';
import Cse from './CSE.png';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleKPClick = () => {
    navigate('/user-kp');
  };

  const handleLabRegister = () => {
    navigate('/user-lab');
  };

  const handleMyReservations = () => {
    navigate('/my-reservations'); // ✅ Navigate to new page
  };

  return (
    <div className="dashboard-container">
      <div className="overlay"></div>
      <div className="dashboard-content">
        <h2 className="text-center mb-5 text-white">Select an Option</h2>
        <div className="row justify-content-center">
          <div className="col-md-4 mb-4">
            <div className="card option-card h-100">
              <img src={kpImage} className="card-img-top" alt="Knowledge Park" />
              <div className="card-body text-center">
                <h5 className="card-title">Register KP Rooms</h5>
                <p className="card-text">Book rooms in Knowledge Park for events, classes, and more.</p>
                <button className="btn btn-primary" onClick={handleKPClick}>Register KP Rooms</button>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="card option-card h-100">
              <img src={Cse} className="card-img-top" alt="Computer science and engineering" />
              <div className="card-body text-center">
                <h5 className="card-title">Register CSE Labs</h5>
                <p className="card-text">Book labs in CSE Department for events, classes, and more.</p>
                <button className="btn btn-primary" onClick={handleLabRegister}>Register Labs</button>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="card option-card h-100">
              <img src={logo} className="card-img-top" alt="Reservations" />
              <div className="card-body text-center">
                <h5 className="card-title">My Reservations</h5>
                <p className="card-text">View your room and lab bookings.</p>
                <button className="btn btn-success" onClick={handleMyReservations}>My Reservations</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

