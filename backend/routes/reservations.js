// backend/routes/reservations.js
const express = require("express");
const { ObjectId } = require("mongodb");
const router = express.Router();
const { sendEmail } = require('../utils/mailer');



module.exports = (db) => {
  const reservations = db.collection("reservations");
  const resources = db.collection("resources");

router.post("/book", async (req, res) => {
  const { resourceId, userEmail, userName, date, startTime, endTime, purpose } = req.body;

  try {
    const resources = db.collection('resources');
    const reservations = db.collection('reservations');

    const resource = await resources.findOne({ _id: new ObjectId(resourceId) });

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

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

    const result = await reservations.insertOne({
      resourceId,
      resourcename: resource.name,
      location: resource.location,
      userEmail,
      userName,
      date,
      startTime,
      endTime,
      purpose,
      status: "Booked",
    });

    // ✅ After successful booking, send email
    const subject = "Booking Confirmation - College Resource Reservation";
    const text = `Greetings ${userName},

Your booking for "${resource.name}" at location "${resource.location}" has been confirmed.

Date: ${date}
Time: ${startTime} to ${endTime}
Purpose: ${purpose}

Thank you,
College Resource Reservation Management Team`;

    await sendEmail(userEmail, subject, text);

    res.json({ message: "Room booked successfully and confirmation email sent!", reservationId: result.insertedId });
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ message: "Internal server error during booking" });
  }
});


  // Check if a reservation with same purpose already exists
  router.get("/check-purpose", async (req, res) => {
    let { date, startTime, endTime, purpose } = req.query;
  
    purpose = purpose?.trim(); // TRIM the purpose
  
    try {
      const existingReservation = await reservations.findOne({
        date,
        purpose,
        $and: [
          { startTime: { $lt: endTime } },
          { endTime: { $gt: startTime } }
        ]
      });
  
      if (existingReservation) {
        return res.json({ conflict: true });
      } else {
        return res.json({ conflict: false });
      }
    } catch (error) {
      console.error("Error checking purpose conflict:", error);
      res.status(500).json({ message: "Error checking reservation purpose conflict" });
    }
  });
  

    router.get("/available", async (req, res) => {
      const { date, startTime, endTime, type, location } = req.query;
    
      console.log("Checking availability for:", date, startTime, endTime, type, location);
    
      if (!date || !startTime || !endTime) {
        return res.status(400).json({ message: "Missing date or time range" });
      }
    
      try {
        // Find conflicting reservations
        const conflicts = await reservations.find({
          date,
          $or: [
            {
              startTime: { $lt: endTime },
              endTime: { $gt: startTime },
            },
          ],
        }).toArray();
    
        // Map resourceId to purpose
        const reservedMap = {};
        conflicts.forEach((r) => {
          try {
            reservedMap[r.resourceId] = r.purpose; // store purpose by resourceId
          } catch {
            // Ignore if invalid id
          }
        });
    
        // Build base query
        const query = {};
        if (type) query.type = type;
        if (location) query.location = location;
    
        const allResources = await resources.find(query).sort({ name: 1 }).toArray();
    
        // Mark each room as Available or Booked with purpose if booked
        const roomsWithStatus = allResources.map((room) => {
          const bookedPurpose = reservedMap[room._id?.toString()];
          return {
            ...room,
            status: bookedPurpose ? "Booked" : "Available",
            purpose: bookedPurpose || null,
          };
        });
    
        res.json(roomsWithStatus);
      } catch (error) {
        console.error("Error checking availability:", error);
        res.status(500).json({ message: "Server error checking availability" });
      }
    });


  router.delete("/cancel/:reservationId", async (req, res) => {
    const { reservationId } = req.params;
    const userEmail = req.headers["x-user-email"];
    
  
    try {
      // Find reservation to get the resource name and booking details
      const reservation = await reservations.findOne({ 
        _id: new ObjectId(reservationId), 
        userEmail 
      });
  
      if (!reservation) {
        return res.status(403).json({ message: "Not allowed or not found" });
      }
  
      // Delete reservation
      const result = await reservations.deleteOne({
        _id: new ObjectId(reservationId),
        userEmail,
      });
  
      if (result.deletedCount === 0) {
        return res.status(403).json({ message: "Not allowed or not found" });
      }
  
      // Send email confirmation
      const subject = "Reservation Cancellation Confirmation";
      const text = `Greetings ,
  
  Your reservation for the resource "${reservation.resourcename}" at location "${reservation.location}" has been successfully cancelled.
  
  Date: ${reservation.date}
  Time: ${reservation.startTime} to ${reservation.endTime}
  Purpose: ${reservation.purpose}
  
  If you did not request this cancellation or need further assistance, please contact our support.
  
  Thank you,
  College Resource Reservation Management Team`;
  
      // Send cancellation email
      await sendEmail(userEmail, subject, text);
  
      res.json({ message: "Reservation cancelled and cancellation email sent." });
    } catch (error) {
      console.error("Cancellation error:", error);
      res.status(500).json({ message: "Error while cancelling reservation" });
    }
  });


router.get("/my", async (req, res) => {
  const userEmail = req.headers["x-user-email"];

  try {
    const myReservations = await reservations.find({ userEmail })
      .sort({ date: 1, startTime: 1 }) // Sort by date and time
      .toArray();
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

