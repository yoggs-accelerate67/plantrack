
# PlanTrack API — Complete API Contract

> **Base URL:** `http://localhost:8765` (Main Service via API Gateway)
>
> **Architecture:** Microservices (Main Service, Notification Service, API Gateway, Eureka Service Discovery)
>
> **Authentication:** JWT Bearer (`Authorization: Bearer <token>`) — token contains `username (email)`, `role`, `userId`

---

## Supported Roles
- **EMPLOYEE**: View plans, update initiatives, create comments
- **MANAGER**: Create/update plans & milestones, manage initiatives
- **ADMIN**: Full system access including user management and audit logs

---

## 1. Authentication Endpoints

### 1.1 Register User
- **Endpoint:** `POST /api/auth/register`
- **Description:** Register a new user account
- **Headers:**
  - `Content-Type: application/json`
  - Authentication: **Not required** (public)
- **Request Body:**
```json
{
  "name": "string (2-50 chars, required)",
  "email": "string (valid email, required, unique)",
  "password": "string (min 8 chars, must contain 1 digit, 1 uppercase, 1 lowercase, 1 special char @#$%^&+=!)",
  "department": "string",
  "role": "string (EMPLOYEE/MANAGER/ADMIN)",
  "status": "string (ACTIVE/INACTIVE)"
}
```
- **Responses:**
  - `200`: User registered successfully
  - `400`: Validation error
  - `500`: Server error
- **Response Body:**
```json
{
  "userId": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "department": "IT",
  "role": "EMPLOYEE",
  "status": "ACTIVE"
}
```

### 1.2 Login
- **Endpoint:** `POST /api/auth/login`
- **Description:** Authenticate user and receive JWT token
- **Headers:**
  - `Content-Type: application/json`
  - Authentication: **Not required** (public)
- **Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```
- **Responses:**
  - `200`: Login successful
  - `401`: Invalid credentials
  - `400`: Missing email or password
  - `500`: Server error
- **Response Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "ROLE_EMPLOYEE",
  "userId": "1"
}
```

---

## 2. User Management Endpoints

### 2.1 Create User (Admin only)
- **Endpoint:** `POST /api/users`
- **Description:** Create a new user
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Auth:** **ADMIN**
- **Request Body:** Same as registration
- **Responses:**
  - `200`: User created successfully
  - `400`: Validation error
  - `401`: Unauthorized
  - `403`: Forbidden
  - `500`: Server error
- **Response:** User object

### 2.2 Get All Users (Manager/Admin)
- **Endpoint:** `GET /api/users`
- **Headers:** `Authorization: Bearer <token>`
- **Auth:** **MANAGER** or **ADMIN**
- **Responses:**
  - `200`: Success
  - `401`: Unauthorized
  - `403`: Forbidden
- **Response Body:**
```json
[
  {
    "userId": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "department": "IT",
    "role": "EMPLOYEE",
    "status": "ACTIVE"
  }
]
```

### 2.3 Get Users for Mentions (All roles)
- **Endpoint:** `GET /api/users/mentions`
- **Headers:** `Authorization: Bearer <token>`
- **Auth:** All roles
- **Responses:**
  - `200`: Success
  - `401`: Unauthorized
- **Response:** Array of active users

### 2.4 Get User by ID (Admin only)
- **Endpoint:** `GET /api/users/{id}`
- **Headers:** `Authorization: Bearer <token>`
- **Path Params:** `id` (Long, required)
- **Auth:** **ADMIN**
- **Responses:**
  - `200`: Success
  - `401`: Unauthorized
  - `403`: Forbidden
  - `404`: User not found
- **Response:** User object

### 2.5 Update User (Admin only)
- **Endpoint:** `PUT /api/users/{id}`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Path Params:** `id` (Long, required)
- **Auth:** **ADMIN**
- **Request Body:** User object with updated fields
- **Responses:**
  - `200`: User updated successfully
  - `400`: Validation error
  - `401`: Unauthorized
  - `403`: Forbidden
  - `404`: User not found
- **Response:** Updated User object

### 2.6 Delete User (Admin only)
- **Endpoint:** `DELETE /api/users/{id}`
- **Headers:** `Authorization: Bearer <token>`
- **Path Params:** `id` (Long, required)
- **Auth:** **ADMIN**
- **Responses:**
  - `204`: User deleted successfully
  - `401`: Unauthorized
  - `403`: Forbidden
  - `404`: User not found

