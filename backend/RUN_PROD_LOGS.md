# Running with Production Profile to Capture Logs in Files

## Quick Start

### 1. Run with Production Profile

**Using Maven Wrapper (PowerShell - CORRECT SYNTAX):**
```powershell
cd backend
.\mvnw spring-boot:run "-Dspring-boot.run.profiles=prod"
```

**Alternative PowerShell syntax:**
```powershell
cd backend
.\mvnw spring-boot:run `-Dspring-boot.run.profiles=prod
```

**Or using environment variable (easiest for PowerShell):**
```powershell
cd backend
$env:SPRING_PROFILES_ACTIVE="prod"
.\mvnw spring-boot:run
```

**Or using Java directly (if you have a JAR):**
```powershell
java -jar target/backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

**Or set environment variable:**
```powershell
$env:SPRING_PROFILES_ACTIVE="prod"
.\mvnw spring-boot:run
```

### 2. Log Files Location

When running with `prod` profile, logs are written to:
- **Main log file**: `backend/logs/plantrack.log`
- **Error log file**: `backend/logs/plantrack-error.log` (ERROR level only)
- **Daily rotated logs**: `backend/logs/plantrack-2026-01-07.log` (date-based)

The `logs/` directory is created automatically in the `backend` folder.

### 3. View Log Files

**View the main log file (last 50 lines):**
```powershell
Get-Content backend\logs\plantrack.log -Tail 50
```

**View error log file:**
```powershell
Get-Content backend\logs\plantrack-error.log -Tail 50
```

**Follow logs in real-time (like `tail -f`):**
```powershell
Get-Content backend\logs\plantrack.log -Wait -Tail 20
```

**View all log files:**
```powershell
Get-ChildItem backend\logs\*.log
```

### 4. Log File Configuration

The production profile is configured in `logback-spring.xml`:
- **Log Level**: INFO for application, WARN for Spring/Hibernate
- **File Rotation**: Daily rotation, keeps 30 days of history
- **Max Size**: 1GB total for main logs, 500MB for error logs
- **Format**: `TIMESTAMP [THREAD] LEVEL LOGGER - MESSAGE`

### 5. Example Log Output

When you create a plan, you'll see in `plantrack.log`:
```
2026-01-07 22:35:10.123 [http-nio-8080-exec-1] INFO  c.p.b.s.PlanService - Created plan: planId=1, title=My Plan, userId=1, priority=HIGH
2026-01-07 22:35:10.456 [http-nio-8080-exec-1] INFO  c.p.b.s.NotificationService - Notification created successfully: notificationId=1, userId=1, type=INFO
2026-01-07 22:35:10.789 [http-nio-8080-exec-1] DEBUG c.p.b.s.AuditService - Creating audit log: action=CREATE, entityType=PLAN, entityId=1, performedBy=user@example.com
```

### 6. Filter Logs

**Show only errors:**
```powershell
Get-Content backend\logs\plantrack.log | Select-String "ERROR"
```

**Show logs for specific service:**
```powershell
Get-Content backend\logs\plantrack.log | Select-String "PlanService"
```

**Show logs for specific user:**
```powershell
Get-Content backend\logs\plantrack.log | Select-String "userId=1"
```

**Show logs from today:**
```powershell
Get-Content backend\logs\plantrack.log | Select-String "2026-01-07"
```

### 7. Verify Production Profile is Active

When the app starts, you should see in the console:
```
The following profiles are active: prod
```

Or check the startup logs for profile information.

### 8. Production Profile Settings

In production mode:
- ✅ Logs written to files (`logs/plantrack.log`)
- ✅ Error logs separate (`logs/plantrack-error.log`)
- ✅ Less verbose (INFO level for app, WARN for framework)
- ✅ Daily log rotation
- ✅ Automatic cleanup (30 days history)

### 9. Troubleshooting

**Issue: Log files not created**
- Make sure you're running with `-Dspring-boot.run.profiles=prod`
- Check that the `backend` directory is writable
- Verify the app started successfully

**Issue: Can't find log files**
- Logs are in `backend/logs/` (relative to where you run the command)
- If running from project root, path is `backend/logs/plantrack.log`
- Use `Get-ChildItem -Recurse -Filter "plantrack.log"` to search

**Issue: Logs are empty**
- Wait a few seconds after starting the app
- Make sure you're performing actions (create plan, etc.)
- Check that log level allows INFO messages

### 10. Quick Commands Reference

```powershell
# Run with prod profile
.\mvnw spring-boot:run -Dspring-boot.run.profiles=prod

# View latest logs
Get-Content logs\plantrack.log -Tail 50

# View errors only
Get-Content logs\plantrack-error.log

# Follow logs live
Get-Content logs\plantrack.log -Wait -Tail 20

# Search for specific text
Get-Content logs\plantrack.log | Select-String "PlanService"

# List all log files
Get-ChildItem logs\*.log
```
