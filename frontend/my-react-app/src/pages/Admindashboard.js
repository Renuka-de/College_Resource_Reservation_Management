// src/pages/AdminDashboard.js

import React, { useState } from 'react';
import './Dashboard.css';
import kpImage from './kp.jpeg'; // Ensure this is your KP image
import logo from './logo.png';  // Make sure the logo image exists in your directory
import { useNavigate } from 'react-router-dom';
import Cse from './CSE.png';

const Dashboard1 = () => {
  const navigate = useNavigate();
  //const [selectedDept, setSelectedDept] = useState('');

  const handleKPClick = () => {
    navigate('/admin-kp');
  };

  const handleLabRegister = () => {
    //if (selectedDept) {
      navigate(`/admin-lab`); // Correct the route path here
    //} else {
     // alert('Please select a department.');
    //}
  };

  const departments = [
    'Computer Science and Engineering',
    // Add more departments as needed
  ];

  return (
    <div className="dashboard-container">
      <div className="overlay"></div>
      <div className="dashboard-content">
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