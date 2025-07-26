//src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import UserDashboard from "./pages/Userdashboard";
import AdminDashboard from "./pages/Admindashboard";
import AdminKP from "./pages/AdminKP";
import UserKP from "./pages/UserKP";
import BookingPage from "./pages/BookingPage";
import AdminLab from "./pages/AdminLab";
import UserLab from "./pages/UserLab";
import AvailableRooms from "./pages/AvailableRooms";
import MyReservations from "./pages/MyReservations";
import { isAuthenticated, isAdmin, requireAuth, requireAdmin } from "./utils/auth";

// Protected Route Components
const ProtectedRoute = ({ children, requireAdminAccess = false }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  
  if (requireAdminAccess && !isAdmin()) {
    return <Navigate to="/user-dashboard" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* User Routes */}
        <Route 
          path="/user-dashboard" 
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/user-kp" 
          element={
            <ProtectedRoute>
              <UserKP />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/user-lab" 
          element={
            <ProtectedRoute>
              <UserLab />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/book-room/:roomId" 
          element={
            <ProtectedRoute>
              <BookingPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/available-rooms" 
          element={
            <ProtectedRoute>
              <AvailableRooms />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/my-reservations" 
          element={
            <ProtectedRoute>
              <MyReservations />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin Routes */}
        <Route 
          path="/admin-dashboard" 
          element={
            <ProtectedRoute requireAdminAccess={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin-kp" 
          element={
            <ProtectedRoute requireAdminAccess={true}>
              <AdminKP />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin-lab" 
          element={
            <ProtectedRoute requireAdminAccess={true}>
              <AdminLab />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;