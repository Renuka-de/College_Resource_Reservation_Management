//frontend/my-react-app/pages/Login.js
import React, { useState } from "react";
import axios from "axios";
import "../assets/styles/Login.css";
import { useNavigate } from "react-router-dom";

const LoginPage = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const role="User"
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(""); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";

    try {
      const payload = isRegister
        ? { name, email, password, role }
        : { email, password };

      const res = await axios.post(endpoint, payload);
      const user = res.data.user;

      if (isRegister && !user) {
        setSuccess("Registered successfully. Please login.");
        setError("");
        setIsRegister(false); // switch to login form
        return;
      }

      // For login or if user is returned during register
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("userEmail", user.email);
      if (onLogin) onLogin(user);

      if (user.role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/user-dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
      setSuccess(""); 
    }
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

          <button type="submit" className="btn-primary">
            {isRegister ? "Register" : "Login"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "15px" }}>
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <span
            style={{ color: "#007bff", cursor: "pointer" }}
            onClick={() => {
              setError("");
              setSuccess("");
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