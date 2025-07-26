const jwt = require("jsonwebtoken");

module.exports = (db) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      
      if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
      }

      const decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET || "your-secret-key-change-in-production"
      );

      // Add user info to request for use in route handlers
      req.user = decoded;
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired. Please login again." });
      }
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Invalid token." });
      }
      console.error("Auth middleware error:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  };
}; 