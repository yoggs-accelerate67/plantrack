# PlanTrack Enterprise - Complete Documentation & Testing Guide

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Prerequisites & Setup](#prerequisites--setup)
4. [API Documentation (Postman Testing)](#api-documentation-postman-testing)
5. [Frontend Usage Guide](#frontend-usage-guide)
6. [Role-Based Access Control](#role-based-access-control)
7. [End-to-End Testing Scenarios](#end-to-end-testing-scenarios)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 System Overview

**PlanTrack Enterprise** is a high-performance Project Management System built with:
- **Backend**: Spring Boot 3.x, Java 17+, MySQL 8.0
- **Frontend**: Angular 17+ with TailwindCSS
- **Authentication**: JWT (JSON Web Tokens)
- **API Documentation**: Swagger/OpenAPI

### Key Features
- ✅ Hierarchical Project Structure (Plan → Milestone → Initiative)
- ✅ Role-Based Access Control (Admin, Manager, Employee)
- ✅ Real-time Progress Tracking
- ✅ Audit Logging
- ✅ Dashboard Analytics
- ✅ Modern, Professional UI

---

## 🏗 Architecture

### Data Hierarchy
```
Plan (Root)
  └── Milestone (Phase)
      └── Initiative (Task)
```

### User Roles
- **ADMIN (Bob)**: User management, can delete plans
- **MANAGER (Alice)**: Create plans, milestones, initiatives
- **EMPLOYEE (Charlie)**: Read-only, can update assigned initiative status

---

## 🔧 Prerequisites & Setup

### Backend Setup

1. **Install MySQL 8.0**
   ```sql
   CREATE DATABASE plantrack;
   ```

2. **Update Database Credentials** (`backend/src/main/resources/application.properties`)
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/plantrack
   spring.datasource.username=root
   spring.datasource.password=YOUR_PASSWORD
   spring.jpa.hibernate.ddl-auto=update
   ```

3. **Start Backend**
   ```bash
   cd backend
   mvn spring-boot:run
   ```
   - Backend runs on: `http://localhost:8080`
   - Swagger UI: `http://localhost:8080/swagger-ui/index.html`

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start Frontend**
   ```bash
   npm start
   ```
   - Frontend runs on: `http://localhost:4200`

---

## 📡 API Documentation (Postman Testing)

### Base URL
```
http://localhost:8080/api
```

### Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

### 1. User Registration

**Endpoint**: `POST /api/auth/register`

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "Alice Manager",
  "email": "alice@company.com",
  "password": "SecurePass123!",
  "department": "Engineering",
  "role": "MANAGER",
  "status": "ACTIVE"
}
```

**Password Requirements**:
- Minimum 8 characters
- At least 1 digit
- At least 1 lowercase letter
- At least 1 uppercase letter
- At least 1 special character (@#$%^&+=!)

**Response** (201 Created):
```json
{
  "userId": 1,
  "name": "Alice Manager",
  "email": "alice@company.com",
  "department": "Engineering",
  "role": "MANAGER",
  "status": "ACTIVE"
}
```

**Postman Collection**:
```json
{
  "name": "Register User",
  "request": {
    "method": "POST",
    "header": [
      {
        "key": "Content-Type",
        "value": "application/json"
      }
    ],
    "body": {
      "mode": "raw",
      "raw": "{\n  \"name\": \"Alice Manager\",\n  \"email\": \"alice@company.com\",\n  \"password\": \"SecurePass123!\",\n  \"department\": \"Engineering\",\n  \"role\": \"MANAGER\",\n  \"status\": \"ACTIVE\"\n}"
    },
    "url": {
      "raw": "http://localhost:8080/api/auth/register",
      "protocol": "http",
      "host": ["localhost"],
      "port": "8080",
      "path": ["api", "auth", "register"]
    }
  }
}
```

---

### 2. User Login

**Endpoint**: `POST /api/auth/login`

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "alice@company.com",
  "password": "SecurePass123!"
}
```

**Response** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "ROLE_MANAGER"
}
```

**⚠️ Important**: Save the `token` for subsequent requests!

**Postman Collection**:
```json
{
  "name": "Login",
  "request": {
    "method": "POST",
    "header": [
      {
        "key": "Content-Type",
        "value": "application/json"
      }
    ],
    "body": {
      "mode": "raw",
      "raw": "{\n  \"email\": \"alice@company.com\",\n  \"password\": \"SecurePass123!\"\n}"
    },
    "url": {
      "raw": "http://localhost:8080/api/auth/login",
      "protocol": "http",
      "host": ["localhost"],
      "port": "8080",
      "path": ["api", "auth", "login"]
    }
  }
}
```

**Postman Environment Variable Setup**:
1. Create a new environment in Postman
2. Add variable: `token` (value will be set from login response)
3. Use `{{token}}` in Authorization header for protected endpoints

---

### 3. Create Plan (Manager/Admin Only)

**Endpoint**: `POST /api/users/{userId}/plans`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Path Parameters**:
- `userId`: The ID of the user to assign the plan to

**Request Body**:
```json
{
  "title": "Q1 Product Launch",
  "description": "Complete product launch for Q1 2024 including marketing and sales enablement",
  "priority": "HIGH",
  "status": "PLANNED",
  "startDate": "2024-01-01T00:00:00",
  "endDate": "2024-03-31T23:59:59"
}
```

**Valid Values**:
- `priority`: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`
- `status`: `PLANNED`, `IN_PROGRESS`, `COMPLETED`, `ON_HOLD`, `CANCELLED`

**Response** (200 OK):
```json
{
  "planId": 1,
  "title": "Q1 Product Launch",
  "description": "Complete product launch for Q1 2024 including marketing and sales enablement",
  "priority": "HIGH",
  "status": "PLANNED",
  "startDate": "2024-01-01T00:00:00",
  "endDate": "2024-03-31T23:59:59",
  "userId": 1,
  "userName": "Alice Manager"
}
```

**Postman Collection**:
```json
{
  "name": "Create Plan",
  "request": {
    "method": "POST",
    "header": [
      {
        "key": "Content-Type",
        "value": "application/json"
      },
      {
        "key": "Authorization",
        "value": "Bearer {{token}}"
      }
    ],
    "body": {
      "mode": "raw",
      "raw": "{\n  \"title\": \"Q1 Product Launch\",\n  \"description\": \"Complete product launch for Q1 2024\",\n  \"priority\": \"HIGH\",\n  \"status\": \"PLANNED\",\n  \"startDate\": \"2024-01-01T00:00:00\",\n  \"endDate\": \"2024-03-31T23:59:59\"\n}"
    },
    "url": {
      "raw": "http://localhost:8080/api/users/1/plans",
      "protocol": "http",
      "host": ["localhost"],
      "port": "8080",
      "path": ["api", "users", "1", "plans"]
    }
  }
}
```

---

### 4. Get All Plans (with Pagination)

**Endpoint**: `GET /api/plans?page=0&size=10&sort=planId`

**Headers**:
```
Authorization: Bearer {{token}}
```

**Query Parameters**:
- `page`: Page number (default: 0)
- `size`: Page size (default: 10)
- `sort`: Sort field (default: planId)

**Response** (200 OK):
```json
{
  "content": [
    {
      "planId": 1,
      "title": "Q1 Product Launch",
      "description": "Complete product launch for Q1 2024",
      "priority": "HIGH",
      "status": "PLANNED",
      "startDate": "2024-01-01T00:00:00",
      "endDate": "2024-03-31T23:59:59",
      "userId": 1,
      "userName": "Alice Manager"
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "size": 10,
  "number": 0
}
```

---

### 5. Get Plan Details (with Milestones & Initiatives)

**Endpoint**: `GET /api/plans/{planId}`

**Headers**:
```
Authorization: Bearer {{token}}
```

**Response** (200 OK):
```json
{
  "planId": 1,
  "title": "Q1 Product Launch",
  "description": "Complete product launch for Q1 2024",
  "priority": "HIGH",
  "status": "PLANNED",
  "startDate": "2024-01-01T00:00:00",
  "endDate": "2024-03-31T23:59:59",
  "userId": 1,
  "userName": "Alice Manager",
  "milestones": [
    {
      "milestoneId": 1,
      "title": "Development Phase",
      "dueDate": "2024-02-15T00:00:00",
      "completionPercent": 45.0,
      "status": "IN_PROGRESS",
      "initiatives": [
        {
          "initiativeId": 1,
          "title": "Implement Authentication",
          "description": "Build JWT-based authentication system",
          "status": "COMPLETED",
          "milestoneId": 1,
          "milestoneTitle": "Development Phase",
          "assignedUserId": 2,
          "assignedUserName": "Charlie Developer"
        },
        {
          "initiativeId": 2,
          "title": "Design UI Components",
          "description": "Create reusable UI component library",
          "status": "IN_PROGRESS",
          "milestoneId": 1,
          "milestoneTitle": "Development Phase",
          "assignedUserId": 2,
          "assignedUserName": "Charlie Developer"
        }
      ]
    }
  ]
}
```

---

### 6. Create Milestone (Manager/Admin Only)

**Endpoint**: `POST /api/plans/{planId}/milestones`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Request Body**:
```json
{
  "title": "Development Phase",
  "dueDate": "2024-02-15T00:00:00",
  "completionPercent": 0.0,
  "status": "PLANNED"
}
```

**Valid Status Values**: `PLANNED`, `IN_PROGRESS`, `COMPLETED`

**Response** (200 OK):
```json
{
  "milestoneId": 1,
  "title": "Development Phase",
  "dueDate": "2024-02-15T00:00:00",
  "completionPercent": 0.0,
  "status": "PLANNED",
  "planId": 1,
  "planTitle": "Q1 Product Launch"
}
```

---

### 7. Create Initiative (Manager/Admin Only)

**Endpoint**: `POST /api/milestones/{milestoneId}/initiatives?userId={assignedUserId}`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Query Parameters**:
- `userId`: The ID of the user to assign the initiative to

**Request Body**:
```json
{
  "title": "Implement Authentication",
  "description": "Build JWT-based authentication system with role-based access control",
  "status": "PLANNED"
}
```

**Response** (200 OK):
```json
{
  "initiativeId": 1,
  "title": "Implement Authentication",
  "description": "Build JWT-based authentication system with role-based access control",
  "status": "PLANNED",
  "milestoneId": 1,
  "milestoneTitle": "Development Phase",
  "assignedUserId": 2,
  "assignedUserName": "Charlie Developer"
}
```

---

### 8. Update Initiative Status (Employee/Manager/Admin)

**Endpoint**: `PUT /api/initiatives/{initiativeId}`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Request Body**:
```json
{
  "title": "Implement Authentication",
  "description": "Build JWT-based authentication system",
  "status": "COMPLETED"
}
```

**Response** (200 OK):
```json
{
  "initiativeId": 1,
  "title": "Implement Authentication",
  "description": "Build JWT-based authentication system",
  "status": "COMPLETED",
  "milestoneId": 1,
  "milestoneTitle": "Development Phase",
  "assignedUserId": 2,
  "assignedUserName": "Charlie Developer"
}
```

**Note**: When an initiative status changes, the milestone completion percentage is automatically recalculated.

---

### 9. Get Dashboard Statistics

**Endpoint**: `GET /api/dashboard/stats`

**Headers**:
```
Authorization: Bearer {{token}}
```

**Response** (200 OK):
```json
{
  "totalPlans": 5,
  "activeInitiatives": 12,
  "completedMilestones": 8,
  "totalUsers": 10
}
```

---

### 10. Delete Plan (Admin/Manager Only)

**Endpoint**: `DELETE /api/plans/{planId}`

**Headers**:
```
Authorization: Bearer {{token}}
```

**Response** (204 No Content)

---

### 11. Delete Milestone (Manager/Admin Only)

**Endpoint**: `DELETE /api/milestones/{milestoneId}`

**Headers**:
```
Authorization: Bearer {{token}}
```

**Response** (204 No Content)

---

### 12. Delete Initiative (Manager/Admin Only)

**Endpoint**: `DELETE /api/initiatives/{initiativeId}`

**Headers**:
```
Authorization: Bearer {{token}}
```

**Response** (204 No Content)

---

## 🖥 Frontend Usage Guide

### Initial Setup

1. **Start the Application**
   ```bash
   # Terminal 1: Backend
   cd backend
   mvn spring-boot:run

   # Terminal 2: Frontend
   cd frontend
   npm start
   ```

2. **Access the Application**
   - Open browser: `http://localhost:4200`
   - You'll be redirected to the login page

---

### Login Process

1. **Enter Credentials**
   - Email: `alice@company.com` (or your registered email)
   - Password: Your password

2. **After Login**
   - You'll be redirected to the Dashboard
   - Your role determines what you can see and do

---

### Dashboard (Command Center)

**Features**:
- **KPI Cards**: Total Active Plans, Pending Initiatives, Team Velocity, Total Users
- **Plan Grid**: Visual cards showing all plans with progress bars
- **Create Plan Button**: Visible only to Managers (Alice) and Admins

**Actions**:
- Click on any plan card to view details
- Click "Create New Plan" to add a new plan (Manager/Admin only)

---

### Plan Detail View (Waterfall Hierarchy)

**Layout Structure**:
```
Plan Header
  ├── Title, Description, Priority, Status
  ├── Assigned User
  ├── Overall Progress Bar
  └── [Add Milestone Button] (Manager/Admin only)

Milestones (Accordion)
  ├── Milestone 1 [Expand/Collapse]
  │   ├── Title, Status, Due Date
  │   ├── Progress Bar
  │   ├── [Edit] [Delete] Icons (Manager/Admin only)
  │   └── Initiatives List
  │       ├── Initiative 1
  │       │   ├── Title, Description
  │       │   ├── Status Dropdown (Employee can edit)
  │       │   ├── Assigned User
  │       │   └── [Edit] [Delete] Icons (Manager/Admin only)
  │       └── Initiative 2
  └── Milestone 2 [Expand/Collapse]
      └── ...
```

**Interactions**:

1. **Expand/Collapse Milestone**
   - Click on the milestone header or the arrow icon
   - Expanded view shows all initiatives

2. **Add Milestone** (Manager/Admin only)
   - Click "Add Milestone" button at the bottom of Plan Header
   - Fill in the form:
     - Title (required)
     - Due Date (optional)
   - Click "Add Milestone"

3. **Add Initiative** (Manager/Admin only)
   - Expand a milestone
   - Click "Add Initiative" button
   - Fill in the form:
     - Title (required)
     - Description (optional)
     - Assigned User ID (required)
   - Click "Add Initiative"

4. **Update Initiative Status** (Employee/Manager/Admin)
   - For Employees: Only on initiatives assigned to them
   - Click the status dropdown
   - Select new status: `PLANNED`, `IN_PROGRESS`, or `COMPLETED`
   - Status updates automatically

5. **Edit/Delete Actions** (Manager/Admin only)
   - Hover over a milestone or initiative row
   - Edit (pencil) and Delete (trash) icons appear
   - Click to perform the action

---

### Plan Board (Kanban View)

**Features**:
- Columns organized by status: `PLANNED`, `IN_PROGRESS`, `COMPLETED`, `ON_HOLD`, `CANCELLED`
- Each plan card shows:
  - Title
  - Description (truncated)
  - Priority badge
  - Assigned user

**Actions**:
- Click on a plan card to view details
- Hover to see Edit/Delete icons (Manager/Admin only)

---

## 👥 Role-Based Access Control

### Admin (Bob - IT Support)

**Capabilities**:
- ✅ View all plans, milestones, initiatives
- ✅ Delete plans (cleanup)
- ✅ Manage users (User Management tab)
- ❌ Cannot create plans (not visible in UI)

**UI Elements**:
- "User Management" tab in navigation
- Delete buttons on plans
- Read-only view of plans/milestones/initiatives

---

### Manager (Alice - Project Owner)

**Capabilities**:
- ✅ Create plans
- ✅ Create milestones
- ✅ Create initiatives
- ✅ Edit/Delete plans, milestones, initiatives
- ✅ View user list (read-only, to find team members)
- ✅ View all plans and progress

**UI Elements**:
- "Create New Plan" button on Dashboard
- "Add Milestone" button in Plan Detail
- "Add Initiative" button in expanded milestones
- Edit/Delete icons on all items

---

### Employee (Charlie - Developer)

**Capabilities**:
- ✅ View all plans, milestones, initiatives (read-only)
- ✅ Update status of assigned initiatives only
- ❌ Cannot create, edit, or delete anything

**UI Elements**:
- No "Create" or "Add" buttons visible
- No Edit/Delete icons
- Status dropdown only on assigned initiatives

---

## 🧪 End-to-End Testing Scenarios

### Scenario 1: Manager Creates a Complete Project

**Steps**:
1. **Login as Manager**
   - Email: `alice@company.com`
   - Password: `SecurePass123!`

2. **Create Plan**
   - Go to Dashboard
   - Click "Create New Plan"
   - Fill in:
     - Title: "Website Redesign"
     - Description: "Complete redesign of company website"
     - Priority: HIGH
     - Status: PLANNED
   - Click "Create Plan"
   - ✅ Toast: "Plan created successfully!"

3. **View Plan Details**
   - Click on the plan card
   - Verify plan header shows all information

4. **Add Milestone**
   - Click "Add Milestone"
   - Title: "Design Phase"
   - Due Date: Select a future date
   - Click "Add Milestone"
   - ✅ Toast: "Milestone created successfully!"

5. **Expand Milestone**
   - Click on the milestone to expand
   - Verify empty state message appears

6. **Add Initiative**
   - Click "Add Initiative"
   - Title: "Create Wireframes"
   - Description: "Design wireframes for all pages"
   - Assigned User ID: 2 (Charlie)
   - Click "Add Initiative"
   - ✅ Toast: "Initiative created successfully!"
   - ✅ Initiative appears in the list

7. **Verify Progress**
   - Check milestone progress bar (should be 0% initially)
   - Check overall plan progress

---

### Scenario 2: Employee Updates Initiative Status

**Steps**:
1. **Login as Employee**
   - Email: `charlie@company.com`
   - Password: `SecurePass123!`

2. **Navigate to Plan**
   - Go to Plans page
   - Click on a plan with assigned initiatives

3. **Expand Milestone**
   - Click to expand milestone containing assigned initiative

4. **Update Status**
   - Find initiative assigned to Charlie
   - Click status dropdown
   - Change from "PLANNED" to "IN_PROGRESS"
   - ✅ Status updates immediately
   - ✅ Toast: "Initiative status updated!"
   - ✅ Milestone progress bar updates automatically

5. **Verify Read-Only Access**
   - ✅ No "Add Milestone" button visible
   - ✅ No "Add Initiative" button visible
   - ✅ No Edit/Delete icons visible
   - ✅ Can only change status of assigned initiatives

---

### Scenario 3: Admin Manages Users

**Steps**:
1. **Login as Admin**
   - Email: `bob@company.com`
   - Password: `SecurePass123!`

2. **Access User Management**
   - Click "User Management" tab (only visible to Admin)
   - ✅ User list displays

3. **Delete Plan** (Cleanup)
   - Go to Plans page
   - Hover over a plan card
   - Click Delete icon
   - Confirm deletion
   - ✅ Toast: "Plan deleted successfully!"

---

### Scenario 4: API Testing with Postman

**Complete Workflow**:

1. **Register Users**
   ```http
   POST /api/auth/register
   ```
   - Register Alice (MANAGER)
   - Register Charlie (EMPLOYEE)
   - Register Bob (ADMIN)

2. **Login and Get Token**
   ```http
   POST /api/auth/login
   ```
   - Login as Alice
   - Copy the `token` from response
   - Set as environment variable in Postman

3. **Create Plan**
   ```http
   POST /api/users/1/plans
   Authorization: Bearer {{token}}
   ```
   - Use Alice's token
   - Create a new plan
   - Save `planId` from response

4. **Create Milestone**
   ```http
   POST /api/plans/{planId}/milestones
   Authorization: Bearer {{token}}
   ```
   - Use the planId from step 3
   - Create milestone
   - Save `milestoneId` from response

5. **Create Initiative**
   ```http
   POST /api/milestones/{milestoneId}/initiatives?userId=2
   Authorization: Bearer {{token}}
   ```
   - Use milestoneId from step 4
   - Assign to Charlie (userId=2)

6. **Get Plan Details**
   ```http
   GET /api/plans/{planId}
   Authorization: Bearer {{token}}
   ```
   - Verify complete hierarchy is returned
   - Check milestones and initiatives are nested

7. **Update Initiative Status**
   ```http
   PUT /api/initiatives/{initiativeId}
   Authorization: Bearer {{token}}
   ```
   - Login as Charlie
   - Update status to "COMPLETED"
   - Verify milestone progress updates

8. **Get Dashboard Stats**
   ```http
   GET /api/dashboard/stats
   Authorization: Bearer {{token}}
   ```
   - Verify statistics are accurate

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: Database connection error
```
Solution: 
1. Verify MySQL is running
2. Check database credentials in application.properties
3. Ensure database 'plantrack' exists
```

**Problem**: Port 8080 already in use
```
Solution:
1. Change port in application.properties:
   server.port=8081
2. Update frontend API URL accordingly
```

**Problem**: JWT token expired
```
Solution:
1. Re-login to get a new token
2. Check token expiration in JwtUtil configuration
```

---

### Frontend Issues

**Problem**: CORS errors
```
Solution:
1. Verify backend CORS configuration allows localhost:4200
2. Check SecurityConfig has corsConfigurationSource() bean
```

**Problem**: 401 Unauthorized
```
Solution:
1. Check if token is being sent in Authorization header
2. Verify token is valid (not expired)
3. Re-login if necessary
```

**Problem**: Empty dashboard
```
Solution:
1. Create test data via Postman first
2. Verify backend is running and accessible
3. Check browser console for errors
```

---

### Common Errors

**Error**: "User not found"
```
Solution: Register the user first via /api/auth/register
```

**Error**: "Plan not found"
```
Solution: Verify planId exists, check database or create via API
```

**Error**: "Invalid Email or Password"
```
Solution: 
1. Check password meets requirements
2. Verify user exists in database
3. Check password encoding matches
```

---

## 📊 Sample Test Data

### Complete Postman Collection

Import this into Postman for quick testing:

```json
{
  "info": {
    "name": "PlanTrack Enterprise API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:8080/api"
    },
    {
      "key": "token",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "1. Register Alice (Manager)",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"name\": \"Alice Manager\",\n  \"email\": \"alice@company.com\",\n  \"password\": \"SecurePass123!\",\n  \"department\": \"Engineering\",\n  \"role\": \"MANAGER\",\n  \"status\": \"ACTIVE\"\n}"
        },
        "url": "{{baseUrl}}/auth/register"
      }
    },
    {
      "name": "2. Register Charlie (Employee)",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"name\": \"Charlie Developer\",\n  \"email\": \"charlie@company.com\",\n  \"password\": \"SecurePass123!\",\n  \"department\": \"Engineering\",\n  \"role\": \"EMPLOYEE\",\n  \"status\": \"ACTIVE\"\n}"
        },
        "url": "{{baseUrl}}/auth/register"
      }
    },
    {
      "name": "3. Login as Alice",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "if (pm.response.code === 200) {",
              "    var jsonData = pm.response.json();",
              "    pm.environment.set('token', jsonData.token);",
              "}"
            ]
          }
        }
      ],
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"alice@company.com\",\n  \"password\": \"SecurePass123!\"\n}"
        },
        "url": "{{baseUrl}}/auth/login"
      }
    },
    {
      "name": "4. Create Plan",
      "request": {
        "method": "POST",
        "header": [
          {"key": "Content-Type", "value": "application/json"},
          {"key": "Authorization", "value": "Bearer {{token}}"}
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"title\": \"Q1 Product Launch\",\n  \"description\": \"Complete product launch for Q1 2024\",\n  \"priority\": \"HIGH\",\n  \"status\": \"PLANNED\",\n  \"startDate\": \"2024-01-01T00:00:00\",\n  \"endDate\": \"2024-03-31T23:59:59\"\n}"
        },
        "url": "{{baseUrl}}/users/1/plans"
      }
    },
    {
      "name": "5. Get All Plans",
      "request": {
        "method": "GET",
        "header": [{"key": "Authorization", "value": "Bearer {{token}}"}],
        "url": "{{baseUrl}}/plans?page=0&size=10"
      }
    },
    {
      "name": "6. Get Dashboard Stats",
      "request": {
        "method": "GET",
        "header": [{"key": "Authorization", "value": "Bearer {{token}}"}],
        "url": "{{baseUrl}}/dashboard/stats"
      }
    }
  ]
}
```

---

## ✅ Testing Checklist

### Backend API Testing
- [ ] Register user with valid credentials
- [ ] Register user with invalid password (should fail)
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (should fail)
- [ ] Create plan (with token)
- [ ] Create plan without token (should fail with 401)
- [ ] Get all plans with pagination
- [ ] Get plan details (with milestones and initiatives)
- [ ] Create milestone
- [ ] Create initiative
- [ ] Update initiative status
- [ ] Verify milestone progress auto-updates
- [ ] Delete initiative
- [ ] Delete milestone
- [ ] Delete plan
- [ ] Get dashboard statistics

### Frontend Testing
- [ ] Login page loads correctly
- [ ] Login with valid credentials redirects to dashboard
- [ ] Login with invalid credentials shows error
- [ ] Dashboard displays KPI cards
- [ ] Dashboard shows plan grid
- [ ] "Create Plan" button visible to Manager/Admin only
- [ ] Clicking plan card navigates to detail view
- [ ] Plan detail shows header information
- [ ] Milestones accordion expands/collapses
- [ ] "Add Milestone" button works (Manager/Admin)
- [ ] "Add Initiative" button works (Manager/Admin)
- [ ] Status dropdown updates initiative (Employee can edit assigned)
- [ ] Edit/Delete icons appear on hover (Manager/Admin)
- [ ] Toast notifications appear for all actions
- [ ] Loading spinners show during API calls
- [ ] Empty states display correctly
- [ ] Role-based UI elements show/hide correctly

### Role-Based Testing
- [ ] Admin can delete plans
- [ ] Admin sees User Management tab
- [ ] Manager can create plans, milestones, initiatives
- [ ] Manager sees all action buttons
- [ ] Employee sees read-only UI
- [ ] Employee can only update assigned initiative status
- [ ] Employee cannot see create/add buttons

---

## 📝 Notes

- **JWT Tokens**: Tokens are stateless and stored in localStorage on frontend
- **Password Security**: All passwords are hashed using BCrypt
- **Audit Logging**: All create/update/delete operations are logged
- **Progress Calculation**: Milestone progress is automatically calculated from initiative completion
- **CORS**: Configured to allow `http://localhost:4200` only

---

## 🔗 Quick Links

- **Swagger UI**: http://localhost:8080/swagger-ui/index.html
- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:8080/api

---

**Happy Testing! 🚀**

For issues or questions, check the Troubleshooting section or review the Swagger documentation.

