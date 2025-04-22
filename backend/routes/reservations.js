// backend/routes/reservations.js
const express = require("express");
const { ObjectId } = require("mongodb");
const router = express.Router();

module.exports = (db) => {
  const reservations = db.collection("reservations");
  const resources = db.collection("resources");

  // 🟢 Book a room
  router.post("/book", async (req, res) => {
    const { resourceId, userEmail, userName, date, startTime, endTime, purpose } = req.body;

    try {
      // Convert string to ObjectId
      const resource = await resources.findOne({ _id: new ObjectId(resourceId) });

      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }

      // Check for conflicting bookings
      const conflict = await reservations.findOne({
        resourceId,
        date,
        $or: [
          {
            startTime: { $lt: endTime },
            endTime: { $gt: startTime },
          },
        ],
      });

      if (conflict) {
        return res.status(400).json({ message: "Slot already booked" });
      }

      // Insert the new reservation
      const result = await reservations.insertOne({
        resourceId,
        resourcename:resource.name,
        location: resource.location,
        userEmail,
        userName,
        date,
        startTime,
        endTime,
        purpose,
        status: "Booked",
      });

      res.json({ message: "Room booked successfully!", reservationId: result.insertedId });
    } catch (error) {
      console.error("Booking error:", error);
      res.status(500).json({ message: "Internal server error during booking" });
    }
  });

  
    // ✅ Check available rooms/labs for given date, time, type, and location
    router.get("/available", async (req, res) => {
      const { date, startTime, endTime, type, location } = req.query;
  
      console.log("Checking availability for:", date, startTime, endTime, type, location);
  
      if (!date || !startTime || !endTime) {
        return res.status(400).json({ message: "Missing date or time range" });
      }
  
      try {
        const conflicts = await reservations
          .find({
            date,
            $or: [
              {
                startTime: { $lt: endTime },
                endTime: { $gt: startTime },
              },
            ],
          })
          .toArray();
  
        const reservedIds = conflicts
          .map((r) => {
            try {
              return new ObjectId(r.resourceId);
            } catch {
              return null;
            }
          })
          .filter(Boolean);
  
        // Dynamic filter
        const query = {
          _id: { $nin: reservedIds },
        };
  
        if (type) query.type = type;
        if (location) query.location = location;
  
        const availableResources = await resources
          .find(query)
          .sort({ name: 1 })
          .toArray();
  
        res.json(availableResources);
      } catch (error) {
        console.error("Error checking availability:", error);
        res.status(500).json({ message: "Server error checking availability" });
      }
    });
  

  // ❌ Cancel a reservation
  router.delete("/cancel/:reservationId", async (req, res) => {
    const { reservationId } = req.params;
    const userEmail = req.headers["x-user-email"];

    try {
      const result = await reservations.deleteOne({
        _id: new ObjectId(reservationId),
        userEmail,
      });

      if (result.deletedCount === 0) {
        return res.status(403).json({ message: "Not allowed or not found" });
      }

      res.json({ message: "Reservation cancelled" });
    } catch (error) {
      console.error("Cancellation error:", error);
      res.status(500).json({ message: "Error while cancelling reservation" });
    }
  });

  // 📄 Get user’s reservations
  router.get("/my", async (req, res) => {
    const userEmail = req.headers["x-user-email"];

    try {
      const myReservations = await reservations.find({ userEmail }).toArray();
      res.json(myReservations);
    } catch (error) {
      console.error("Fetching user reservations failed:", error);
      res.status(500).json({ message: "Failed to retrieve reservations" });
    }
  });

  // 🧾 Get full resource details by ID
  router.get("/:resourceId", async (req, res) => {
    const { resourceId } = req.params;
    try {
      const resource = await resources.findOne({ _id: new ObjectId(resourceId) });
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }
      res.json(resource);
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  return router;
};

