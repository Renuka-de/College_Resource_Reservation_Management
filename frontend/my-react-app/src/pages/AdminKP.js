//frontend/pages/AdminKP.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import '../assets/styles/AdminKP.css'; // Optional for styling
import { useNavigate } from 'react-router-dom';

const AdminKP = () => {
  const [kpRooms, setKpRooms] = useState([]);
  const navigate = useNavigate();
  const [newRoom, setNewRoom] = useState({
    name: "",
    location: "KP",
    type: "Classroom",
  });
  const [error, setError] = useState("");

  // Fetch KP rooms from backend
  const fetchKPRooms = async (location) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/resources/list?location=${location}`);
      setKpRooms(res.data);
    } catch (err) {
      setError("Failed to load rooms");
    }
  };

  useEffect(() => {
    fetchKPRooms("KP");
  }, []);

  // Handle adding a room
  const handleAddRoom = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/resources/add", newRoom, {
        headers: {
          "x-user-role":"admin" 
        },
      });
      setNewRoom({ name: "", location: "KP", type: "Classroom" });
      fetchKPRooms("KP");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add room");
    }
  };

  // Handle deleting a room
  const handleDeleteRoom = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/resources/delete/${id}`, {
        headers: {
          "x-user-role":"admin", 
        },
      });
      fetchKPRooms("KP");
    } catch (err) {
      setError("Failed to delete room");
    }
  };

  return (
    <div className="admin-kp-container">
      <h2>Manage KP Rooms</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleAddRoom} className="add-room-form">
        <input
          type="text"
          placeholder="Room Name"
          value={newRoom.name}
          onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
          required
        />
        <button type="submit">Add Room</button>
      </form>

      <h4>Existing KP Rooms</h4>
      <ul className="kp-room-list">
        {kpRooms.map((room) => (
          <li key={room._id}>
            <span>{room.name} ({room.location})</span>
            <button onClick={() => handleDeleteRoom(room._id)}>Delete</button>
          </li>
        ))}
      </ul>
      <button type='button' onClick={() =>  navigate('/admin-dashboard') }>Go Back</button>

    </div>
  );
};

export default AdminKP;