---

## 3. Plan Management Endpoints

### 3.1 Create Plan (Manager/Admin)
- **Endpoint:** `POST /api/users/{userId}/plans`
- **Description:** Create a new plan for a user
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Path Params:** `userId` (Long, required)
- **Auth:** **MANAGER** or **ADMIN**
- **Request Body:**
```json
{
  "title": "string (required)",
  "description": "string (max 500 chars)",
  "priority": "LOW/MEDIUM/HIGH/CRITICAL",
  "status": "PLANNED/IN_PROGRESS/COMPLETED/ON_HOLD/CANCELLED",
  "startDate": "2024-01-01T00:00:00",
  "endDate": "2024-12-31T23:59:59"
}
```
- **Responses:**
  - `200`: Plan created successfully
  - `400`: Validation error
  - `401`: Unauthorized
  - `403`: Forbidden
- **Response:** Plan object with nested milestones

### 3.2 Get All Plans (Paginated)
- **Endpoint:** `GET /api/plans`
- **Headers:** `Authorization: Bearer <token>`
- **Query Params:** `page` (int, default 0), `size` (int, default 10), `sortBy` (string, default `"planId"`)
- **Auth:** All roles
- **Responses:**
  - `200`: Success
  - `401`: Unauthorized
- **Response Body:**
```json
{
  "content": [
    {
      "planId": 1,
      "title": "Q1 2024 Goals",
      "description": "First quarter objectives",
      "priority": "HIGH",
      "status": "IN_PROGRESS",
      "startDate": "2024-01-01T00:00:00",
      "endDate": "2024-03-31T23:59:59",
      "user": { "userId": 1, "name": "John Doe", "email": "john@example.com" },
      "milestones": []
    }
  ],
  "pageable": {},
  "totalPages": 5,
  "totalElements": 50,
  "size": 10,
  "number": 0
}
```

### 3.3 Get Plans by User (Manager/Admin)
- **Endpoint:** `GET /api/users/{userId}/plans`
- **Headers:** `Authorization: Bearer <token>`
- **Path Params:** `userId` (Long, required)
- **Auth:** **MANAGER** or **ADMIN**
- **Responses:**
  - `200`: Success
  - `401`: Unauthorized
  - `403`: Forbidden
- **Response:** Array of Plan objects

### 3.4 Get Plan by ID (All roles)
- **Endpoint:** `GET /api/plans/{planId}`
- **Headers:** `Authorization: Bearer <token>`
- **Path Params:** `planId` (Long, required)
- **Auth:** All roles
- **Responses:**
  - `200`: Success
  - `401`: Unauthorized
  - `404`: Plan not found
- **Response:** Plan object with nested milestones

### 3.5 Update Plan (Manager/Admin)
- **Endpoint:** `PUT /api/plans/{planId}`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Path Params:** `planId` (Long, required)
- **Auth:** **MANAGER** or **ADMIN**
- **Request Body:** Plan object with updated fields
- **Responses:**
  - `200`: Plan updated successfully
  - `400`: Validation error
  - `401`: Unauthorized
  - `403`: Forbidden
  - `404`: Plan not found
- **Response:** Updated Plan object

### 3.6 Delete Plan (Manager/Admin)
- **Endpoint:** `DELETE /api/plans/{planId}`
- **Headers:** `Authorization: Bearer <token>`
- **Path Params:** `planId` (Long, required)
- **Auth:** **MANAGER** or **ADMIN**
- **Responses:**
  - `204`: Plan deleted successfully
  - `401`: Unauthorized
  - `403`: Forbidden
  - `404`: Plan not found

### 3.7 Get Plans with Assigned Initiatives (Employees)
- **Endpoint:** `GET /api/users/{userId}/assigned-plans`
- **Headers:** `Authorization: Bearer <token>`
- **Path Params:** `userId` (Long, required)
- **Auth:** All roles
- **Responses:**
  - `200`: Success
  - `401`: Unauthorized
- **Response:** Array of Plan objects with assigned initiatives

### 3.8 Get Cancel Plan Preview (Manager/Admin)
- **Endpoint:** `GET /api/plans/{planId}/cancel-preview`
- **Headers:** `Authorization: Bearer <token>`
- **Path Params:** `planId` (Long, required)
- **Auth:** **MANAGER** or **ADMIN**
- **Responses:**
  - `200`: Success
  - `401`: Unauthorized
  - `403`: Forbidden
  - `404`: Plan not found
