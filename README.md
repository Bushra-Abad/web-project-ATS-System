# TechHire ATS - Advanced Applicant Tracking System

TechHire is a robust, full-stack Applicant Tracking System designed to streamline the recruitment process for both candidates and HR professionals. It features a modern UI, real-time analytics, and secure document handling.

## 🚀 Key Features

### 1. Public Career Portal
*   **Job Discovery:** Browse all active job openings with advanced filtering by Branch and Department.
*   **Job Details:** View comprehensive job descriptions, requirements, and available seats.
*   **Online Application:** Seamless one-click application process for interested candidates.

### 2. Candidate Portal
*   **Profile Management:** Edit personal details and maintain a professional profile.
*   **Document Upload:** Securely upload Resumes and Cover Letters directly to Cloudinary (Supports `.doc` and `.docx` formats).
*   **Application Tracking:** Real-time status updates (Submitted, Under Review, Shortlisted, Interview Scheduled, Selected, Rejected).
*   **Interview Dashboard:** Dedicated view for scheduled interview details, meeting links, and HR messages.

### 3. HR / Admin Portal
*   **Advanced Analytics:** Live data visualization using `recharts` showing application trends, status breakdowns, and key recruitment KPIs.
*   **Job Management:** Full CRUD operations for job postings, including seat allocation and branch assignment.
*   **Applicant Management:** Comprehensive review system with direct Cloudinary download links for candidate documents.
*   **Interview Management:** Digital scheduling system with automated email invitations via SMTP.
*   **Branch Management:** specialized admin controls for managing company locations (Islamabad, Lahore, Karachi, Remote).
*   **Dark Mode:** A persistent, sleek dark theme for the HR interface to improve usability during long hiring sessions.

## 🛠️ Tech Stack

*   **Frontend:** React.js, React Router, Axios, Recharts, Socket.io-client.
*   **Backend:** Node.js, Express.js.
*   **Database:** MongoDB Atlas.
*   **Real-time:** Socket.io (Server & Client).
*   **File Storage:** Cloudinary (Production-grade raw file handling).
*   **Email:** Nodemailer with Gmail SMTP.
*   **Authentication:** JWT (JSON Web Tokens) with Role-Based Access Control (RBAC).

## ⚙️ Setup & Installation

### Prerequisites
*   Node.js installed
*   MongoDB Atlas Account
*   Cloudinary Account
*   Gmail App Password (for email notifications)

### 1. Clone the Repository
```bash
git clone https://github.com/Bushra-Abad/web-project-ATS-System.git
cd web-project-ATS-System/ats-final
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
ADMIN_REGISTRATION_CODE=ATS@Admin2026
```
Start the backend: `npm run dev`

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm start
```

## 🔐 Security Note
Admin registration is protected by a secret `ADMIN_REGISTRATION_CODE`. This code must be entered during the sign-up process to gain HR/Admin privileges, ensuring only authorized personnel can access the recruitment dashboard.

## 📄 License
This project was developed as a BSCS Semester Project for Web Development.