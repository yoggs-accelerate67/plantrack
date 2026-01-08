# How to See Logs in PlanTrack

## Quick Fix: Make Sure Logs Are Visible

### 1. Check Your Console/Terminal
When you run the Spring Boot app, logs appear in the **same terminal** where you started the app.

### 2. Run with Explicit Logging
```powershell
# In the backend directory
cd backend
.\mvnw spring-boot:run
```

### 3. What You Should See
When you create a plan, you should see logs like:
```
2026-01-07 22:35:10.123 [http-nio-8080-exec-1] INFO  c.p.b.s.PlanService - Created plan: planId=1, title=My Plan, userId=1, priority=HIGH
2026-01-07 22:35:10.456 [http-nio-8080-exec-1] INFO  c.p.b.s.NotificationService - Notification created successfully: notificationId=1, userId=1, type=INFO
```

### 4. If You Don't See Logs

**Option A: Set Log Level in application.properties**
The file already has logging configured. Make sure it includes:
```properties
logging.level.com.plantrack.backend.service=INFO
```

**Option B: Run with Dev Profile**
```powershell
.\mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

**Option C: Check if Logger is Working**
Add this to see if logging works at all:
```powershell
# In application.properties, add:
logging.level.root=INFO
logging.level.com.plantrack=INFO
```

### 5. Test Logging
1. Start the app: `.\mvnw spring-boot:run`
2. Create a plan via API or frontend
3. Look in the **console/terminal** where you ran the command
4. You should see INFO level logs for plan creation

### 6. Common Issues

**Issue: No logs in console**
- Make sure you're looking at the terminal where you started Spring Boot
- Check that the app is actually running
- Verify log level is INFO or lower

**Issue: Only seeing Hibernate SQL logs**
- That's normal! You should also see our application logs
- Look for lines containing "PlanService" or "InitiativeService"

**Issue: Logs are too verbose**
- Set `logging.level.com.plantrack.backend.service=INFO` (not DEBUG)
- Set `logging.level.root=WARN` to reduce Spring framework logs

### 7. View Log Files (Production Mode)
If running with `prod` profile, logs go to files:
```powershell
# View main log
Get-Content logs\plantrack.log -Tail 50

# View errors only
Get-Content logs\plantrack-error.log
```