- **Response Body:**
```json
{
  "planId": 1,
  "affectedMilestones": 5,
  "affectedInitiatives": 15,
  "message": "Canceling this plan will cascade cancel 5 milestones and 15 initiatives"
}
```

### 3.9 Cancel Plan with Cascade (Manager/Admin)
- **Endpoint:** `POST /api/plans/{planId}/cancel`
- **Headers:** `Authorization: Bearer <token>`
- **Path Params:** `planId` (Long, required)
- **Auth:** **MANAGER** or **ADMIN**
- **Responses:**
  - `200`: Plan cancelled successfully
  - `401`: Unauthorized
  - `403`: Forbidden
  - `404`: Plan not found
- **Response Body:**
```json
{
  "success": true,
  "planId": 1,
  "cancelledMilestones": 5,
  "cancelledInitiatives": 15,
  "message": "Plan and all dependencies cancelled successfully"
}
```

---

## 4. Milestone Management Endpoints

### 4.1 Create Milestone (Manager/Admin)
- **Endpoint:** `POST /api/plans/{planId}/milestones`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Path Params:** `planId` (Long, required)
- **Auth:** **MANAGER** or **ADMIN**
- **Request Body:**
```json
{
  "title": "string (required)",
  "dueDate": "2024-03-31T23:59:59",
  "completionPercent": 0.0,
  "status": "PLANNED/IN_PROGRESS/COMPLETED"
}
```
- **Responses:**
  - `200`: Milestone created successfully
  - `400`: Validation error
  - `401`: Unauthorized
  - `403`: Forbidden
  - `404`: Plan not found
- **Response:** Milestone object

### 4.2 Get Milestones by Plan (Manager/Admin)
- **Endpoint:** `GET /api/plans/{planId}/milestones`
- **Headers:** `Authorization: Bearer <token>`
- **Path Params:** `planId` (Long, required)
- **Auth:** **MANAGER** or **ADMIN**
- **Responses:**
  - `200`: Success
  - `401`: Unauthorized
  - `403`: Forbidden
- **Response:** Array of Milestone objects

### 4.3 Update Milestone (Manager/Admin)
- **Endpoint:** `PUT /api/milestones/{milestoneId}`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Path Params:** `milestoneId` (Long, required)
- **Auth:** **MANAGER** or **ADMIN**
- **Request Body:** Milestone object with updated fields
- **Responses:**
  - `200`: Milestone updated successfully
  - `400`: Validation error
  - `401`: Unauthorized
  - `403`: Forbidden
  - `404`: Milestone not found
- **Response:** Updated Milestone object

### 4.4 Delete Milestone (Manager/Admin)
- **Endpoint:** `DELETE /api/milestones/{milestoneId}`
- **Headers:** `Authorization: Bearer <token>`
- **Path Params:** `milestoneId` (Long, required)
- **Auth:** **MANAGER** or **ADMIN**
- **Responses:**
  - `200`: Milestone deleted successfully
  - `401`: Unauthorized
  - `403`: Forbidden
  - `404`: Milestone not found

### 4.5 Get Cancel Milestone Preview (Manager/Admin)
- **Endpoint:** `GET /api/milestones/{milestoneId}/cancel-preview`
- **Headers:** `Authorization: Bearer <token>`
- **Path Params:** `milestoneId` (Long, required)
- **Auth:** **MANAGER** or **ADMIN**
- **Responses:**
  - `200`: Success
  - `401`: Unauthorized
  - `403`: Forbidden
  - `404`: Milestone not found
- **Response Body:**
```json
{
  "milestoneId": 1,
  "affectedInitiatives": 3,
  "message": "Canceling this milestone will cascade cancel 3 initiatives"
}
```

### 4.6 Cancel Milestone with Cascade (Manager/Admin)
- **Endpoint:** `POST /api/milestones/{milestoneId}/cancel`
- **Headers:** `Authorization: Bearer <token>`
- **Path Params:** `milestoneId` (Long, required)
- **Auth:** **MANAGER** or **ADMIN**
- **Responses:**
  - `200`: Milestone cancelled successfully
  - `401`: Unauthorized
  - `403`: Forbidden
  - `404`: Milestone not found
- **Response Body:**
```json
{
  "success": true,
  "milestoneId": 1,
  "cancelledInitiatives": 3,
  "message": "Milestone and all initiatives cancelled successfully"
}
```

---

## 5. Initiative Management Endpoints

