// src/pages/AvailableRooms.js
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./UserKP.css";

const AvailableRooms = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRooms = async () => {
      if (!state) {
        setError("Missing search criteria");
        return;
      }

      try {
        const res = await axios.get("http://localhost:5000/api/reservations/available", {
          params: {
            date: state.date,
            startTime: state.startTime,
            endTime: state.endTime,
            location: state.location,
            type: state.type,
          },
        });
        setRooms(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch available rooms.");
      }
    };

    fetchRooms();
  }, [state]);

  const handleRoomClick = (room) => {
    navigate(`/book-room/${room._id}`, {
      state: {
        date: state.date,
        startTime: state.startTime,
        endTime: state.endTime,
      },
    });
  };

  return (
    <div className="user-kp-container1">
      <h2>Available {state?.type}s in {state?.location}</h2>
      {error && <p className="error">{error}</p>}
      <div className="room-grid">
        {rooms.map((room) => (
          <div
            key={room._id}
            className="room-card available"
            onClick={() => handleRoomClick(room)}
          >
            <h5>{room.name}</h5>
            <p>{room.location}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvailableRooms;
