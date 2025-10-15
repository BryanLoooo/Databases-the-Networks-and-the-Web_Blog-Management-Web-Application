# 📰 Blog Management Web Application

A dynamic, full-stack web application built with **Node.js**, **Express**, and **SQLite3** that enables users to create, manage, and read blog posts.  
The system supports **author** and **reader** roles with authentication, comment functionality, and a structured 3-tier architecture.

---

## 🧩 Overview

This project demonstrates a **3-layer architecture** (Presentation, Application, and Data tiers) to deliver a scalable and secure blogging platform.  
It supports:
- **Authors**: Create, edit, and publish articles or save drafts.
- **Readers**: Browse published posts and leave comments.

---

## 🧠 Key Features

| Category | Description |
|-----------|-------------|
| **Author Role** | Create, save as draft, edit, publish, and delete blog articles. |
| **Reader Role** | View published posts and submit comments. |
| **User Authentication** | Implemented using `express-session` middleware for login verification. |
| **Database Design** | SQLite3 used for lightweight and efficient data storage. |
| **Role-Based Access** | Restricted access for authors and readers to ensure data integrity. |
| **Dynamic Routing** | Express routes render pages based on user actions. |

---

## 🧱 Architecture

### 🧩 3-Layer Application Model

1. **Presentation Tier**
   - Built with **HTML**, **CSS**, and **JavaScript**.  
   - Provides responsive pages for authors and readers.  
   - Files include `main.css` and EJS templates (e.g., `main-homepage.ejs`).

2. **Application Tier**
   - Handles business logic with Express routing (`users.js`, `index.js`).  
   - Manages data validation, CRUD operations, and session verification.  

3. **Data Tier**
   - Uses **SQLite3** for storing users, articles, comments, and settings.  
   - Handles queries for retrieving draft and published articles.

---

## 🗃️ Database Schema

**Tables:**
- `Authors`: Stores author credentials and settings link.  
- `Readers`: Stores reader data for commenting.  
- `Articles`: Linked to authors, supports draft and published states.  
- `Comments`: Linked to articles and readers.  
- `Settings`: One-to-one with each author for personalized configurations.

**Relationships:**
- One Author → Many Articles  
- One Article → Many Comments  
- One Author → One Settings Record  

---

## 🔐 User Authentication Extension

Implemented **`express-session`** middleware for:
- Secure user login verification.  
- Session persistence to protect restricted pages.  
- Redirects on failed authentication attempts.

Example flow:
1. Author submits login form (`POST` request).  
2. Middleware checks user credentials.  
3. Verified users gain access; invalid logins are redirected.

---

## ⚙️ Tech Stack

| Layer | Technology |
|--------|-------------|
| **Frontend** | HTML, CSS, JavaScript (EJS templates) |
| **Backend** | Node.js with Express.js |
| **Database** | SQLite3 |
| **Authentication** | Express-session |
| **Hosting** | Localhost / Cloud-ready deployment |

---

## 🧩 How to Run the Project

### 1️⃣ Install Dependencies
```bash
npm install

# Run the Application
node index.js

# Access via browser
http://localhost:3000/