### 5.1 Create Initiative (Manager/Admin)
- **Endpoint:** `POST /api/milestones/{milestoneId}/initiatives`
- **Description:** Create a new initiative/task for a milestone with assigned users
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Path Params:** `milestoneId` (Long, required)
- **Query Params:** `assignedUserIds` (string, required; comma-separated, e.g., `"1,2,3"`)
- **Auth:** **MANAGER** or **ADMIN**
- **Request Body:**
```json
{
  "title": "string (required)",
  "description": "string",
  "status": "PLANNED/IN_PROGRESS/COMPLETED"
}
```
- **Responses:**
  - `200`: Initiative created successfully
  - `400`: Validation error or missing `assignedUserIds`
  - `401`: Unauthorized
  - `403`: Forbidden
  - `404`: Milestone not found
- **Response:** Initiative object with assigned users

### 5.2 Get Initiatives by Milestone (All roles)
- **Endpoint:** `GET /api/milestones/{milestoneId}/initiatives`
- **Headers:** `Authorization: Bearer <token>`
- **Path Params:** `milestoneId` (Long, required)
- **Auth:** All roles
- **Responses:**
  - `200`: Success
  - `401`: Unauthorized
- **Response:** Array of Initiative objects

### 5.3 Update Initiative (Role-based)
- **Endpoint:** `PUT /api/initiatives/{initiativeId}`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Path Params:** `initiativeId` (Long, required)
- **Auth:** All roles (Employees can update own; Managers can update all)
- **Request Body:** Initiative object with updated fields
- **Responses:**
  - `200`: Initiative updated successfully
  - `400`: Validation error
  - `401`: Unauthorized
  - `403`: Forbidden
  - `404`: Initiative not found
- **Response:** Updated Initiative object

### 5.4 Get User's Initiatives (All roles)
- **Endpoint:** `GET /api/users/{userId}/initiatives`
- **Headers:** `Authorization: Bearer <token>`
- **Path Params:** `userId` (Long, required)
- **Auth:** All roles
- **Responses:**
  - `200`: Success
  - `401`: Unauthorized
- **Response:** Array of Initiative objects

---

## 6. Comment Management Endpoints

### 6.1 Create Comment (All roles)
- **Endpoint:** `POST /api/initiatives/{initiativeId}/comments`
- **Description:** Create a comment on an initiative with optional user mentions
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Path Params:** `initiativeId` (Long, required)
- **Auth:** All roles
- **Request Body:**
```json
{
  "content": "string (required, max 2000 chars)",
  "author": { "userId": 1 },
  "mentionedUsers": [ { "userId": 2 }, { "userId": 3 } ]
}
```
- **Responses:**
  - `200`: Comment created successfully
  - `400`: Validation error
  - `401`: Unauthorized
  - `404`: Initiative not found
- **Response:** Comment object with author and mentioned users

### 6.2 Get Comments (All roles)
- **Endpoint:** `GET /api/initiatives/{initiativeId}/comments`
- **Headers:** `Authorization: Bearer <token>`
- **Path Params:** `initiativeId` (Long, required)
- **Auth:** All roles
- **Responses:**
  - `200`: Success
  - `401`: Unauthorized
- **Response:** Array of Comment objects

### 6.3 Update Comment (Author only)
- **Endpoint:** `PUT /api/comments/{commentId}`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Path Params:** `commentId` (Long, required)
- **Auth:** All roles (only the author can update)
- **Request Body:** Comment object with updated content
- **Responses:**
  - `200`: Comment updated successfully
  - `400`: Validation error
  - `401`: Unauthorized
  - `403`: Forbidden (not comment author)
  - `404`: Comment not found
- **Response:** Updated Comment object

### 6.4 Delete Comment (Author only)
- **Endpoint:** `DELETE /api/comments/{commentId}`
- **Headers:** `Authorization: Bearer <token>`
- **Path Params:** `commentId` (Long, required)
- **Auth:** All roles (only the author can delete — soft delete)
- **Responses:**
  - `204`: Comment deleted successfully
  - `401`: Unauthorized
  - `403`: Forbidden (not comment author)
  - `404`: Comment not found

---

## 7. Analytics Endpoints

### 7.1 Get Dashboard Statistics (All roles)
- **Endpoint:** `GET /api/dashboard/stats`
- **Headers:** `Authorization: Bearer <token>`
- **Auth:** All roles
- **Responses:**
  - `200`: Success
  - `401`: Unauthorized
