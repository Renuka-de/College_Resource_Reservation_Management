//src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login"; // Assuming you have a Login page
import UserDashboard from "./pages/Userdashboard"; // Corrected the import for Userdashboard.js
import AdminDashboard from "./pages/Admindashboard"; // Corrected the import for Admindashboard.js
import AdminKP from "./pages/AdminKP";
import UserKP from "./pages/UserKP";
import BookingPage from "./pages/BookingPage";
import AdminLab from "./pages/AdminLab";
import UserLab from "./pages/UserLab";
import AvailableRooms from "./pages/AvailableRooms";
import MyReservations from "./pages/MyReservations";
 
function App() {
  return (
    <Router>
      <Routes>
        
        <Route path="/" element={<Login />} />
        <Route path="/user-dashboard" element={<UserDashboard />} /> 
        <Route path="/admin-dashboard" element={<AdminDashboard />} /> 
        <Route path="/user-kp" element={<UserKP />} />
        <Route path="/admin-kp" element={<AdminKP />} />
        <Route path="/book-room/:roomId" element={<BookingPage />} />
        <Route path="/admin-lab" element={<AdminLab/>}/>
        <Route path="/user-lab" element={<UserLab/>}/>
        <Route path="/available-rooms" element={<AvailableRooms/>}/>
        <Route path="/my-reservations" element={<MyReservations />} />
       
      </Routes>
    </Router>
  );
}

export default App;