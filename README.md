#  Lab Internal Marks Management System

A full-stack web application to manage internal lab marks for students, built with a MySQL-based full-stack using Express.js, React.js, and Node.js. This system automates student enrollment, mark entry, and performance report generation, aiming to reduce manual effort and improve transparency.

##  Features

-  **Student Enrollment**: Secure course registration with database-level checks.
-  **Automated Mark Calculation**: Calculates total marks using custom SQL functions for lab and midterm components.
-  **Dynamic Report Generation**: Generates or updates student reports via stored procedures and triggers.
-  **Real-Time Sync via Triggers**: Any update in marks auto-updates reports.
-  **Performance View**: View student scores with percentage breakdowns.
-  **Faculty & Course Management**: Easily add, edit, delete, and reassign faculty or courses.

##  Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Tools**: MySQL Workbench, Postman, VS Code

##  Database Highlights

- **Stored Procedures**: Automate complex logic like report creation.
- **Triggers**: React to changes in lab/midterm tables and sync reports.
- **User-Defined Functions**: Calculate lab and midterm percentages.
- **Views**: Simplify performance queries with joined tables.
- **Cursors**: Batch update reports for all enrolled students.

##  Setup Instructions

1. **Clone this repo**

```
git clone https://github.com/your-username/lab-marks-management.git
cd lab-marks-management
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

* Import the provided `backup.sql` files into your MySQL instance.
* Configure DB credentials in `.env`.

##  Screenshots 

![image](https://github.com/user-attachments/assets/f58654e9-6a6d-4d86-8c3e-ae93a2b06412)

![image](https://github.com/user-attachments/assets/d643ec17-f65c-41d4-ab16-329568026748)

![image](https://github.com/user-attachments/assets/41456f4b-7f2d-4792-9e34-babad880b41e)

![image](https://github.com/user-attachments/assets/f3dd9d86-33c8-4e73-9517-83143581337f)

![image](https://github.com/user-attachments/assets/353f892a-8a2f-4e8a-9fcf-bf4570f8e4b4)

![image](https://github.com/user-attachments/assets/8bf5b0a1-1bd7-4a95-9912-18edf42c0774)


##  Future Enhancements

*  Email/SMS alerts on marks update
*  Analytics dashboard for performance insights

##  Connect

* GitHub: [https://github.com/Renuka-de](https://github.com/Renuka-de)
* LinkedIn: [www.linkedin.com/in/renukadeviac](https://www.linkedin.com/in/renukadeviac/)