- **Response Body:**
```json
{
  "totalPlans": 50,
  "activeInitiatives": 120,
  "completedMilestones": 35,
  "totalUsers": 25
}
```

### 7.2 Get User Analytics (All roles)
- **Endpoint:** `GET /api/users/{userId}/analytics`
- **Headers:** `Authorization: Bearer <token>`
- **Path Params:** `userId` (Long, required)
- **Auth:** All roles
- **Responses:**
  - `200`: Success
  - `401`: Unauthorized
- **Response Body:**
```json
{
  "totalPlans": 10,
  "completedPlans": 7,
  "pendingPlans": 3,
  "completionPercentage": 70.0
}
```

### 7.3 Get Departmental Insights (All roles)
- **Endpoint:** `GET /api/analytics/departmental-insights`
- **Headers:** `Authorization: Bearer <token>`
- **Auth:** All roles
- **Responses:**
  - `200`: Success
  - `401`: Unauthorized
- **Response Body:**
```json
[
  {
    "department": "IT",
    "totalInitiatives": 45,
    "completedInitiatives": 30,
    "inProgressInitiatives": 10,
    "plannedInitiatives": 5,
    "completionRate": 66.67,
    "onTimeDeliveryRate": 85.0,
    "blockedCount": 2,
    "statusBreakdown": {
      "COMPLETED": 30,
      "IN_PROGRESS": 10,
      "PLANNED": 5
    }
  }
]
```

### 7.4 Get User Velocity Metrics (Manager/Admin)
- **Endpoint:** `GET /api/analytics/velocity/{userId}`
- **Description:** Retrieve velocity metrics for a specific user including task completion rates, weekly/monthly velocity, and averages.
- **Headers:** `Authorization: Bearer <jwt_token>`
- **Auth:** **MANAGER**, **ADMIN**
- **Path Params:** `userId` (Long, required)
- **Responses:**
  - `200`: Velocity metrics retrieved successfully
  - `401`: Unauthorized
  - `403`: Forbidden
  - `404`: User not found
  - `500`: Internal server error
- **Response Body:**
```json
{
  "userId": "long",
  "userName": "string",
  "department": "string",
  "tasksAssigned": "integer",
  "tasksCompleted": "integer",
  "completionRate": "double",
  "weeklyVelocity": {
    "2024-01-15": "integer",
    "2024-01-22": "integer"
  },
  "monthlyVelocity": {
    "2024-01": "integer",
    "2024-02": "integer"
  },
  "averageTasksPerWeek": "double",
  "averageTasksPerMonth": "double"
}
```
- **Request Example:**
```
GET /api/analytics/velocity/5 HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
- **Response Example:**
```json
{
  "userId": 5,
  "userName": "John Doe",
  "department": "Engineering",
  "tasksAssigned": 45,
  "tasksCompleted": 38,
  "completionRate": 84.44,
  "weeklyVelocity": {
    "2024-01-15": 8,
    "2024-01-22": 10,
    "2024-01-29": 7
  },
  "monthlyVelocity": {
    "2024-01": 38,
    "2023-12": 42
  },
  "averageTasksPerWeek": 8.5,
  "averageTasksPerMonth": 40.0
}
```

### 7.5 Get All Users Velocity Metrics (Admin only)
- **Endpoint:** `GET /api/analytics/velocity`
- **Description:** Retrieve velocity metrics for all users
- **Headers:** `Authorization: Bearer <jwt_token>`
- **Auth:** **ADMIN**
- **Responses:**
  - `200`: Velocity metrics retrieved successfully
  - `401`: Unauthorized
  - `403`: Forbidden
  - `500`: Internal server error
- **Response Body:**
```json
[
  {
    "userId": "long",
    "userName": "string",
    "department": "string",
    "tasksAssigned": "integer",
    "tasksCompleted": "integer",
    "completionRate": "double",
    "weeklyVelocity": {},
    "monthlyVelocity": {},
    "averageTasksPerWeek": "double",
    "averageTasksPerMonth": "double"
  }
]
```
- **Request Example:**
```
GET /api/analytics/velocity HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
- **Response Example:**
```json
[
  {
    "userId": 5,
    "userName": "John Doe",
    "department": "Engineering",
    "tasksAssigned": 45,
    "tasksCompleted": 38,
    "completionRate": 84.44,
    "weeklyVelocity": {},
    "monthlyVelocity": {},
    "averageTasksPerWeek": 8.5,
    "averageTasksPerMonth": 40.0
  }
]
```

