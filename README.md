## 🌐 Live Production Demo (Quick Access)

Skip the local installation and test the live full-stack system directly in your browser:

* **Live Application URL:** https://taskmanagement-client.onrender.com
* **API Documentation Endpoint:** https://taskmanagement-server-mrrs.onrender.com/api/auth/me

> ⚠️ **Important Evaluation Note (Render Free Tier "Cold Start"):** > This project is hosted on Render's free hosting tier. If the application has been inactive, the backend server may take **50–60 seconds to spin up and wake up from sleep** on your very first interaction (such as clicking 'Sign In'). Please allow up to one minute for the initial server response. Subsequent actions will be near-instantaneous.

# OR if you configure all this youself  go to the SETUP_GUIDE.md  file for complete guide

# Task Management System (.NET Full-Stack Enterprise Application)

A robust, multi-role Task Management System engineered during the 10Pearls .NET Fullstack Internship track. The application features a decoupled **ASP.NET Core Web API** backend and a responsive **React TypeScript** client frontend.

## 🚀 Cloud Deployment Status
* **Frontend Client (Static Site):** Deployed on Render
* **Backend API (Docker Container):** Deployed on Render
* **Database Layer:** SQLite (Designed with automated execution initialization data lifecycle)

---

## 🛡️ Enterprise Security & Role-Based Access Control (RBAC)

The system utilizes custom JWT (JSON Web Token) authentication architecture to separate user privileges dynamically across a single, secure login entry point:

1. **Regular Users:** * Isolated data access: Can view and manage metrics solely for tasks assigned directly to their workspace profile.
   * Self-assignment tracking with strict delegation restrictions.
2. **Administrators (Executive Controls):**
   * Global project health visibility tracking system counters across all database metrics.
   * Master Task Grid showing all records across team boundaries.
   * Dynamic assignment dropdown loading a live directory of registered team entities.
   * Exclusive record deletion authorization checks validated via JWT backend security token claims.

---

## 🔑 Evaluator & Tester Onboarding Credentials

To verify the distinct workflows without manually seeding an external database engine, the application runs an automated data seeder block at startup. You can log into the environment immediately using either profile:

### 👑 System Administrator Profile
* **Sign-In Page Username:** `admin`
* **Sign-In Page Password:** `AdminPassword123!`

### 🧑‍💻 Regular Team Member Profile
* **Sign-In Page Username:** `imran`
* **Sign-In Page Password:** `UserPassword123!`

### 🔒 On-the-Fly Admin Registration Route
If you wish to create a brand-new administrator account from scratch on the **Sign-Up** screen, use the secure validation key:
* **Admin Registration Key (Optional UI Field):** `NUML_ADMIN_2026_SECRET`

---

## 🦊 Code Quality & Compliance Metrics
This repository is configured with static code analysis scanning pipelines. 

* **SonarQube Quality Gate Status:** `PASSED`
* **Maintainability Grade:** `A`
* **Code Duplication Density:** `< 2.0%`
* **Defensive Design:** Startup initialization is fully wrapped in safe try-catch logging patterns utilizing enterprise structured log monitoring.

---

## 🛠️ Technology Stack Breakdown
* **Backend:** .NET 8.0 ASP.NET Core, Entity Framework Core, Serilog Logging Framework
* **Frontend:** React 18, TypeScript, Tailwind CSS, Axios, Context State Management
* **DevOps/Hosting:** Multi-stage Dockerfile Builds, Render PaaS, GitHub Actions CI Pipeline