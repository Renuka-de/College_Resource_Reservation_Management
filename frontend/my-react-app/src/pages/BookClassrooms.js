import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import api from '../utils/auth';
import '../assets/styles/BookingPage.css';

const BookClassrooms = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setError("");
    } else {
      setError("Please select a valid PDF file");
      setSelectedFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError("Please select a PDF file");
      return;
    }

    if (!startDate || !endDate) {
      setError("Please select both start date and end date");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError("Start date must be before or equal to end date");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('timetable', selectedFile);
      formData.append('startDate', startDate);
      formData.append('endDate', endDate);
      // Batch name will be extracted automatically from PDF

      const response = await api.post('/api/reservations/bulk-book-timetable', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult({
        success: response.data.success,
        booked: response.data.booked || 0,
        failed: response.data.failed || 0,
        errors: response.data.errors || [],
        message: response.data.message,
      });
    } catch (err) {
      console.error("Booking error:", err);
      setError(err.response?.data?.message || "Failed to process timetable. Please check the PDF format.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-container">
      <div className="booking-box">
        <h2>Book Classrooms from Timetable</h2>
        <p>Upload a PDF timetable to automatically book classrooms for all time slots. Batch name will be extracted automatically from the PDF.</p>

        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-group">
            <label htmlFor="timetable">Upload Timetable PDF:</label>
            <input
              id="timetable"
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              required
            />
            {selectedFile && (
              <p style={{ marginTop: '10px', color: '#666' }}>
                Selected: {selectedFile.name}
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="startDate">Reservation Start Date:</label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">Reservation End Date:</label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
            <p style={{ marginTop: '5px', fontSize: '0.9em', color: '#666' }}>
              Resources will be booked for all dates within this range based on the timetable schedule.
            </p>
          </div>

          {error && (
            <div style={{ color: 'red', marginBottom: '15px' }}>
              {error}
            </div>
          )}

          {result && (
            <div style={{ 
              marginBottom: '15px', 
              padding: '15px', 
              backgroundColor: result.success ? '#d4edda' : '#f8d7da',
              border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`,
              borderRadius: '4px'
            }}>
              <h4>{result.success ? '✓ Booking Complete' : '⚠ Booking Incomplete'}</h4>
              <p>{result.message}</p>
              <p>Successfully booked: {result.booked}</p>
              {result.failed > 0 && <p>Failed bookings: {result.failed}</p>}
              {result.errors && result.errors.length > 0 && (
                <details style={{ marginTop: '10px' }}>
                  <summary>View errors</summary>
                  <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                    {result.errors.slice(0, 10).map((err, idx) => (
                      <li key={idx} style={{ fontSize: '0.9em' }}>{err}</li>
                    ))}
                    {result.errors.length > 10 && (
                      <li>... and {result.errors.length - 10} more errors</li>
                    )}
                  </ul>
                </details>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              type="submit" 
              disabled={loading}
              style={{ flex: 1 }}
            >
              {loading ? 'Processing...' : 'Upload & Book Classrooms'}
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/admin-dashboard')}
              style={{ flex: 1 }}
            >
              Go Back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookClassrooms;