### 7.6 Get Gamified Velocity (All roles)
- **Endpoint:** `GET /api/analytics/gamified-velocity`
- **Description:** Gamified velocity metrics with filtering, sorting & ranking (leaderboards)
- **Headers:** `Authorization: Bearer <jwt_token>`
- **Auth:** **EMPLOYEE**, **MANAGER**, **ADMIN**
- **Query Params (optional):**
  - `department` (string)
  - `search` (string)
  - `minCompletionRate` (double)
  - `maxCompletionRate` (double)
  - `minTasks` (integer)
  - `maxTasks` (integer)
  - `performanceTier` (string; `TOP_PERFORMER`, `CONSISTENT`, `NEEDS_IMPROVEMENT`)
  - `sortBy` (string)
  - `sortOrder` (string; default `desc`)
- **Responses:**
  - `200`: Gamified velocity data retrieved successfully
  - `400`: Invalid query parameters
  - `401`: Unauthorized
  - `500`: Internal server error
- **Response Body:**
```json
[
  {
    "userId": "long",
    "userName": "string",
    "department": "string",
    "tasksAssigned": "integer",
    "tasksCompleted": "integer",
    "completionRate": "double",
    "averageTasksPerWeek": "double",
    "averageTasksPerMonth": "double",
    "overallScore": "double",
    "rank": "integer",
    "departmentRank": "integer",
    "performanceTier": "string",
    "badges": [
      {
        "badgeId": "string",
        "badgeName": "string",
        "description": "string",
        "category": "string",
        "icon": "string",
        "earnedDate": "datetime",
        "earned": "boolean",
        "criteria": "string"
      }
    ],
    "improvementPercentage": "double",
    "streakDays": "integer",
    "streakWeeks": "integer"
  }
]
```
- **Request Example:**
```
GET /api/analytics/gamified-velocity?department=Engineering&sortBy=overallScore&sortOrder=desc HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
- **Response Example:**
```json
[
  {
    "userId": 5,
    "userName": "John Doe",
    "department": "Engineering",
    "tasksAssigned": 45,
    "tasksCompleted": 38,
    "completionRate": 84.44,
    "averageTasksPerWeek": 8.5,
    "averageTasksPerMonth": 40.0,
    "overallScore": 92.5,
    "rank": 1,
    "departmentRank": 1,
    "performanceTier": "TOP_PERFORMER",
    "badges": [
      {
        "badgeId": "speed_demon",
        "badgeName": "Speed Demon",
        "description": "Complete 50+ tasks in a month",
        "category": "SPEED",
        "icon": "🚀",
        "earnedDate": "2024-01-15T10:30:00",
        "earned": true,
        "criteria": "50+ tasks/month"
      }
    ],
    "improvementPercentage": 15.5,
    "streakDays": 45,
    "streakWeeks": 6
  }
]
```

### 7.7 Get User Performance Score (Manager/Admin)
- **Endpoint:** `GET /api/analytics/performance-score/{userId}`
- **Description:** Detailed performance score for a specific user (completion rate, speed, quality, consistency)
- **Headers:** `Authorization: Bearer <jwt_token>`
- **Auth:** **MANAGER**, **ADMIN**
- **Query Params (optional):** `department` (string) — for relative scoring
- **Path Params:** `userId` (Long, required)
- **Responses:**
  - `200`: Performance score calculated successfully
  - `401`: Unauthorized
  - `403`: Forbidden
  - `404`: User not found
  - `500`: Internal server error
- **Response Body:**
```json
{
  "userId": "long",
  "userName": "string",
  "department": "string",
  "overallScore": "double",
  "completionRate": "double",
  "speedScore": "double",
  "qualityScore": "double",
  "consistencyScore": "double",
  "rank": "integer",
  "departmentRank": "integer",
  "previousRank": "integer",
  "previousDepartmentRank": "integer",
  "performanceTier": "string",
  "improvementPercentage": "double"
}
```
- **Request Example:**
```
GET /api/analytics/performance-score/5?department=Engineering
```

---

## Notes
- All date-time fields are ISO-8601 strings (e.g., `YYYY-MM-DDThh:mm:ss`).
- Default pagination is `page=0`, `size=10` when not provided.
- Soft delete is used for comments, while users/plans/milestones have explicit delete behavior as specified.

