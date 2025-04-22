module.exports = (req, res, next) => {
    const userRole = req.headers["x-user-role"]; // Get role from headers
  
    if (userRole !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }
  
    next();
  };
  