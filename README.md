# College Resource Reservation & Management System

A full-stack web application to manage the reservation of shared resources in academic institutions, built using the MERN stack. This system ensures fair usage, prevents scheduling conflicts, and supports role-based access for secure and efficient resource handling. It is scalable for future enhancements like mobile apps and AI-based suggestions.

## Team Members

- **Renuka Devi A C**
- **Shiyamala Devi**
- **Sindhulakshmi E**
- **Kirupa V**

## Features

- **User Authentication**  
  Role-based login system for Students, Faculty, and Admins using secure authentication practices with **JWT tokens, bcrypt password hashing, and route protection**.

- **Role-Based Access Control**  
  Admins can add/delete resources, while users can only book or cancel based on their permissions.

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
  
- **Security Features**  
  Implements **rate limiting**, **token expiration**, **security headers**, **CORS restrictions**, **role-based protected routes**, and **input sanitization**.


## Tech Stack

- **Frontend**: React.js 
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Tools**: Postman, VS Code, Git

## Module Overview

### 1. User Authentication Module
- Handles user registration and login.
- Roles: User, Admin.
- JWT-based stateless authentication with secure password storage.
- Access is restricted based on role.

### 2. Resource Management Module
- Admins can add or delete resources.
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

### Login and Register Page
  
![image](https://github.com/user-attachments/assets/0f7476fc-e7e1-4e57-aedc-6cfcbc362848)

![image](https://github.com/user-attachments/assets/d2b42042-4d0c-4e81-8aed-48474f20b33e)

### Admin Page

![image](https://github.com/user-attachments/assets/1bf9d3dd-9fa8-4dd3-9aa1-b590c614ea75)

![image](https://github.com/user-attachments/assets/c6ec3c0b-fc1f-4d17-bbb2-a33660d19d40)


### User Page

![Screenshot 2025-05-27 153415](https://github.com/user-attachments/assets/09d81999-b426-4e35-ad37-bb526afaf4be)

![image](https://github.com/user-attachments/assets/4e10b208-045c-436d-9940-ac8bd7b309c3)

![Screenshot 2025-05-27 153656](https://github.com/user-attachments/assets/366f8aaf-1593-47af-86f7-b84d57751ea4)

![Screenshot 2025-05-27 153737](https://github.com/user-attachments/assets/bada3828-bf23-471b-b783-2dbfbee4ffbc)

![Screenshot 2025-05-27 153839](https://github.com/user-attachments/assets/70114b8a-412b-4249-9361-8356757628bc)

## Future Enhancements
### Mobile App Version
- Develop a mobile-friendly interface for booking and managing resources.

### Admin Reservation Priority Control
Empower Admins with advanced booking controls:

- Override existing bookings for high-priority events.

- Block resources for specific time periods (e.g., maintenance, official meetings).

- Set booking quotas per user group (e.g., max 2 bookings/week for students).

- Reserve exclusive “Admin-only” time slots that restrict regular user access.

### Change Password Option
- Allow users to securely update their password from their dashboard.

- Include validation, old password confirmation, and feedback messages.

- Ensure re-authentication or logout after password change for security.

## Connect

* GitHub: [https://github.com/Renuka-de](https://github.com/Renuka-de)
* LinkedIn: [www.linkedin.com/in/renukadeviac](https://www.linkedin.com/in/renukadeviac/)



