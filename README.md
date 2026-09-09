# Placement Management System

This is a web-based Placement Management System developed using Node.js, Express.js, MongoDB Atlas, EJS, and CSS.

The main purpose of this project is to simplify the placement process for both students and the Training & Placement Officer (TPO). Students can maintain their profiles, upload resumes, view eligible drives, and apply for companies, while the admin can manage students, placement drives, and applications from a separate dashboard.

## Features

### Student Module

- Student Registration
- Student Login
- Maintain Profile
- Upload Resume
- View Eligible Drives
- Apply for Drives
- View Applied Drives
- Track Application Status

### Admin Module

- Admin Login
- Manage Students
- Create Placement Drives
- Edit Drives
- Delete Drives
- View Applicants
- Manage Applications
- Track Placement Activities

## Technologies Used

### Frontend
- HTML
- CSS
- EJS

### Backend
- Node.js
- Express.js

### Database
- MongoDB Atlas
- Mongoose

### Other Packages
- Express Session
- Bcrypt
- Multer

## Project Structure

```bash
Placement-Management-System
│
├── config
├── middlewares
├── models
├── routes
├── public
├── views
├── uploads
├── app.js
├── package.json
└── README.md
```

## Database Collections

The project uses the following collections:

- Students
- Admins
- Drives
- Applications

## How to Run the Project

### Clone the Repository

```bash
git clone https://github.com/yourusername/Placement-Management-System.git
```

### Install Dependencies

```bash
npm install
```

### Create .env File

```env
MONGO_URL=your_mongodb_connection_string
SESSION_SECRET=your_secret_key
```

### Start the Application

```bash
nodemon app.js
```

or

```bash
node app.js
```

The application will run on:

```text
http://localhost:8080
```

## Future Improvements

Some features that can be added in the future:

- Email notifications
- Resume analysis
- Company portal
- Placement analytics dashboard
- Interview scheduling
- Export reports

## Learning Outcomes

Through this project, I gained practical experience in:

- Building a full-stack web application
- Working with MongoDB Atlas
- User authentication and session management
- File uploads using Multer
- Database design using Mongoose
- Creating role-based access for students and admins

## Author

Kolipakula Lokesh

B.Tech CSE, VIT-AP University

## Note

This project was developed as a learning project to understand how placement management systems work and to improve my full-stack web development skills.
