//backend/routes/location.js
const express = require("express");
const router = express.Router();

module.exports = () => {
  const locations = ["KP", "CSE DEPARTMENT"]; // You can expand this

  // GET all available locations
  router.get("/", (req, res) => {
    res.json(locations);
  });

  return router;
};
