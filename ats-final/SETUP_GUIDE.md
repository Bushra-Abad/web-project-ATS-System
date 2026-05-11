# 🚀 TechHire ATS — Setup Guide

## Prerequisites
- Node.js (v16 or higher): https://nodejs.org
- MongoDB running locally OR use Atlas URI (already configured in .env)

---

## Step 1: Start Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs at: **http://localhost:5000**

You should see:
```
✅ Email configuration detected - notifications enabled
MongoDB Connected: cluster0.fshefsn.mongodb.net
Server running on port 5000
```

---

## Step 2: Start Frontend (New Terminal)

```bash
cd frontend
npm install
npm start
```

Frontend runs at: **http://localhost:3000**

---

## Step 3: Seed Database (First Time Only)

```bash
cd backend
node seed.js
```

This creates branches: Islamabad, Lahore, Karachi, Remote

---

## Step 4: Create Accounts

1. Open http://localhost:3000/register
2. Create an **Admin** account first
3. Login → Go to HR Dashboard
4. Create branches if not seeded
5. Create some job listings
6. Register a **Candidate** account → Apply for jobs!

---

## User Roles

| Role | Access |
|------|--------|
| **candidate** | Browse jobs, apply, track status, view interviews |
| **hr** | Manage jobs, view applicants, schedule interviews, send emails |
| **admin** | All HR permissions + branch management |

---

## Email Features (Already Configured ✅)

Your Gmail credentials are set in backend/.env:
- `EMAIL_USER=f223863@cfd.nu.edu.pk`
- `EMAIL_PASS=bmdzvtbicsomkuve`

Emails are sent automatically when:
- Candidate is **Shortlisted** → Congratulations email
- Candidate is **Rejected** → Polite rejection email
- **Interview is Scheduled** → Interview invitation email with date/time/link

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, React Router v7, Axios |
| Backend | Node.js, Express 5, Socket.io |
| Database | MongoDB Atlas |
| Auth | JWT + bcryptjs |
| Files | Cloudinary |
| Email | Nodemailer + Gmail SMTP |

---

## Troubleshooting

**CORS error?** → Make sure backend is running on port 5000

**Email not sending?** → Check backend terminal for error messages

**Cloudinary upload fails?** → Verify Cloudinary credentials in backend/.env

**"Cannot find module react-pdf"?** → Run `npm install` again in frontend folder
