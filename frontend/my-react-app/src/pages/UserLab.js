// src/pages/UserLab.js

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/styles/UserKP.css"; 
const UserLab = () => {
  const [filters, setFilters] = useState({
    date: "",
    startTime: "",
    endTime: ""
  });
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setError(""); 
  };

  const handleSearch = () => {
    const { date, startTime, endTime } = filters;

    if (!date || !startTime || !endTime) {
      setError("Please select date and time");
      return;
    }

    const now = new Date();
    const selectedDate = new Date(date);
    const selectedStart = new Date(`${date}T${startTime}`);
    const selectedEnd = new Date(`${date}T${endTime}`);

    // 🛑 Check if selected date is in the past
    if (selectedDate < new Date(now.toDateString())) {
      setError("Selected date is in the past");
      return;
    }

    // 🛑 Check time if selected date is today
    if (selectedDate.toDateString() === now.toDateString()) {
      if (selectedStart < now || selectedEnd < now) {
        setError("Start/End time must be in the future");
        return;
      }
    }

    // 🛑 Check start time is before end time
    if (selectedStart >= selectedEnd) {
      setError("Start time must be before end time");
      return;
    }

    // ✅ Navigate to search result
    navigate("/available-rooms", {
      state: {
        ...filters,
        location: "CSE",
        type: "Lab"
      },
    });
  };

  return (
    <div className="user-cse-container">
      <div className="user-kp-overlay"></div>
      <div className="user-kp-box">
        <h2>Check CSE Lab Availability</h2>

        <div className="filter-form">
          <input
            type="date"
            name="date"
            value={filters.date}
            onChange={handleInputChange}
          />
          <input
            type="time"
            name="startTime"
            value={filters.startTime}
            onChange={handleInputChange}
          />
          <input
            type="time"
            name="endTime"
            value={filters.endTime}
            onChange={handleInputChange}
          />
          <button onClick={handleSearch}>Search</button>
        </div>

        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
};

export default UserLab;