# PlanTrack Enterprise - Beginner's Guide

## 📚 Table of Contents
1. [What is PlanTrack Enterprise?](#what-is-plantrack-enterprise)
2. [Prerequisites](#prerequisites)
3. [Installation Guide](#installation-guide)
4. [Running the Application](#running-the-application)
5. [First Steps](#first-steps)
6. [Understanding the Interface](#understanding-the-interface)
7. [Common Tasks](#common-tasks)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 What is PlanTrack Enterprise?

PlanTrack Enterprise is a professional project management system that helps teams organize work into:
- **Plans** (Top-level projects)
- **Milestones** (Phases within a plan)
- **Initiatives** (Tasks within milestones)

### Key Features
- ✅ Role-based access control (Admin, Manager, Employee)
- ✅ Real-time progress tracking
- ✅ Beautiful, modern interface
- ✅ Dashboard with statistics
- ✅ Kanban-style plan board

---

## 📋 Prerequisites

Before you begin, make sure you have the following installed on your computer:

### Required Software

1. **Java Development Kit (JDK) 17 or higher**
   - Download from: https://adoptium.net/
   - Verify installation: Open terminal/command prompt and type:
     ```bash
     java -version
     ```
   - You should see something like: `openjdk version "17.0.x"`

2. **Maven (Build Tool)**
   - Download from: https://maven.apache.org/download.cgi
   - Verify installation:
     ```bash
     mvn -version
     ```
   - You should see Maven version information

3. **MySQL Database 8.0**
   - Download from: https://dev.mysql.com/downloads/mysql/
   - During installation, remember your root password!
   - Verify installation:
     ```bash
     mysql --version
     ```

4. **Node.js (version 18 or higher)**
   - Download from: https://nodejs.org/
   - Verify installation:
     ```bash
     node -v
     npm -v
     ```
   - Both commands should show version numbers

5. **Angular CLI**
   - After installing Node.js, install Angular CLI globally:
     ```bash
     npm install -g @angular/cli
     ```
   - Verify installation:
     ```bash
     ng version
     ```

---

## 🚀 Installation Guide

### Step 1: Clone or Download the Project

1. If you have the project folder, navigate to it in your terminal/command prompt
2. If not, download and extract the project to a folder like `C:\Projects\PlanTrack` (Windows) or `~/Projects/PlanTrack` (Mac/Linux)

### Step 2: Set Up MySQL Database

1. **Start MySQL Server**
   - On Windows: Open "Services" and start "MySQL80"
   - On Mac: Open System Preferences → MySQL → Start MySQL Server
   - On Linux: `sudo systemctl start mysql`

2. **Create the Database**
   - Open MySQL Command Line Client or MySQL Workbench
   - Run this command:
     ```sql
     CREATE DATABASE plantrack;
     ```
   - Verify it was created:
     ```sql
     SHOW DATABASES;
     ```
     You should see `plantrack` in the list

3. **Update Database Configuration**
   - Open the file: `backend/src/main/resources/application.properties`
   - Update these lines with your MySQL password:
     ```properties
     spring.datasource.password=YOUR_MYSQL_PASSWORD
     ```
   - If your MySQL username is not `root`, also update:
     ```properties
     spring.datasource.username=YOUR_MYSQL_USERNAME
     ```

### Step 3: Install Backend Dependencies

1. Open terminal/command prompt
2. Navigate to the backend folder:
   ```bash
   cd backend
   ```
3. Install dependencies (Maven will download everything automatically):
   ```bash
   mvn clean install
   ```
   - This may take 5-10 minutes the first time
   - Wait for "BUILD SUCCESS" message

### Step 4: Install Frontend Dependencies

1. Open a NEW terminal/command prompt window
2. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
   - This may take 3-5 minutes
   - Wait for it to finish without errors

---

## ▶️ Running the Application

You need to run TWO servers: Backend (Spring Boot) and Frontend (Angular).

### Terminal 1: Start Backend Server

1. Navigate to backend folder:
   ```bash
   cd backend
   ```
2. Start the server:
   ```bash
   mvn spring-boot:run
   ```
3. Wait for this message:
   ```
   Started BackendApplication in X.XXX seconds
   ```
4. The backend is now running at: `http://localhost:8080`
5. **Keep this terminal window open!**

### Terminal 2: Start Frontend Server

1. Navigate to frontend folder:
   ```bash
   cd frontend
   ```
2. Start the development server:
   ```bash
   ng serve
   ```
   - Or: `npm start`
3. Wait for this message:
   ```
   ✔ Compiled successfully.
   Local: http://localhost:4200/
   ```
4. The frontend is now running at: `http://localhost:4200`
5. **Keep this terminal window open!**

### Step 3: Open the Application

1. Open your web browser (Chrome, Firefox, Edge, etc.)
2. Go to: `http://localhost:4200`
3. You should see the login page!

---

## 🎬 First Steps

### Step 1: Register Users

Before you can login, you need to create user accounts. You can do this via:

**Option A: Using Postman (Recommended for beginners)**
1. Download Postman from: https://www.postman.com/downloads/
2. Open Postman
3. Create a new request:
   - Method: `POST`
   - URL: `http://localhost:8080/api/auth/register`
   - Headers: Add `Content-Type: application/json`
   - Body (raw JSON):
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
4. Click "Send"
5. Repeat for other users:
   - **Employee**: Change email to `charlie@company.com` and role to `EMPLOYEE`
   - **Admin**: Change email to `bob@company.com` and role to `ADMIN`

**Option B: Using Swagger UI**
1. Go to: `http://localhost:8080/swagger-ui/index.html`
2. Find the `/api/auth/register` endpoint
3. Click "Try it out"
4. Enter the JSON body (same as above)
5. Click "Execute"

### Step 2: Login

1. Go to: `http://localhost:4200`
2. Enter credentials:
   - Email: `alice@company.com`
   - Password: `SecurePass123!`
3. Click "Sign In"
4. You should be redirected to the Dashboard!

---

## 🖥️ Understanding the Interface

### Dashboard (Command Center)

The dashboard shows:
- **KPI Cards**: Total Plans, Active Initiatives, Completed Milestones, Total Users
- **Plan Grid**: Visual cards showing all your plans
- **Create Plan Button**: Only visible to Managers and Admins

### Navigation Bar

- **Dashboard**: Overview of all plans and statistics
- **Plans**: Kanban board view of plans organized by status
- **User Info**: Shows your email and role
- **Logout**: Sign out of the application

### Plan Detail View

When you click on a plan, you'll see:
- **Plan Header**: Title, description, priority, status, progress
- **Milestones**: Collapsible sections (click to expand)
- **Initiatives**: Tasks within each milestone

---

## 📝 Common Tasks

### As a Manager (Alice)

#### Creating a Plan
1. Go to Dashboard
2. Click "Create New Plan" button (top right)
3. Fill in:
   - Title: "Website Redesign"
   - Description: "Complete redesign of company website"
   - Priority: High
   - Status: Planned
4. Click "Create Plan"
5. ✅ Success! Plan appears in the grid

#### Adding a Milestone
1. Click on a plan to open it
2. Click "Add Milestone" button
3. Enter:
   - Title: "Design Phase"
   - Due Date: (optional)
4. Click "Add Milestone"
5. ✅ Milestone appears in the list

#### Adding an Initiative
1. Open a plan
2. Expand a milestone (click on it)
3. Click "Add Initiative" button
4. Enter:
   - Title: "Create Wireframes"
   - Description: "Design wireframes for all pages"
   - Assigned User ID: 2 (Charlie's ID)
5. Click "Add Initiative"
6. ✅ Initiative appears in the milestone

#### Editing/Deleting
- **Hover** over any plan, milestone, or initiative row
- **Edit** (pencil icon) and **Delete** (trash icon) buttons appear
- Click to perform the action

### As an Employee (Charlie)

#### Viewing Plans
- You can see all plans, milestones, and initiatives
- Everything is **read-only** except your assigned initiatives

#### Updating Initiative Status
1. Open a plan
2. Expand a milestone
3. Find an initiative assigned to you
4. Click the **Status dropdown**
5. Change from "Planned" to "In Progress" or "Completed"
6. ✅ Status updates automatically!

### As an Admin (Bob)

#### Managing Users
- You can delete plans (cleanup)
- You have access to user management features
- You can perform all Manager actions

---

## 🔧 Troubleshooting

### Problem: Backend won't start

**Error**: `Port 8080 is already in use`

**Solution**:
1. Find what's using port 8080:
   - Windows: `netstat -ano | findstr :8080`
   - Mac/Linux: `lsof -i :8080`
2. Kill the process or change the port in `application.properties`:
   ```properties
   server.port=8081
   ```

**Error**: `Cannot connect to MySQL`

**Solution**:
1. Make sure MySQL is running
2. Check your password in `application.properties`
3. Verify database exists: `SHOW DATABASES;` in MySQL

---

### Problem: Frontend won't start

**Error**: `Port 4200 is already in use`

**Solution**:
1. Kill the process using port 4200
2. Or use a different port:
   ```bash
   ng serve --port 4201
   ```

**Error**: `npm install` fails

**Solution**:
1. Delete `node_modules` folder
2. Delete `package-lock.json`
3. Run `npm install` again
4. If still failing, try: `npm cache clean --force`

---

### Problem: Can't login

**Error**: "Invalid email or password"

**Solution**:
1. Make sure you registered the user first (see First Steps)
2. Check that the backend is running
3. Verify credentials are correct
4. Try registering again

---

### Problem: Buttons not showing

**Issue**: "Create Plan" button not visible

**Solution**:
1. Make sure you're logged in as Manager or Admin
2. Check your role in the top-right corner
3. If you're an Employee, you won't see create buttons (this is by design)

---

### Problem: Empty dashboard

**Issue**: Dashboard shows "No plans yet"

**Solution**:
1. This is normal if you haven't created any plans yet
2. As a Manager, click "Create New Plan" to add your first plan
3. If you're an Employee, ask a Manager to create plans

---

### Problem: CORS errors in browser console

**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**:
1. Make sure backend is running on `http://localhost:8080`
2. Check `SecurityConfig.java` has CORS enabled for `http://localhost:4200`
3. Restart the backend server

---

## 📞 Getting Help

### Check Logs

**Backend logs**: Look in the terminal where you ran `mvn spring-boot:run`
- Errors will appear in red
- Look for stack traces to identify issues

**Frontend logs**: 
- Open browser Developer Tools (F12)
- Check the Console tab for errors
- Check the Network tab for failed API calls

### Common Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| `401 Unauthorized` | Not logged in or token expired | Login again |
| `403 Forbidden` | Don't have permission | Check your role |
| `404 Not Found` | Resource doesn't exist | Check the ID/URL |
| `500 Internal Server Error` | Server error | Check backend logs |

---

## ✅ Quick Checklist

Before asking for help, make sure:

- [ ] MySQL is running
- [ ] Database `plantrack` exists
- [ ] Backend is running on port 8080
- [ ] Frontend is running on port 4200
- [ ] You've registered at least one user
- [ ] You're using the correct credentials
- [ ] Browser console shows no errors

---

## 🎓 Next Steps

Once you're comfortable with the basics:

1. **Explore Swagger UI**: `http://localhost:8080/swagger-ui/index.html`
   - Test all API endpoints
   - See request/response formats

2. **Read DOCS.md**: Comprehensive API documentation
   - Postman collection examples
   - Complete endpoint reference

3. **Customize the Application**:
   - Change colors in TailwindCSS classes
   - Add new features
   - Modify business logic

---

## 🎉 Congratulations!

You've successfully set up and are running PlanTrack Enterprise! 

**Happy Project Managing!** 🚀

---

*Last Updated: 2024*
*For more detailed API documentation, see DOCS.md*

