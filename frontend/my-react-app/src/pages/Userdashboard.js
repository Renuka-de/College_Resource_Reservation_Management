// src/pages/UserDashboard.js

import React from 'react';
import '../assets/styles/Dashboard.css';
import kpImage from '../assets/uploads/kp.jpeg';
import { useNavigate } from 'react-router-dom';
import Cse from '../assets/uploads/CSE.png';
import MyReservations from '../assets/uploads/reservation.jpg';
import { logout } from '../utils/auth';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleKPClick = () => {
    navigate('/user-kp');
  };

  const handleLabRegister = () => {
    navigate('/user-lab');
  };

  const handleMyReservations = () => {
    navigate('/my-reservations'); 
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
            <div className="card option-card h-120">
              <img src={MyReservations} className="card-img-top" alt="Reservations" />
              <div className="card-body text-center">
                <h5 className="card-title">My Reservations</h5>
                <p className="card-text">View and Delete your room and lab bookings.</p>
                <button className="btn btn-primary" onClick={handleMyReservations}>My Reservations</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
