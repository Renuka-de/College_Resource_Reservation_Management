// backend/routes/reservations.js
const express = require("express");
const { ObjectId } = require("mongodb");
const router = express.Router();
const { sendEmail } = require('../utils/mailer');
const auth = require('../middlewares/auth');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });



module.exports = (db) => {
  const reservations = db.collection("reservations");
  const resources = db.collection("resources");
  const authMiddleware = auth(db);

router.post("/book", authMiddleware, async (req, res) => {
  const { resourceId, date, startTime, endTime, purpose } = req.body;
  const userEmail = req.user.email; // Get from JWT token
  const userName = req.user.name; // Get from JWT token
  
  console.log("Booking request:", { userEmail, userName, resourceId, date, startTime, endTime, purpose });

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


  router.delete("/cancel/:reservationId", authMiddleware, async (req, res) => {
    const { reservationId } = req.params;
    const userEmail = req.user.email; // Get from JWT token
    
  
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


router.get("/my", authMiddleware, async (req, res) => {
  const userEmail = req.user.email; // Get from JWT token
  console.log("Fetching reservations for user:", userEmail);

  try {
    const myReservations = await reservations.find({ userEmail })
      .sort({ date: 1, startTime: 1 }) // Sort by date and time
      .toArray();
    console.log("Found reservations:", myReservations.length);
    res.json(myReservations);
  } catch (error) {
    console.error("Fetching user reservations failed:", error);
    res.status(500).json({ message: "Failed to retrieve reservations" });
  }
});



  // Bulk book from timetable PDF
  router.post("/bulk-book-timetable", authMiddleware, upload.single('timetable'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No PDF file uploaded" });
      }

      const userEmail = req.user.email;
      const startDate = req.body.startDate;
      const endDate = req.body.endDate;

      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }

      if (new Date(startDate) > new Date(endDate)) {
        return res.status(400).json({ message: "Start date must be before or equal to end date" });
      }

      // Parse PDF first - pdf-parse v1.x works as a direct function
      let pdfData;
      try {
        const pdfParse = require('pdf-parse');
        pdfData = await pdfParse(req.file.buffer);
      } catch (error) {
        console.error('PDF parsing error:', error);
        return res.status(400).json({ 
          message: `Error parsing PDF: ${error.message}. Please ensure the PDF is readable and not corrupted.` 
        });
      }

      const text = pdfData.text;

      console.log("PDF Text extracted:", text.substring(0, 500));

      // Extract batch name dynamically from PDF
      // Look for "PROGRAMME AND BRANCH WITH SEMESTER AND BATCH:" pattern first
      let batchName = null;
      
      // Pattern 1: Extract after "PROGRAMME AND BRANCH WITH SEMESTER AND BATCH:"
      const programmePattern = /PROGRAMME\s+AND\s+BRANCH\s+WITH\s+SEMESTER\s+AND\s+BATCH\s*:\s*([^\n\r]+)/i;
      let programmeMatch = text.match(programmePattern);
      
      if (programmeMatch && programmeMatch[1]) {
        batchName = programmeMatch[1].trim();
        console.log("Extracted batch name from PROGRAMME AND BRANCH header:", batchName);
      } else {
        // Fallback patterns if the header format is different
        // Pattern 2: Full "B.E CSE – IV SEMESTER – N BATCH" format
        const batchPattern1 = /(B\.E\s+CSE\s*[–-]+\s*[IVX]+\s+SEMESTER\s*[–-]+\s*[A-Z\s]+BATCH)/i;
        // Pattern 3: "B.E CSE – IV SEMESTER – N BATCH" with flexible spacing
        const batchPattern2 = /(B\.\s*E\s*CSE\s*[–-\s]+\s*[IVX]+\s+SEMESTER\s*[–-\s]+\s*[A-Z\s]+BATCH)/i;
        // Pattern 4: Any variation with semester and batch
        const batchPattern3 = /([A-Z\.]+[\.]?\s*CSE\s*[–-\s]+\s*[IVX]+\s+SEMESTER\s*[–-\s]+\s*[A-Z\s]+BATCH)/i;
        // Pattern 5: Just "N BATCH" or similar standalone (fallback)
        const batchPattern4 = /([A-Z]+\s+BATCH)/i;

        let batchMatch = text.match(batchPattern1) || text.match(batchPattern2) || text.match(batchPattern3) || text.match(batchPattern4);
        
        if (batchMatch) {
          batchName = (batchMatch[1] || batchMatch[0]).trim();
          console.log("Extracted batch name using fallback pattern:", batchName);
        }
      }

      if (!batchName) {
        return res.status(400).json({ 
          message: "Could not extract batch name from PDF. Please ensure the PDF contains batch information like 'B.E CSE – IV SEMESTER – N BATCH' or similar format." 
        });
      }

      const userName = req.user.name || batchName;

      // Extract timetable data from PDF text with date range
      const timetableData = parseTimetablePDF(text, batchName, startDate, endDate);

      if (!timetableData || timetableData.length === 0) {
        return res.status(400).json({ 
          message: "Could not extract timetable data from PDF. Please ensure the PDF contains hall numbers (e.g., Hall.No:105) and time slots in a readable format." 
        });
      }

      // Get all KP resources to map hall names to resource IDs
      const allResources = await resources.find({ location: "KP" }).toArray();
      const resourceMap = {};
      allResources.forEach(resource => {
        // Normalize resource names for matching (remove spaces, convert to lowercase)
        const normalizedName = resource.name.toLowerCase().replace(/\s+/g, '');
        resourceMap[normalizedName] = resource;
        // Also map with original name
        resourceMap[resource.name.toLowerCase()] = resource;
        
        // Extract just the number from names like "KP-105" and map it
        const numberMatch = resource.name.match(/(\d+)/);
        if (numberMatch) {
          const hallNumber = numberMatch[1];
          resourceMap[`kp-${hallNumber}`] = resource;
          resourceMap[hallNumber] = resource;
        }
      });
      
      console.log(`Mapped ${allResources.length} KP resources for matching`);

      const results = {
        booked: 0,
        failed: 0,
        errors: []
      };

      // Book each slot
      for (const slot of timetableData) {
        try {
          // Find resource by hall name/number
          // slot.hall should be in format "KP-105"
          const hallKey = slot.hall.toLowerCase().replace(/\s+/g, '');
          let resource = resourceMap[hallKey];

          // If not found, try extracting just the number
          if (!resource) {
            const numberMatch = slot.hall.match(/(\d+)/);
            if (numberMatch) {
              const hallNumber = numberMatch[1];
              resource = resourceMap[`kp-${hallNumber}`] || resourceMap[hallNumber];
            }
          }

          // Try alternative matching patterns
          if (!resource) {
            // Try matching with "KP-" prefix (remove duplicate KP- if exists)
            const altKey = hallKey.replace(/^kp-kp/, 'kp');
            resource = resourceMap[altKey];
          }

          if (!resource) {
            // Try partial match (check if any key contains the hall number)
            const numberMatch = slot.hall.match(/(\d+)/);
            if (numberMatch) {
              const hallNumber = numberMatch[1];
              for (const [key, res] of Object.entries(resourceMap)) {
                if (key.includes(hallNumber)) {
                  resource = res;
                  break;
                }
              }
            }
          }

          if (!resource) {
            results.failed++;
            results.errors.push(`Resource not found for hall: ${slot.hall}`);
            continue;
          }

          // Check for conflicts
          const conflict = await reservations.findOne({
            resourceId: resource._id.toString(),
            date: slot.date,
            $or: [
              {
                startTime: { $lt: slot.endTime },
                endTime: { $gt: slot.startTime },
              },
            ],
          });

          if (conflict) {
            results.failed++;
            results.errors.push(`Conflict: ${slot.hall} on ${slot.date} at ${slot.startTime}-${slot.endTime}`);
            continue;
          }

          // Create booking with the batch name as purpose (extracted from PDF)
          const purpose = batchName;
          await reservations.insertOne({
            resourceId: resource._id.toString(),
            resourcename: resource.name,
            location: resource.location,
            userEmail,
            userName,
            date: slot.date,
            startTime: slot.startTime,
            endTime: slot.endTime,
            purpose,
            status: "Booked",
          });

          results.booked++;
        } catch (error) {
          results.failed++;
          results.errors.push(`Error booking ${slot.hall} on ${slot.date}: ${error.message}`);
        }
      }

      res.json({
        success: results.booked > 0,
        message: `Booked ${results.booked} slots${results.failed > 0 ? `, ${results.failed} failed` : ''}`,
        booked: results.booked,
        failed: results.failed,
        errors: results.errors
      });
    } catch (error) {
      console.error("Bulk booking error:", error);
      res.status(500).json({ message: "Error processing timetable: " + error.message });
    }
  });

  // Helper function to parse timetable PDF text
  function parseTimetablePDF(text, batchName, startDate, endDate) {
    const bookings = [];
    
    // Normalize text but keep original for position matching
    const normalizedText = text.toLowerCase();
    const lines = text.split('\n');
    
    // Find hall/room patterns - specifically handle "Hall.No:105" format
    const hallPatterns = [
      /hall\.no\s*:?\s*(\d+[a-z]?)/gi,  // Hall.No:105 or Hall.No : 105
      /hall\s*no\s*:?\s*(\d+[a-z]?)/gi,  // Hall No:105 or Hall No : 105
      /\(hall\.no\s*:?\s*(\d+[a-z]?)\)/gi,  // (Hall.No:105)
      /kp-?\s*\(?hall\.no\s*:?\s*(\d+[a-z]?)\)?/gi,  // KP (Hall.No:105)
      /kp-?\s*(\d+[a-z]?)/gi,  // KP-101, KP 101
      /hall-?\s*(\d+[a-z]?)/gi,  // Hall-1, Hall 1
      /room-?\s*(\d+[a-z]?)/gi,  // Room-1, Room 1
      /(\d{3,4}[a-z]?)/g  // Generic 3-4 digit numbers (fallback)
    ];

    // Time slot patterns - handle both colon (9:00) and dot (8.30) formats
    // Pattern 1: 9:00-10:00 or 09:00 AM - 10:00 AM
    // Pattern 2: 8.30 - 9.20 AM (dot format)
    const timePattern = /(\d{1,2})[.:](\d{2})\s*(?:am|pm)?\s*[-–—]\s*(\d{1,2})[.:](\d{2})\s*(?:am|pm)?/gi;
    
    // Day patterns
    const dayPatterns = {
      monday: /monday|mon/gi,
      tuesday: /tuesday|tue/gi,
      wednesday: /wednesday|wed/gi,
      thursday: /thursday|thu/gi,
      friday: /friday|fri/gi,
      saturday: /saturday|sat/gi,
      sunday: /sunday|sun/gi
    };

    // Extract days present in timetable
    const daysFound = [];
    for (const [day, pattern] of Object.entries(dayPatterns)) {
      if (pattern.test(text)) {
        daysFound.push(day);
      }
    }

    // If no specific days found, assume Monday-Friday
    const days = daysFound.length > 0 ? daysFound : ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

    // Extract all time slots with their positions
    const timeSlots = [];
    let timeMatch;
    while ((timeMatch = timePattern.exec(text)) !== null) {
      const startHour = parseInt(timeMatch[1]);
      const startMin = parseInt(timeMatch[2]);
      const endHour = parseInt(timeMatch[3]);
      const endMin = parseInt(timeMatch[4]);
      
      // Handle 12-hour format if needed
      let startHour24 = startHour;
      let endHour24 = endHour;
      const timeStr = timeMatch[0].toLowerCase();
      if (timeStr.includes('pm')) {
        if (startHour < 12) startHour24 = startHour + 12;
        if (endHour < 12) endHour24 = endHour + 12;
      } else if (timeStr.includes('am') && startHour === 12) {
        startHour24 = 0;
      } else if (timeStr.includes('am') && endHour === 12) {
        endHour24 = 0;
      }

      const startTime = `${String(startHour24).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`;
      const endTime = `${String(endHour24).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;
      
      timeSlots.push({ 
        startTime, 
        endTime, 
        matchIndex: timeMatch.index,
        lineIndex: text.substring(0, timeMatch.index).split('\n').length - 1
      });
    }

    // Find halls mentioned in the timetable with their positions
    const halls = new Map(); // Map to store hall name and line index
    const seenHallNumbers = new Set();
    
    for (const pattern of hallPatterns) {
      let match;
      // Reset regex lastIndex to avoid missing matches
      const regex = new RegExp(pattern.source, 'gi');
      while ((match = regex.exec(text)) !== null) {
        // Extract hall number (the captured group)
        let hallNumber = match[1] || match[0];
        
        // Skip if we've already seen this hall number
        if (seenHallNumbers.has(hallNumber)) {
          continue;
        }
        
        // Always format as KP-{number} since these are KP halls
        const hallName = `KP-${hallNumber}`;
        seenHallNumbers.add(hallNumber);
        
        const lineIndex = text.substring(0, match.index).split('\n').length - 1;
        
        // Only add if not exists or if significantly different position
        if (!halls.has(hallName)) {
          halls.set(hallName, { lineIndex, matchIndex: match.index, hallNumber });
        }
      }
    }
    
    console.log(`Found ${halls.size} unique halls:`, Array.from(halls.keys()));

    // If no halls found, try to extract any 3-4 digit numbers that might be room numbers
    if (halls.size === 0) {
      const numberPattern = /\b(\d{3,4}[a-z]?)\b/g;
      let match;
      const seenNumbers = new Set();
      while ((match = numberPattern.exec(text)) !== null && halls.size < 20) {
        const num = match[1];
        if (!seenNumbers.has(num)) {
          seenNumbers.add(num);
          const lineIndex = text.substring(0, match.index).split('\n').length - 1;
          halls.set(`KP-${num}`, { lineIndex, matchIndex: match.index });
        }
      }
    }

    // If still no halls found, return empty
    if (halls.size === 0) {
      console.log("No halls found in PDF");
      return [];
    }

    // Generate bookings for the date range
    // Generate all dates between startDate and endDate
    const start = new Date(startDate);
    const end = new Date(endDate);
    const allDates = [];
    
    // Generate all dates in the range
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      allDates.push(new Date(d));
    }

    // Map day names to day numbers (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const dayNameToNumber = {
      'sunday': 0,
      'monday': 1,
      'tuesday': 2,
      'wednesday': 3,
      'thursday': 4,
      'friday': 5,
      'saturday': 6
    };

    // Filter dates to only include the days that are in the timetable
    const relevantDates = allDates.filter(date => {
      const dayOfWeek = date.getDay();
      const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayOfWeek];
      return days.includes(dayName);
    });

    console.log(`Generating bookings for ${relevantDates.length} dates (${days.join(', ')}) from ${startDate} to ${endDate}`);

    // For each relevant date, create bookings
    for (const bookingDate of relevantDates) {
      const dateStr = bookingDate.toISOString().split('T')[0];

      // For each hall, try to find nearby time slots (within 5 lines)
      for (const [hallName, hallData] of halls.entries()) {
        if (timeSlots.length > 0) {
          // Match halls with time slots on nearby lines
          for (const slot of timeSlots) {
            const lineDiff = Math.abs(hallData.lineIndex - slot.lineIndex);
            // If hall and time slot are close together (within 10 lines), associate them
            if (lineDiff <= 10) {
              bookings.push({
                hall: hallName,
                date: dateStr,
                startTime: slot.startTime,
                endTime: slot.endTime
              });
            }
          }
        } else {
          // If no time slots found, create default slots (9 AM - 5 PM, hourly)
          for (let hour = 9; hour < 17; hour++) {
            bookings.push({
              hall: hallName,
              date: dateStr,
              startTime: `${String(hour).padStart(2, '0')}:00`,
              endTime: `${String(hour + 1).padStart(2, '0')}:00`
            });
          }
        }
      }
    }

    // If we still have no bookings and have halls, book all halls for all dates at all time slots
    // This is a fallback if the proximity matching didn't work
    if (bookings.length === 0 && halls.size > 0 && timeSlots.length > 0) {
      for (const bookingDate of relevantDates) {
        const dateStr = bookingDate.toISOString().split('T')[0];
        for (const hallName of halls.keys()) {
          for (const slot of timeSlots) {
            bookings.push({
              hall: hallName,
              date: dateStr,
              startTime: slot.startTime,
              endTime: slot.endTime
            });
          }
        }
      }
    }

    return bookings;
  }

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

