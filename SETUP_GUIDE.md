## 🌐 Live Production Demo (Quick Access)

Skip the local installation and test the live full-stack system directly in your browser:

* **Live Application URL:** https://taskmanagement-client.onrender.com
* **API Documentation Endpoint:** https://taskmanagement-server-mrrs.onrender.com/api/auth/me

> ⚠️ **Important Evaluation Note (Render Free Tier "Cold Start"):** > This project is hosted on Render's free hosting tier. If the application has been inactive, the backend server may take **50–60 seconds to spin up and wake up from sleep** on your very first interaction (such as clicking 'Sign In'). Please allow up to one minute for the initial server response. Subsequent actions will be near-instantaneous.


```markdown
# 🚀 Local Deployment & Setup Guide

This document provides step-by-step instructions for setting up, configuring, and running the Task Management System locally on a development machine for evaluation.

---

## 🛠️ System Prerequisites & Required Tools

Before running the application, ensure the following environments are installed on your host system:

1. **.NET 8.0 SDK** (Required to compile, seed, and run the C# Web API Core backend)
2. **Node.js (v18.x or v20.x LTS)** (Required to restore dependencies and execute the React Vite frontend)
3. **Git** (To clone and pull repository branches)
4. *(Optional)* **SQLite Browser** or **VS Code SQLite Viewer Extension** (If you wish to inspect the localized database rows manually)

---

## 💾 Database Architecture: SQLite vs. Traditional SQL

To maximize portability and eliminate the need for setting up external database servers (like MS SQL Server or PostgreSQL) locally, this application utilizes **SQLite** for development and evaluation.

* **Zero-Configuration Setup:** SQLite operates as a single serverless file database (`taskmanagement.db`) created directly inside your project folder structure.
* **Auto-Migrations & Seeding:** You do not need to run manual SQL setup scripts. The application infrastructure automatically initializes the file schema and injects test records upon its first execution.

> 🔄 **Production Extensibility Note:** The backend is built using Entity Framework Core. Migrating this application to an enterprise SQL Server or PostgreSQL instance requires changing only the database provider string in `Program.cs` (`.UseSqlite` to `.UseSqlServer`) and updating the connection string tokens in `appsettings.json`.

---

## 🏃‍♂️ Step-by-Step Local Setup Instructions

Follow these execution blocks sequentially in separate terminal environments.

### 1. Backend Service Initialization (Web API)
Open a terminal panel and navigate to the backend API directory:

```bash
# Move into the API root folder
cd TaskManagement.Api

# Restore corporate NuGet packages and dependencies
dotnet restore

# Build the project and spin up the hosting runtime environment
dotnet run

```

* **Expected Output:** The terminal will display compiling confirmations and confirm the app is listening live, typically at: `http://localhost:5195`
* **Automated Logic Triggered:** Entity Framework Core will scan the directory for `taskmanagement.db`. If it does not exist, it will instantly generate a clean local database file, apply all migration history schemas, and execute the startup data seeder.

---

### 2. Frontend Service Initialization (React Client)

Open a separate terminal window and navigate to the user interface package:

```bash
# Move into the React client folder
cd TaskManagement.Client

# Install the necessary NPM dependency tree nodes safely
npm install

# Start the Vite development engine locally
npm run dev

```

* **Expected Output:** The compiler will create a localized sandbox environment and serve the user interface at: `http://localhost:5173`
* Open `http://localhost:5173` in your browser to interact with the full-stack system application network.

---

## 🔑 Ready-to-Use Evaluation Credentials

The application initializes with two default testing profiles pre-loaded into the database. There is no requirement to manually sign up accounts to evaluate the distinct Role-Based Access Control (RBAC) features.

### 👑 Profile 1: Master System Administrator

Use this profile to test global analytics dashboard counters, target assignment flows, and exclusive record deletion capabilities.

* **Sign-In Username:** `admin`
* **Sign-In Password:** `AdminPassword123!`

### 🧑‍💻 Profile 2: Regular Workspace Member

Use this profile to verify data isolation boundaries. Regular accounts are restricted from global administrative matrices and can only view or update progress conditions on tasks explicitly delegated to them.

* **Sign-In Username:** `imran`
* **Sign-In Password:** `UserPassword123!`

### 🔒 On-The-Fly Admin Creation Code

If you choose to use the **Sign-Up** screen to create a completely new system administrator profile during runtime, you must provide the following optional validation phrase into the security registration field:

* **Admin Registration Key:** `NUML_ADMIN_2026_SECRET`

---

## 🔍 Troubleshooting & Verification Checklist

If the frontend interface appears to be disconnected from your local backend server, verify the alignment configurations inside the codebase:

1. **Local Cross-Origin (CORS) Access:** Ensure that the backend `Program.cs` file allows CORS policies matching the Vite server link (`http://localhost:5173`).
2. **Axios Environment Target:** Verify that your React application service routing layer points to your local machine hosting environment endpoint rather than the live cloud environment URL during testing evaluations:
```typescript
// Locate inside TaskManagement.Client/src/services/api.ts
const API = axios.create({
  baseURL: 'http://localhost:5195/api'
});

```


3. **Database Reset Option:** If at any point you want to completely erase your data history and reset the system back to its original factory configuration, simply delete the local `taskmanagement.db` file from your directory tree and execute `dotnet run` again to generate a clean slate.
