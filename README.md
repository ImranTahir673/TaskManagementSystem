# Full-Stack Task Management System with Secure RBAC

A secure, multi-tenant enterprise task management engine designed to streamline workload organization, scheduling, and role-based tracking. Built using a modern decoupled architecture featuring an **ASP.NET Core 8 Web API** backend pipeline and a **React (TypeScript / Vite)** frontend web client.

---

## 🚀 Critical Cloud Port Configuration (Read First!)

> ⚠️ **IMPORTANT DEPLOYMENT GUARDRAIL:** Because this application is hosted inside a cloud container environment (such as GitHub Codespaces), the frontend running in your local browser communicates with the API via an external proxy network.
> 
> For the application to function, **the Backend API Port (5236) MUST be explicitly set to PUBLIC** inside your environment ports configuration dashboard. If it is set to Private, your browser will trigger a network connectivity failure or drop Cross-Origin (CORS) preflight validation checks.

---

## 🛠️ Technology Stack Architecture

* **Backend Engine:** ASP.NET Core 8 Web API
* **Frontend Web App:** React.js (TypeScript, Vite, Tailwind CSS)
* **Data Persistence:** Entity Framework Core (EF Core) mapped over SQLite
* **Structured Logging:** Serilog Pipeline (Daily Rolling Text File System)
* **Automated Verification:** xUnit Testing Framework
* **Code Quality & DevSecOps:** SonarQube / SonarCloud Ready

---

## 🌟 Key Functional Features

### 🔒 1. Authentication & Role-Based Access Control (RBAC)
* **Self-Service Registration:** Live signup portal allowing new users to create accounts safely against the SQL backend engine.
* **JWT Bearer Authentication:** Secure user validation loop that issues cryptographically signed JSON Web Tokens (JWT) on login, maintaining state-free network communication.
* **Axios Security Interceptor:** Automated frontend middleware that intercepts every outgoing network request to inject the `Authorization: Bearer <token>` handshake header.
* **Role Gating Security:** Two explicit security clearance tiers:
  * **Admin Users:** Complete visibility over the entire master database queue. Admins can create tasks, explicitly assign them to *any* registered teammate via dynamic dropdown feeds, choose priorities, and possess exclusive rights to purge tasks via a role-locked Delete command.
  * **Regular Users:** Sandboxed access. Regular teammates can view and manage *only* their own assigned cards. They can create and edit their own tasks, but the dropdown picker is hidden to prevent assigning tasks to other personnel.

### 📋 2. Comprehensive Task Lifecycle (CRUD) & Sorting
* **Creation & Schema Hydration:** Forms handle inputs for Task Title, descriptions, multi-tiered urgency settings, category names, and calendar target dates.
* **Dynamic Inline Editing Canvas:** Users can click an inline **Edit** action button on any task card, instantly transforming static fields into interactive text areas to run live updates without leaving the board layout.
* **Relational Properties Matrix:** Tasks support advanced tracking properties built directly into the SQLite storage engine:
  * **Priority Pills:** Color-coded urgency banners (Red for High, Amber for Medium, Blue for Low).
  * **Categorization:** Scope segregation tags (e.g., `Work`, `Personal`, `General`).
  * **Due Dates:** Formatted calendar inputs (`📅 Due: MM/DD/YYYY`) to maintain strict timeline tracking.

### 📊 3. Executive Metrics Dashboard View
* **Dynamic Counter Matrices:** Instantly displays real-time calculated metrics across three operational verticals: `Total Tasks`, `Completed Tasks`, and `Pending Tasks`.
* **Tenant Isolation Filtering:** Regular users view metric summaries strictly representing their individual workload, while administrators see combined aggregates of all active corporate project tasks.

### 📝 4. Enterprise Quality Assurance & DevSecOps Infrastructure
* **Flight Recording Logger (Serilog):** Centralized log pipeline outputting daily rolling records directly to the `/Logs` directory to track server execution context and trap runtime errors.
* **Automated Security Tests (xUnit):** An independent test suite running isolated code scripts to mathematically prove that model inputs are validated and unauthorized delete attempts securely yield `403 Forbidden` responses.

---

## 📦 Project Directory Blueprint

```text
TaskManagementSystem/
│
├── TaskManagement.Api/              # ASP.NET Core Web API Project
│   ├── Controllers/                 # REST Endpoints (Auth, Tasks, Users)
│   ├── Data/                        # AppDbContext SQLite Entity Maps
│   ├── Models/                      # Core C# Database Entity Objects
│   ├── Logs/                        # Daily Rolling Server Logs Directory
│   └── Program.cs                   # App Bootstrap & Serilog Middleware
│
├── TaskManagement.Client/           # React TypeScript Frontend Client
│   ├── src/
│   │   ├── services/api.ts          # Axios Interceptor & HTTP Core Handshakes
│   │   └── App.tsx                  # Core State Engine, UI Layout & JSX Forms
│   └── package.json                 # Node Ecosystem Dependencies
│
└── TaskManagement.Tests/            # xUnit Automated Testing Suite
    └── TasksControllerTests.cs      # Input Validation & RBAC Security Code Proofs