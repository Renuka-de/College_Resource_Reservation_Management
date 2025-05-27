// controllers/notificationController.js
const { ObjectId } = require('mongodb');
const { sendEmail } = require('../utils/mailer');

async function createNotification(db, userId, message, type, relatedBookingId = null) {
  const notifications = db.collection('notifications');
  const users = db.collection('users'); 

  
  await notifications.insertOne({
    userId: new ObjectId(userId),
    message,
    type,
    isRead: false,
    createdAt: new Date(),
    relatedBookingId: relatedBookingId,
  });

  // Fetch the user's email
  const user = await users.findOne({ _id: new ObjectId(userId) });
  if (!user || !user.email) {
    console.log('⚠️ No email found for user.');
    return;
  }

  // Send email
  await sendEmail(user.email, `Notification: ${type}`, message);
}

module.exports = { createNotification };
