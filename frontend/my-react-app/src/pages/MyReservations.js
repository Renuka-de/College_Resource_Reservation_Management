//src/pages/MyReservations.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/MyReservations.css';

const MyReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const user = localStorage.getItem("user");
  const userobj = JSON.parse(user);
  const userName = userobj.name;
  const userEmail = userobj.email;

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    if (!userEmail) {
      setError("Please login to view your reservations.");
      return;
    }

    try {
      const res = await axios.get("http://localhost:5000/api/reservations/my", {
        headers: { "x-user-email": userEmail },
      });
      setReservations(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch your reservations.");
    }
  };

  const handleDelete = async (reservationId) => {
    if (!window.confirm("Are you sure you want to cancel this reservation?")) {
      return;
    }

    try {
      await axios.delete(
        `http://localhost:5000/api/reservations/cancel/${reservationId}`,
        { headers: { "x-user-email": userEmail } }
      );
      setSuccess("Reservation cancelled successfully!");
      fetchReservations();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err);
      setError("Failed to cancel reservation.");
    }
  };

  const handleBack = () => {
    navigate("/user-dashboard");
  };

  // Function to check if a reservation is in the past
  const getReservationStatus = (reservationDate, reservationTime) => {
    const now = new Date();
    const [year, month, day] = reservationDate.split('-');
    const [hours, minutes] = reservationTime.split(':');
    
    const reservationDateTime = new Date(year, month - 1, day, hours, minutes);
    return now > reservationDateTime ? "Completed" : "Upcoming";
  };

  return (
    <div className="container11 mt11-5" style={{ background: 'linear-gradient(135deg, #dfe4e8, #b7a5ef)', minHeight: '100vh', padding: '2rem' }}>
      <div className="reservations-card11">
        <h2 className="mb11-4">My Reservations</h2>
        <h3 className="welcome-text11">Welcome {userName}</h3>
        
        <button className="back-button11" onClick={handleBack}>
          ⬅ Back to Dashboard
        </button>

        {error && <p className="text-danger11">{error}</p>}
        {success && <p className="text-success11">{success}</p>}

        {reservations.length === 0 ? (
          <p className="no-reservations11">No reservations found.</p>
        ) : (
          <div className="table-responsive11">
            <table className="table11 table-bordered11">
              <thead className="thead-dark11">
                <tr>
                  <th></th>
                  <th>Resource Name</th>
                  <th>Location</th>
                  <th>Date</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Purpose</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((res, index) => {
                  const status = getReservationStatus(res.date, res.startTime);
                  return (
                    <tr key={res._id || index}>
                      <td>{index + 1}</td>
                      <td>{res.resourcename}</td>
                      <td>{res.location}</td>
                      <td>{res.date}</td>
                      <td>{res.startTime}</td>
                      <td>{res.endTime}</td>
                      <td>{res.purpose}</td>
                      <td>
                        <span className={`badge11 ${
                          status === "Upcoming" ? "bg-primary11" : "bg-secondary11"
                        }`}>
                          {status}
                        </span>
                      </td>
                      <td>
                        {status === "Upcoming" && (
                          <button 
                            className="btn11 btn-danger11 btn-sm11"
                            onClick={() => handleDelete(res._id)}
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReservations;