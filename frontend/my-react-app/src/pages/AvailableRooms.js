import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from '../utils/auth';
import "../assets/styles/UserKP.css";

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
        const res = await api.get("/api/reservations/available", {
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
        setError("Failed to fetch rooms.");
      }
    };

    fetchRooms();
  }, [state]);

  const handleRoomClick = (room) => {
    if (room.status === "Available") {
      navigate(`/book-room/${room._id}`, {
        state: {
          date: state.date,
          startTime: state.startTime,
          endTime: state.endTime,
        },
      });
    }
  };

  return (
    <div className="user-kp-container1">
      <h2>Rooms in {state?.location} ({state?.type})</h2>
      {error && <p className="error">{error}</p>}
      <div className="room-grid">
        {rooms.map((room) => (
          <div
            key={room._id}
            className={`room-card ${room.status.toLowerCase()}`}
            onClick={() => handleRoomClick(room)}
            style={{ cursor: room.status === "Available" ? "pointer" : "not-allowed" }}
          >
            <div className="room-name">{room.name}</div>
            <div className={`room-status ${room.status.toLowerCase()}`}>
              {room.status}
            </div>
            {room.status === "Booked" && (
              <div className="room-purpose">
                Purpose: {room.purpose || "Not specified"}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvailableRooms;

