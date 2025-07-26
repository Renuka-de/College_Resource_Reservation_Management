//backend/routes/resources.js
const express = require("express");
const { ObjectId } = require("mongodb");
const router = express.Router();
const checkAdmin = require("../middlewares/checkAdmin");

module.exports = (db) => {
  const checkAdminMiddleware = checkAdmin(db);
  const resourceCollection = db.collection("resources");
  
  // View all resources
  router.get("/list", async (req, res) => {
    try {
      const { location } = req.query;
      const query = location ? { location } : {};
      const resources = await resourceCollection.find(query).sort({ name: 1 }) .toArray();
      res.json(resources);
    } catch (err) {
      console.error("Fetch error:", err);
      res.status(500).json({ message: "Failed to fetch resources" });
    }
  });

  // Get resources by location
  router.get("/location/:location", async (req, res) => {
    try {
      const { location } = req.params;
      const resources = await resourceCollection.find({ location }).toArray();

      if (!resources || resources.length === 0) {
        return res.status(404).json({ message: "No resources found in this location" });
      }

      res.json(resources);
    } catch (err) {
      res.status(500).json({ message: "Error fetching resources by location" });
    }
  });
  // Add a new resource
  router.post("/add", checkAdminMiddleware, async (req, res) => {
    const { name, type, location } = req.body;
    if (!name || !type || !location) {
      return res.status(400).json({ message: "All fields required" });
    }

    try {
      const result = await resourceCollection.insertOne({
        name,
        type,
        location,
        availability: true,
      });
      res.status(201).json({ message: "Resource added", id: result.insertedId });
    } catch (err) {
      console.error("Insert error:", err);
      res.status(500).json({ message: "Failed to add resource" });
    }
  });

  // GET /api/resources/:id
  router.get("/:id", async (req, res) => {
    try {
      const resourceId = req.params.id;
      console.log("Received GET /api/resources/:id with ID:", resourceId);
  
      if (!ObjectId.isValid(resourceId)) {
        console.log("Invalid ObjectId:", resourceId);
        return res.status(400).json({ message: "Invalid resource ID" });
      }
  
      const resource = await resourceCollection.findOne({ _id: new ObjectId(resourceId) });
      console.log("Resource found:", resource);
  
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }
  
      res.json(resource);
    } catch (err) {
      console.error("Error fetching resource by ID:", err);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  

  // Delete a resource
  router.delete("/delete/:id", checkAdminMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const result = await resourceCollection.deleteOne({ _id: new ObjectId(id) });
      res.json({ message: "Deleted", deletedCount: result.deletedCount });
    } catch (err) {
      console.error("Delete error:", err);
      res.status(400).json({ message: "Invalid ID or deletion failed" });
    }
  });

  
  // src/routes/resources.js

router.patch("/update/:id", async (req, res) => {
  console.log("Received PATCH for ID:", req.params.id); // Log to check if the route is reached
  const { id } = req.params;
  const { availability } = req.body;

  // Make sure we're checking the right collection and the update works
  const result = await resourceCollection.updateOne(
    { _id: new ObjectId(id) }, 
    { $set: { availability: availability } }
  );

  if (result.modifiedCount > 0) {
    res.json({ message: "Room availability updated successfully" });
  } else {
    res.status(404).json({ message: "Room not found or availability not updated" });
  }
});

  return router;
};