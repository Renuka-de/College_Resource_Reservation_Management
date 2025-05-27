const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // Fetch user details by email
  router.get('/details', async (req, res) => {
    const email = req.query.email;  // Get the user's email from the query

    try {
      const usersCollection = db.collection('users'); 

      const user = await usersCollection.findOne({ email }); // Find user by email

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user);  // Return user details if found
    } catch (err) {
      console.error('Error fetching user details:', err);
      res.status(500).json({ message: 'Error fetching user details', error: err });
    }
  });

  // Update user details
  router.put('/update', async (req, res) => {
    const { email, name, phone, address } = req.body;  // Expect user details from the body

    try {
      const usersCollection = db.collection('users');  // Access the "users" collection

      const updateResult = await usersCollection.updateOne(
        { email },  // Find user by email
        { $set: { name, phone, address } }  // Update the user's details
      );

      if (updateResult.matchedCount === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ message: 'User details updated successfully' });
    } catch (err) {
      console.error('Error updating user details:', err);
      res.status(500).json({ message: 'Error updating user details', error: err });
    }
  });

  return router;
};
