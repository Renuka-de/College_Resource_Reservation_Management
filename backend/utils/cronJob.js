const cron = require('node-cron');
const { sendEmail } = require('./mailer'); 
const { MongoClient } = require('mongodb');
require('dotenv').config();

const dbName = "CRMS"; 
const sendReminderEmails = async () => {
  if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI is not defined. Cannot send reminder emails.");
    return;
  }

  const client = new MongoClient(process.env.MONGO_URI);
  try {
    // Connect to the database
    await client.connect();
    const db = client.db(dbName);
    const reservations = db.collection('reservations');

    // Get the current date and calculate the next day's date
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

   
    const tomorrowDate = tomorrow.toISOString().split('T')[0]; 

    // Find reservations for tomorrow
    const upcomingReservations = await reservations.find({
      date: tomorrowDate,
    }).toArray();

    // Send email reminders to users
    upcomingReservations.forEach(async (reservation) => {
      const { userEmail, resourcename, location, startTime, endTime, purpose } = reservation;

      const subject = "Reminder: Your Reservation Tomorrow";
      const text = `Greetings,

This is a reminder that you have a reservation for "${resourcename}" at location "${location}" tomorrow.

Date: ${tomorrowDate}
Time: ${startTime} to ${endTime}
Purpose: ${purpose}

Looking forward to your visit!

Thank you,
College Resource Reservation Management Team`;

      // Send the email
      await sendEmail(userEmail, subject, text);
    });

    console.log("✅ Sent reservation reminders for tomorrow.");
  } catch (error) {
    console.error("❌ Error sending reminders:", error);
  } finally {
    // Close the connection after use
    await client.close();
  }
};

// Schedule the cron job to run daily at 9:00 AM 
cron.schedule('0 9 * * *', () => {
  console.log('🕰️ Running daily reminder check...');
  sendReminderEmails();
});

module.exports = { sendReminderEmails };