# DevPulse Users, Projects & Tasks REST API

A production-grade RESTful API built in Node.js, Express, and TypeScript powering developer telemetry, workspace projects, and Jira-style Kanban task management.

---

## 🚀 Quick Start

### 1. Start the API Server
```bash
npm run server
```
Server runs at `http://localhost:5000` with the API root mounted at `/api`.

### 2. Live Interactive Swagger UI
Open your browser to:
```
http://localhost:5000/api/docs
```
Interactive Swagger documentation allows testing all endpoints, query parameters, schemas, and live executions with one click.

### 3. OpenAPI 3.0 Specification
Raw JSON specification is available at:
```
http://localhost:5000/api/openapi.json
```

### 4. Run Automated Test Suite
```bash
npm run test:api
```

---

## ⚙️ Environment Configuration

Configuration is managed via environment variables (or `.env` file):

| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `5000` | Port for the Express REST API server |
| `NODE_ENV` | `development` | Environment mode (`development`, `test`, `production`) |
| `API_PREFIX` | `/api` | Base path prefix for all API endpoints |
| `CORS_ORIGIN` | `*` | Allowed origin for Cross-Origin Resource Sharing |
| `STORAGE_FILE`| `./server/data/db.json` | Path to persistent JSON database file |

---

## 📊 Standard Response Formats

### Success Response (`200 OK`, `201 Created`)
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "user-1",
    "name": "Alex Rivera",
    "handle": "@arivera_dev",
    "email": "alex.rivera@devpulse.io",
    "role": "Staff Frontend Architect",
    "team": "Core Platform & DX",
    "status": "In the Zone"
  },
  "timestamp": "2026-09-04T08:00:00.000Z",
  "path": "/api/users"
}
```

### Paginated List Response (`200 OK`)
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 20,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "timestamp": "2026-09-04T08:00:00.000Z",
  "path": "/api/tasks"
}
```

### Centralized Error Response (`400`, `404`, `409`, `422`, `500`)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "One or more validation constraints failed",
    "details": [
      {
        "field": "email",
        "message": "Valid email address format required (e.g. name@domain.com)",
        "location": "body"
      }
    ]
  },
  "timestamp": "2026-09-04T08:00:00.000Z",
  "path": "/api/users"
}
```

---

## 🛠️ API Endpoints Summary

### 1. Health & Documentation
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status, uptime, and database records count |
| `GET` | `/api/docs` | Interactive Swagger UI API documentation portal |
| `GET` | `/api/openapi.json` | OpenAPI 3.0.3 machine-readable schema |

---

### 2. User Management (`/api/users`)

| Method | Endpoint | Status | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users` | `200` | List users with filtering (`search`, `role`, `team`, `status`), sorting & pagination |
| `GET` | `/api/users/:id` | `200` / `404` | Get detailed user profile by ID |
| `POST` | `/api/users` | `201` / `400` / `409` | Create new user with schema validation |
| `PUT` | `/api/users/:id` | `200` / `400` / `404` | Full user replacement |
| `PATCH`| `/api/users/:id` | `200` / `400` / `404` | Partial user update |
| `DELETE`| `/api/users/:id` | `200` / `404` | Delete user and unassign active tasks |
| `GET` | `/api/users/:id/stats` | `200` / `404` | Get user telemetry metrics and task breakdown |
| `GET` | `/api/users/:id/tasks` | `200` / `404` | Get all tasks assigned to user |

#### Example: Create User
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Devin Thorne",
    "handle": "@dthorne",
    "email": "devin.thorne@devpulse.io",
    "role": "Staff DevOps Architect",
    "team": "Infrastructure & Cloud",
    "status": "In the Zone",
    "skills": ["Terraform", "AWS", "Docker", "Go"],
    "bio": "Specialized in zero-downtime blue-green deployments."
  }'
```

---

### 3. Project Management (`/api/projects`)

| Method | Endpoint | Status | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/projects` | `200` | List projects with filtering (`search`, `status`, `language`, `ownerId`), sorting & pagination |
| `GET` | `/api/projects/:id` | `200` / `404` | Get project with aggregated task stats & team members |
| `POST` | `/api/projects` | `201` / `400` / `409` | Create project (validates key uniqueness and owner existence) |
| `PUT` | `/api/projects/:id` | `200` / `400` / `404` | Full project update |
| `PATCH`| `/api/projects/:id` | `200` / `400` / `404` | Partial project update |
| `DELETE`| `/api/projects/:id` | `200` / `404` | Delete project and cascade delete associated tasks |
| `GET` | `/api/projects/:id/tasks` | `200` / `404` | Get all tasks in project (supports status filter) |
| `GET` | `/api/projects/:id/members` | `200` / `404` | Get list of user objects who are members |

#### Example: Create Project
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "DevPulse Mobile Companion",
    "key": "MOBILE",
    "description": "Cross-platform developer analytics and push notification hub.",
    "ownerId": "user-1",
    "primaryLanguage": "TypeScript",
    "languages": ["TypeScript", "Swift", "Kotlin"],
    "frameworks": ["React Native", "Expo"],
    "memberIds": ["user-1", "user-2", "user-3"]
  }'
```

---

### 4. Task & Status Lifecycle Management (`/api/tasks`)

| Method | Endpoint | Status | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tasks` | `200` | List tasks with filtering (`projectId`, `assigneeId`, `status`, `priority`, `type`, `sprint`, `search`) |
| `GET` | `/api/tasks/:id` | `200` / `404` | Get task by ID or Key (e.g. `PULSE-101`) with populated relations |
| `POST` | `/api/tasks` | `201` / `400` | Create task with auto-generated key prefix and history initialization |
| `PUT` | `/api/tasks/:id` | `200` / `400` / `404` | Full task replacement |
| `PATCH`| `/api/tasks/:id` | `200` / `400` / `404` | Partial task update |
| `PATCH`| `/api/tasks/:id/status` | `200` / `400` / `404` / `422` | **Dedicated Status Transition** (`backlog`, `todo`, `in-progress`, `in-review`, `done`) with lifecycle tracking & completion timestamp |
| `POST` | `/api/tasks/bulk-status` | `200` / `422` | Bulk status update for Kanban columns or sprint batch transitions |
| `DELETE`| `/api/tasks/:id` | `200` / `404` | Delete task |

#### Example: Transition Task Status (Kanban Move)
```bash
curl -X PATCH http://localhost:5000/api/tasks/task-101/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in-progress",
    "changedBy": "user-1",
    "note": "Started working on React 19 optimisations"
  }'
```

#### Example: Move Task to Done (Auto records `completedAt` & updates user points)
```bash
curl -X PATCH http://localhost:5000/api/tasks/task-101/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "done",
    "changedBy": "user-2",
    "note": "PR #150 merged and deployed"
  }'
```

---

## 🚦 HTTP Status Code Reference

| Code | Status | When Returned |
| :--- | :--- | :--- |
| `200` | **OK** | Successful read, update, or general success |
| `201` | **Created** | Successful creation of a User, Project, or Task |
| `204` | **No Content** | Resource deleted |
| `400` | **Bad Request** | Validation failed, missing required fields, or malformed JSON |
| `404` | **Not Found** | Resource with given ID or key not found |
| `409` | **Conflict** | Duplicate email, handle, or project key |
| `422` | **Unprocessable Entity** | Invalid status transition or enum violation |
| `500` | **Internal Server Error** | Unexpected internal server error |
