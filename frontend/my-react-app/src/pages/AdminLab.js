// frontend/pages/AdminLab.js
import React, { useEffect, useState } from "react";
import api from '../utils/auth';
import { useNavigate } from "react-router-dom";
import '../assets/styles/AdminKP.css'; 

const AdminLab = () => {
  const [labRooms, setLabRooms] = useState([]);
  const navigate=useNavigate();
  const [newLab, setNewLab] = useState({
    name: "",
    location: "CSE", 
    type: "Lab",
  });
  const [error, setError] = useState("");

  // Fetch CSE Lab rooms from backend
  const fetchLabRooms = async (location) => {
    try {
      const res = await api.get(`/api/resources/list?location=${location}`);
      setLabRooms(res.data);
    } catch (err) {
      setError("Failed to load lab resources");
    }
  };

  useEffect(() => {
    fetchLabRooms("CSE");
  }, []);

  // Handle adding a new lab
  const handleAddLab = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/resources/add", newLab);
      setNewLab({ name: "", location: "CSE", type: "Lab" });
      fetchLabRooms("CSE");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add lab resource");
    }
  };

  // Handle deleting a lab
  const handleDeleteLab = async (id) => {
    try {
      await api.delete(`/api/resources/delete/${id}`);
      fetchLabRooms("CSE");
    } catch (err) {
      setError("Failed to delete lab resource");
    }
  };

  return (
    <div className="admin-kp-container">
      <h2>Manage CSE Lab Resources</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleAddLab} className="add-room-form">
        <input
          type="text"
          placeholder="Lab Name"
          value={newLab.name}
          onChange={(e) => setNewLab({ ...newLab, name: e.target.value })}
          required
        />
        <button type="submit">Add Lab</button>
      </form>

      <h4>Existing CSE Lab Resources</h4>
      <ul className="kp-room-list">
        {labRooms.map((lab) => (
          <li key={lab._id}>
            <span>{lab.name} ({lab.location})</span>
            <button onClick={() => handleDeleteLab(lab._id)}>Delete</button>
          </li>
        ))}
      </ul>
      <button type='button' onClick={() =>  navigate('/admin-dashboard') }>Go Back</button>
    </div>
  );
};

export default AdminLab;