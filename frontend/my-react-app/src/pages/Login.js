//frontend/my-react-app/pages/Login.js
import React, { useState, useEffect } from "react";
import { login, register, verifyToken } from "../utils/auth";
import "../assets/styles/Login.css";
import { useNavigate } from "react-router-dom";

const LoginPage = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const role = "User";
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Check for existing token on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    
    if (token && user) {
      // Verify token is still valid
      verifyTokenOnMount(token);
    }
  }, []);

  const verifyTokenOnMount = async (token) => {
    try {
      const user = await verifyToken();
      if (onLogin) onLogin(user);
      
      // Redirect based on role
      if (user.role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/user-dashboard");
      }
    } catch (error) {
      // Token is invalid, clear storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userEmail");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      if (isRegister) {
        await register(name, email, password, role);
        setSuccess("Registered successfully. Please login.");
        setError("");
        setIsRegister(false); // switch to login form
        setIsLoading(false);
        return;
      } else {
        const { user, token } = await login(email, password);
        
        if (onLogin) onLogin(user);

        if (user.role === "admin") {
          navigate("/admin-dashboard");
        } else {
          navigate("/user-dashboard");
        }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Something went wrong";
      setError(errorMessage);
      setSuccess("");
    } finally {
      setIsLoading(false);
    }
  };

  const clearForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setError("");
    setSuccess("");
  };

  return (
    <div className="login-container">
      <div className="login-overlay"></div>
      <div className="login-box animate-popup">
        <h2>{isRegister ? "Register" : "Login"}</h2>

        {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}
        {success && (
          <p style={{ color: "green", fontSize: "14px" }}>{success}</p>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
                disabled={isLoading}
              />
            </div>
          )}

          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label>Role:</label>
              <input
                type="text"
                className="form-control"
                name="Role"
                value={role}
                disabled
              />
            </div>
          )}

          <button 
            type="submit" 
            className="btn-primary"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : (isRegister ? "Register" : "Login")}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "15px" }}>
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <span
            style={{ color: "#007bff", cursor: "pointer" }}
            onClick={() => {
              clearForm();
              setIsRegister(!isRegister);
            }}
          >
            {isRegister ? "Login" : "Register"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;