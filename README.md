<div align="center">

# ⚡ DevPulse — Ultimate Developer Productivity & Telemetry Platform

<p align="center">
  <strong>Real-Time Hardware & VCS Telemetry • Interactive Jira-Style Kanban • Full-Stack REST API Backend • Persistent MongoDB Layer</strong>
</p>

[![React](https://img.shields.io/badge/React-19.0.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21.2-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9.1-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongoosejs.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4.1-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6.2.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.0.3-6BA539?style=for-the-badge&logo=openapiinitiative&logoColor=white)](https://devpulse-dashboard-two.vercel.app/api/docs)
[![Tests](https://img.shields.io/badge/Tests-92%20Passed-10B981?style=for-the-badge&logo=jest&logoColor=white)](https://devpulse-dashboard-two.vercel.app/api/health)

---

### 🌐 Live Production & Deployment Links

| Resource | Live Production Link (Vercel) | Local Development Link | Description |
| :--- | :--- | :--- | :--- |
| 🚀 **Web App Dashboard** | [devpulse-dashboard-two.vercel.app](https://devpulse-dashboard-two.vercel.app) | [`http://localhost:3000`](http://localhost:3000) | Live frontend developer dashboard |
| 📚 **Interactive Swagger UI** | [Live Swagger Docs](https://devpulse-dashboard-two.vercel.app/api/docs) | [`http://localhost:5000/api/docs`](http://localhost:5000/api/docs) | Live API sandbox & interactive documentation |
| 📄 **OpenAPI 3.0.3 Spec** | [Live OpenAPI Spec](https://devpulse-dashboard-two.vercel.app/api/openapi.json) | [`http://localhost:5000/api/openapi.json`](http://localhost:5000/api/openapi.json) | OpenAPI 3.0.3 schema specification |
| 💚 **API Health & DB Telemetry** | [Live Health Check](https://devpulse-dashboard-two.vercel.app/api/health) | [`http://localhost:5000/api/health`](http://localhost:5000/api/health) | Live server uptime, DB status & metrics |
| 👥 **Users API Endpoint** | [Live Users API](https://devpulse-dashboard-two.vercel.app/api/users) | [`http://localhost:5000/api/users`](http://localhost:5000/api/users) | REST API user management & stats |
| 📁 **Projects API Endpoint** | [Live Projects API](https://devpulse-dashboard-two.vercel.app/api/projects) | [`http://localhost:5000/api/projects`](http://localhost:5000/api/projects) | REST API workspace projects |
| 📋 **Tasks API Endpoint** | [Live Tasks API](https://devpulse-dashboard-two.vercel.app/api/tasks) | [`http://localhost:5000/api/tasks`](http://localhost:5000/api/tasks) | REST API Kanban tasks & lifecycle |
| 🔍 **Vercel Inspection URL** | [Vercel Deployment Inspector](https://vercel.com/shreya-kar/devpulse-dashboard/5CpFK5H5ssRsJ9m4iU9PYNnxxQGk) | — | Real-time deployment status & edge logs |
| 🐙 **GitHub Repository** | [github.com/SHREYOTHECODINGEXPERTO/DevPulse](https://github.com/SHREYOTHECODINGEXPERTO/DevPulse) | — | Full source code repository |

---

</div>

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Persistent Data Layer & Schemas](#-persistent-data-layer--schemas)
- [Real-Time Telemetry & Hardware Engine](#-real-time-telemetry--hardware-engine)
- [REST API Reference](#-rest-api-reference)
  - [Users API](#1-users-api-apiusers)
  - [Projects API](#2-projects-api-apiprojects)
  - [Tasks & Status Lifecycle API](#3-tasks--status-lifecycle-api-apitasks)
- [Environment Configuration](#-environment-configuration)
- [Vercel Serverless Deployment](#-vercel-serverless-deployment)
- [Getting Started](#-getting-started)
- [Automated Testing](#-automated-testing)
- [Postman Collection](#-postman-collection)
- [License](#-license)

---

## 🌟 Overview

**DevPulse** is a developer productivity platform engineered to give developers real-time observability over their coding rhythm, hardware performance, GitHub activity, and sprint delivery.

It pairs a **high-performance React 19 frontend** with a modular **Node.js/Express TypeScript REST API backend** and a **persistent Mongoose/MongoDB data layer**, providing full CRUD operations, status state-machine transitions, strict database-level validation, telemetry metrics, and interactive OpenAPI documentation.

---

## ✨ Key Features

### 🖥️ 1. Real-Time Hardware & Device Telemetry HUD
- **Physical CPU Cores**: Live reading via `navigator.hardwareConcurrency`.
- **Memory & V8 Heap Allocator**: Tracks `performance.memory` heap usage (`usedHeapMb` vs `totalHeapMb`) + system RAM in GB.
- **Active Network Ping RTT**: Sub-second round-trip latency pings against GitHub edge servers every 8s.
- **Battery Status & Power State**: Real-time battery percentage and charging detection via `navigator.getBattery()`.
- **Active Coding Tracker**: Monitors keystrokes, mouse moves, and window focus to track active coding minutes and idle states.

### 📋 2. Interactive Jira-Style Kanban Task Board
- **Dedicated Status Transitions**: `backlog` ➔ `todo` ➔ `in-progress` ➔ `in-review` ➔ `done` with full history audit trail.
- **Task Metadata**: Story points, estimated vs. actual hours spent, priorities (`Low`, `Medium`, `High`, `Critical`), issue types (`Story`, `Bug`, `Task`, `Epic`, `Refactor`), sprint tags, and linked PRs.
- **Automated Telemetry Sync**: Marking a task as `done` automatically logs completion timestamps and credits developer story points & XP in real-time.

### 📊 3. Annual Velocity & GitHub Contribution Heatmap
- **GitHub REST API Integration**: Fetches real repositories, PRs, issues, and commit histories.
- **Unbroken Coding Streak**: Calculates consecutive daily commit streaks from contribution heatmaps.
- **Developer Velocity Score**: Multi-weighted calculation balancing commit volume, streak consistency, PR turnaround time, and story points.

### 🔌 4. Multi-Cloud & DevOps Integrations Hub
- Seamless integration cards for **GitHub**, **Vercel**, **Render**, **Cloudflare**, **Supabase**, **Netlify**, and **Railway** with live sync latency meters.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                 DevPulse React 19 Client                                │
│                       (Vite Frontend on Port 3000 / Vercel Edge)                        │
└────────────────────────────────────────────┬────────────────────────────────────────────┘
                                             │ REST API / JSON
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           Node.js + Express REST API (Port 5000)                        │
├───────────────────┬───────────────────┬───────────────────┬─────────────────────────────┤
│   Users Service   │  Projects Service │   Tasks Service   │   Docs & OpenAPI Generator  │
├───────────────────┴───────────────────┴───────────────────┴─────────────────────────────┤
│ • Declarative Schema Validation Middleware                                              │
│ • Centralized Error Handler (400, 401, 404, 409, 422, 500)                              │
│ • Secure Database Configuration with URI Secret Masking                                 │
└────────────────────────────────────────────┬────────────────────────────────────────────┘
                                             │ Mongoose ORM / ODM
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                Persistent Database Layer                                │
├────────────────────────────────────────────┬────────────────────────────────────────────┤
│         Primary: MongoDB Database          │    Resilient Fallback: Document Store      │
│  (Atlas / Local MongoDB with Pool Size)    │      (server/data/db.json with Schema)     │
└────────────────────────────────────────────┴────────────────────────────────────────────┘
```

---

## 🗄️ Persistent Data Layer & Schemas

### 1. Database Configuration & Security
- **Dynamic Configuration**: Credentials managed strictly via `.env` (`MONGODB_URI`, `DB_NAME`, `DB_MAX_POOL_SIZE`, `DB_MIN_POOL_SIZE`, `STORAGE_FILE`).
- **Credential Masking**: Connection URIs containing sensitive passwords (`mongodb+srv://user:pass@host...`) are automatically masked in logs and health endpoints (`mongodb+srv://user:****@host...`).
- **Connection Pooling & Health Telemetry**: Live connection state, pool size, and ping latency metrics exposed at `/api/health`.

### 2. Schema Models & Database Validation
- **User Entity (`server/models/user.model.ts`)**:
  - Unique indexes on `email` and `handle`.
  - Regex validation on handle (`/^@?[a-zA-Z0-9_-]+$/`) and email.
  - Status enum enforcement (`'In the Zone'`, `'Reviewing Code'`, `'Pairing'`, `'In Sprint Planning'`, `'AFK'`, `'Vibecoding'`, `'Debugging at 3AM'`).
  - Numerical range validation (`velocityScore` 0–100, `prMergeRate` 0–100, `streakDays` $\ge 0$).
- **Project Entity (`server/models/project.model.ts`)**:
  - Unique index and uppercase regex validation on project `key` (`/^[A-Z0-9]{2,10}$/`).
  - Status enum enforcement (`'Active Sprint'`, `'In Progress'`, `'Completed'`, `'Maintained'`, `'Planning'`).
  - Relational references to `User` for `ownerId` and `memberIds`.
- **Task Entity (`server/models/task.model.ts`)**:
  - Unique index on task `key` (e.g. `PULSE-101`).
  - Enums for `status`, `priority`, and `type`.
  - References to `Project` and `User` (`assigneeId`, `reporterId`).
  - Embedded `StatusHistorySchema` subdocuments recording timestamped status transition logs.

### 3. Relational Integrity & Cascading Deletions
- **Project $\rightarrow$ Task Cascade**: Deleting a project automatically cascade-deletes all associated child tasks.
- **User Cleanup**: Deleting a user unassigns their tasks (`assigneeId = null`) and pulls them from all project `memberIds`.
- **Relational Aggregations**:
  - `GET /api/projects/:id` resolves `owner` and `members` records and aggregates real-time `taskSummary` metrics.
  - `GET /api/tasks/:id` resolves `project`, `assignee`, and `reporter` documents.
  - `GET /api/users/:id/stats` calculates developer metrics, velocity score, and task breakdown.

---

## ⚡ Real-Time Telemetry & Hardware Engine

| Telemetry Metric | Underlying Technology | Live Update Frequency |
| :--- | :--- | :--- |
| **CPU Core Count** | `navigator.hardwareConcurrency` | Instant on mount |
| **JS Heap & RAM** | `performance.memory` & `navigator.deviceMemory` | **Every 1 second** |
| **Network Latency (RTT)** | Active ping via `measureRealGitHubRTT()` | **Every 8 seconds** |
| **Battery Level & Charging** | Web Battery API (`navigator.getBattery()`) | **Real-time events** |
| **Time Spent Coding Today** | Keystroke & Mouse Activity Engine | **Every 1 second** |
| **Weekly Logged Hours** | Incremental session accumulator | **Every 1 second** |
| **GitHub Commit Streak** | Chronological Calendar Analysis Algorithm | Live on sync |
| **PR Merge SLA** | PR resolution cycle time analyzer | Live on sync |

---

## 📡 REST API Reference

Base URL: `http://localhost:5000/api` (or `https://devpulse-dashboard-two.vercel.app/api`)

### 1. Users API (`/api/users`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/users` | List users with search, role, team, status filters, sorting & pagination |
| `GET` | `/api/users/:id` | Get user profile by ID |
| `POST` | `/api/users` | Create user (validates email format, unique handle/email) |
| `PATCH`| `/api/users/:id` | Partial user update |
| `DELETE`| `/api/users/:id` | Delete user and unassign active tasks / remove from project memberships |
| `GET` | `/api/users/:id/stats` | Get user productivity metrics, velocity score, and task summary |
| `GET` | `/api/users/:id/tasks` | Get all tasks assigned to user |

### 2. Projects API (`/api/projects`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/projects` | List projects with search, status, and language filters |
| `GET` | `/api/projects/:id` | Get project with calculated sprint progress %, task breakdown & team members |
| `POST` | `/api/projects` | Create project workspace (enforces unique project key e.g. `PULSE`) |
| `PATCH`| `/api/projects/:id` | Partial project update |
| `DELETE`| `/api/projects/:id` | Delete project and cascade delete all associated child tasks |
| `GET` | `/api/projects/:id/tasks` | Get all tasks belonging to project |
| `GET` | `/api/projects/:id/members` | Get all user members in project |

### 3. Tasks & Status Lifecycle API (`/api/tasks`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/tasks` | Multi-field filtering by `projectId`, `assigneeId`, `status`, `priority`, `type`, `sprint`, `tag`, `search` |
| `GET` | `/api/tasks/:id` | Get task by ID (e.g. `task-101`) or Key (e.g. `PULSE-101`) with relations |
| `POST` | `/api/tasks` | Create task with auto-generated project key prefix and history initialization |
| `PATCH`| `/api/tasks/:id` | Partial task update |
| `PATCH`| `/api/tasks/:id/status` | **Dedicated Status Transition** (`backlog` ➔ `todo` ➔ `in-progress` ➔ `in-review` ➔ `done`) with full audit trail in `statusHistory` |
| `POST` | `/api/tasks/bulk-status` | Bulk update status for Kanban column moves or sprint batch transitions |
| `DELETE`| `/api/tasks/:id` | Delete task |

---

## ⚙️ Environment Configuration

Create a `.env` file in the project root (reference [`.env.example`](.env.example)):

```env
# Server Configuration
PORT=5000
NODE_ENV=development
API_PREFIX=/api
CORS_ORIGIN=http://localhost:3000

# Persistent Database Configuration (MongoDB / Local Persistence)
MONGODB_URI=mongodb://127.0.0.1:27017/devpulse
DB_NAME=devpulse
DB_MAX_POOL_SIZE=10
DB_MIN_POOL_SIZE=2
STORAGE_FILE=./server/data/db.json
```

---

## 🚀 Vercel Serverless Deployment

DevPulse is pre-configured for full-stack deployment on **Vercel**:
- **`vercel.json`**: Rewrites all `/api/(.*)` routes to the serverless entrypoint.
- **`api/index.ts`**: Mounts the Express REST API as a Vercel Serverless Function and initializes database connections.

To deploy to Vercel:
```bash
vercel deploy --prod
```

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/SHREYOTHECODINGEXPERTO/DevPulse.git
cd DevPulse
npm install
```

### 2. Start the Backend API Server
```bash
npm run server
# API will be available at http://localhost:5000
# Swagger UI will open at http://localhost:5000/api/docs
```

### 3. Start the Frontend Dashboard
```bash
npm run dev
# Dashboard will be available at http://localhost:3000
```

---

## 🧪 Automated Testing

DevPulse includes an automated E2E integration test suite covering **92 test assertions across 6 categories**:
1. Health & Database Telemetry Endpoints
2. User Management & Schema Validation
3. Project Management & Relational Modeling
4. Task Lifecycle, Schema Constraints & Relations
5. Cascading Deletions & Relational Cleanup
6. Centralized Error Handling & Status Codes

```bash
# Run API & Database test suite
npm run test:api

# Run TypeScript typecheck
npm run lint

# Build production bundle
npm run build
```

---

## 📮 Postman Collection

A pre-configured Postman v2.1 collection is included in [`docs/postman_collection.json`](docs/postman_collection.json).
1. Open **Postman** (or Insomnia / Bruno).
2. Click **Import** ➔ select `docs/postman_collection.json`.
3. Pre-configured environment variables (`baseUrl`, `sampleUserId`, `sampleProjectId`, `sampleTaskId`) allow immediate testing.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
