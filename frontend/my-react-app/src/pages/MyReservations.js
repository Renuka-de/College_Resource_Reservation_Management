
// src/pages/MyReservations.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MyReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const user = localStorage.getItem("user");
  const userobj = JSON.parse(user);
  const userName = userobj.name;
  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    const fetchReservations = async () => {
      if (!userEmail) {
        setError("Please login to view your reservations.");
        return;
      }

      try {
        const res = await axios.get("http://localhost:5000/api/reservations/my", {
          headers: {
            "x-user-email": userEmail,
          },
        });
        setReservations(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch your reservations.");
      }
    };

    fetchReservations();
  }, [userEmail]);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this reservation?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/reservations/cancel/${id}`, {
        headers: {
          "x-user-email": userEmail,
        },
      });

      // Remove from UI
      setReservations((prev) => prev.filter((res) => res._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to cancel reservation.");
    }
  };

  const handleBack = () => {
    navigate("/user-dashboard");
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">My Reservations</h2>
      <h3>Welcome {userName}</h3>

      <button className="btn btn-secondary mb-4" onClick={handleBack}>
        ⬅ Back to Dashboard
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {reservations.length === 0 && !error ? (
        <p>No reservations found.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead className="thead-dark">
              <tr>
                <th>#</th>
                <th>Resource Name</th>
                <th>Location</th>
                <th>Date</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Purpose</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((res, index) => (
                <tr key={res._id || index}>
                  <td>{index + 1}</td>
                  <td>{res.resourcename}</td>
                  <td>{res.location}</td>
                  <td>{res.date}</td>
                  <td>{res.startTime}</td>
                  <td>{res.endTime}</td>
                  <td>{res.purpose}</td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleCancel(res._id)}
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyReservations;

