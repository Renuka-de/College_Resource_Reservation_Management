# College Resource Reservation & Management System

A full-stack web application to manage the reservation of shared resources in academic institutions, built using the MERN stack. This system ensures fair usage, prevents scheduling conflicts, and supports role-based access for secure and efficient resource handling. It is scalable for future enhancements like mobile apps and AI-based suggestions.

## Features

- **User Authentication**  
  Role-based login system for Students, Faculty, and Admins using secure authentication practices.

- **Role-Based Access Control**  
  Admins can add/update/delete resources, while users can only book or cancel based on their permissions.

- **Resource Management**  
  Admins can manage resource details (grouped by location) via a user-friendly interface.

- **Location-Based Filtering**  
  Users select a location post-login to view and reserve resources available at that location.

- **Reservation System**  
  Users can reserve a resource by selecting date, start time, and end time. The system checks for time-slot conflicts to avoid double booking.

- **Reservation Cancellation**  
  Users can cancel reservations securely using a unique reservation ID. Identity verification prevents unauthorized cancellations.

- **My Reservations**  
  Users can view all of their current, upcoming, and past bookings with full details like resource name, date, time, and purpose. Easy option to cancel upcoming reservations.

- **Email Notifications**  
  Sends reminder emails at 9:00 AM on the day before each booking. Also sends confirmation emails upon booking or unbooking.

## Tech Stack

- **Frontend**: React.js (in progress)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Tools**: Postman / Thunder Client, VS Code, Git

## Module Overview

### 1. User Authentication Module
- Handles user registration and login.
- Roles: User, Admin.
- Access is restricted based on role.

### 2. Resource Management Module
- Admins can add, update, or delete resources.
- Resources are tagged by location (e.g., KP, CSE Dept).
- Stored securely in MongoDB.

### 3. Location-Based Resource Listing
- Users choose a location to view resources.
- Simplifies browsing and improves UX.

### 4. Reservation System Module
- Users book a resource by specifying date and time.
- Prevents double booking via time-slot checks.
- Reservation stored with a unique ID.

### 5. Reservation Cancellation Module
- Users cancel reservations using the reservation ID.
- Verifies user identity to protect against unauthorized cancellations.

### 6. My Reservations Module
- Displays user-specific reservations.
- Shows resource name, date, time, and purpose.
- Allows easy cancellation of upcoming bookings.

### 7. Email Notification Module
- Automatically sends reminder emails at 9:00 AM the day before each reservation.
- Sends confirmation emails for every booking or cancellation.

## Setup Instructions

1. **Clone the repository**
```
git clone https://github.com/Renuka-de/College_Resource_Reservation_Management.git
cd College_Resource_Reservation_Management
```

2. **Backend Setup**

```
cd backend
npm install
npm start
```

3. **Frontend Setup**

```
cd frontend
npm install
npm start
```

4. **Database Setup**

* Make sure MongoDB is running.
* Configure the MongoDB URI and email credentials in `.env`.

## Screenshots

> *Add screenshots of login, dashboard, booking, and email examples here once UI is ready.*

## Future Enhancements
### Mobile App Version
- Develop a mobile-friendly interface for booking and managing resources.

### Admin Reservation Priority Control
- Empower Admins with advanced booking controls:

- Override existing bookings for high-priority events.

- Block resources for specific time periods (e.g., maintenance, official meetings).

- Set booking quotas per user group (e.g., max 2 bookings/week for students).

- Reserve exclusive “Admin-only” time slots that restrict regular user access.

## Connect

* GitHub: [https://github.com/Renuka-de](https://github.com/Renuka-de)
* LinkedIn: [www.linkedin.com/in/renukadeviac](https://www.linkedin.com/in/renukadeviac/)



