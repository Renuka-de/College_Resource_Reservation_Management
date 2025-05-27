import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import '../assets/styles/BookingPage.css';

const BookingPage = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { date, startTime, endTime } = location.state || {};
  const loggedUser = JSON.parse(localStorage.getItem("user"));

  const [room, setRoom] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    userEmail: loggedUser?.email || "",
    userName: loggedUser?.name || "",
    date: date || "",
    startTime: startTime || "",
    endTime: endTime || "",
    purpose: "",
  });

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/resources/${roomId}`);
        setRoom(res.data);
      } catch (err) {
        setError("Failed to load room details.");
      }
    };
    fetchRoom();
  }, [roomId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleBook = async () => {
    try {
      // Step 1: Check for existing reservation with same purpose
      const conflictCheck = await axios.get(`http://localhost:5000/api/reservations/check-purpose`, {
        params: {
          resourceId: roomId,
          date: form.date,
          startTime: form.startTime,
          endTime: form.endTime,
          purpose: form.purpose,
        },
      });

      if (conflictCheck.data.conflict) {
        const proceed = window.confirm("A reservation with the same purpose already exists at this time. Do you still want to book?");
        if (!proceed) {
          navigate('/user-dashboard') ;
          return;// Cancel booking
        }
      }

      // Step 2: Proceed with booking
      await axios.post(`http://localhost:5000/api/reservations/book`, {
        resourceId: roomId,
        ...form,
      });

      alert("Room booked successfully!");
      navigate("/user-dashboard");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Booking failed.");
    }
  };

  if (error) return <p className="error-message">{error}</p>;
  if (!room) return <p className="error-message">Loading...</p>;

  return (
    <div className="booking-container">
      <div className="booking-box">
        <h2>{room.name}</h2>
        <p><strong>Location:</strong> {room.location}</p>

        <div className="booking-form">
          <input name="userEmail" value={form.userEmail} disabled />
          <input name="userName" value={form.userName} disabled />
          <input name="date" type="date" value={form.date} disabled />
          <input name="startTime" type="time" value={form.startTime} disabled />
          <input name="endTime" type="time" value={form.endTime} disabled />
          <input
            name="purpose"
            placeholder="Purpose of Booking"
            value={form.purpose}
            onChange={handleChange}
          />
          <button onClick={handleBook}>Book Room</button>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;

