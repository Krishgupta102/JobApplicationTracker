# 🚀 Job Application Tracker (AI-Powered)

A full-stack Job Application Tracker built using Next.js, PostgreSQL, and Prisma.  
This application helps users manage their job applications, track interview progress, and optimize resumes using AI.

---

## 🧠 Overview

This project is a production-ready full-stack web application that allows users to:

- Track job applications
- Monitor application status lifecycle
- View analytics dashboard
- Receive AI-powered resume improvement suggestions
- Store analysis history
- Securely manage personal data

---

## ✨ Features

### 🔐 Authentication
- Secure user signup & login
- Protected routes using NextAuth
- Session-based authentication

### 📋 Application Management
- Add new job applications
- Edit application details
- Delete applications
- Filter by status
- Search by company name

### 📊 Dashboard Analytics
- Total applications count
- Interviews count
- Offers count
- Rejections count
- Status distribution overview

### 🤖 AI Resume Optimizer
- Paste job description
- Paste resume content
- Get:
  - Match score (0–100)
  - Missing skills analysis
  - Keyword optimization suggestions
  - Improved bullet point suggestions
- Store resume analysis history
- Linked to specific job application

### 🗄 Database Design
- Relational schema
- One user → Many applications
- One application → Many resume analyses
- Secure ownership validation

---

## 🏗 Tech Stack

### Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS

### Backend
- Next.js API Routes
- Prisma ORM

### Database
- PostgreSQL

### Authentication
- NextAuth

### AI Integration
- OpenAI API (for resume analysis)

---

## 📂 Database Schema (Simplified)

### User
- id
- email
- password
- createdAt

### Application
- id
- companyName
- role
- status (Applied, Interview, Rejected, Offer)
- interviewDate
- notes
- createdAt
- userId (FK)

### ResumeAnalysis
- id
- jobDescription
- resumeContent
- aiResponse (JSON)
- score
- createdAt
- applicationId (FK)

---

## 🔒 Security

- Route protection using authentication middleware
- User-specific data filtering
- Foreign key validation
- Secure password handling
- API access control

---

## 🚀 Getting Started (Local Setup)

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/job-application-tracker.git
cd job-application-tracker