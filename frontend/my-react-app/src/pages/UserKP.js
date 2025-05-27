// src/pages/UserKP.js

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/styles/UserKP.css";

const UserKP = () => {
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

    // 🛑 Date check
    if (selectedDate < new Date(now.toDateString())) {
      setError("Selected date is in the past");
      return;
    }

    // 🛑 Time check if date is today
    if (selectedDate.toDateString() === now.toDateString()) {
      if (selectedStart < now || selectedEnd < now) {
        setError("Start/End time must be in the future");
        return;
      }
    }

    // 🛑 Start should be before End
    if (selectedStart >= selectedEnd) {
      setError("Start time must be before end time");
      return;
    }

    // ✅ Proceed
    navigate("/available-rooms", {
      state: {
        ...filters,
        location: "KP",
        type: "Classroom"
      },
    });
  };

  return (
    <div className="user-kp-container">
      <div className="user-kp-overlay"></div>
      <div className="user-kp-box">
        <h2>Check Room Availability</h2>

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

export default UserKP;