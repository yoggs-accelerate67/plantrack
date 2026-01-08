# Fixed: Running with Production Profile in PowerShell

## The Problem
PowerShell was interpreting `-Dspring-boot.run.profiles=prod` incorrectly, causing:
```
[ERROR] Unknown lifecycle phase ".run.profiles=prod"
```

## Solution: Use Correct PowerShell Syntax

### Method 1: Quote the Parameter (Recommended)
```powershell
cd backend
.\mvnw spring-boot:run "-Dspring-boot.run.profiles=prod"
```

### Method 2: Use Backtick Escape
```powershell
cd backend
.\mvnw spring-boot:run `-Dspring-boot.run.profiles=prod
```

### Method 3: Environment Variable (Easiest)
```powershell
cd backend
$env:SPRING_PROFILES_ACTIVE="prod"
.\mvnw spring-boot:run
```

### Method 4: Set in application.properties
Add this line to `backend/src/main/resources/application.properties`:
```properties
spring.profiles.active=prod
```
Then just run:
```powershell
.\mvnw spring-boot:run
```

## Verify Production Profile is Active

When the app starts, look for this in the console:
```
The following profiles are active: prod
```

Or check startup logs for:
```
2026-01-07 22:56:42.123 [main] INFO  o.s.b.SpringApplication - The following profiles are active: prod
```

## Check Log Files

After running with prod profile, logs will be in:
```powershell
# View main log
Get-Content logs\plantrack.log -Tail 50

# View error log
Get-Content logs\plantrack-error.log -Tail 50

# Follow logs live
Get-Content logs\plantrack.log -Wait -Tail 20
```

## Quick Test

1. Run: `.\mvnw spring-boot:run "-Dspring-boot.run.profiles=prod"`
2. Wait for app to start
3. Create a plan via API/frontend
4. Check logs: `Get-Content logs\plantrack.log -Tail 20`

You should see logs like:
```
2026-01-07 22:56:42.123 [http-nio-8080-exec-1] INFO  c.p.b.s.PlanService - Created plan: planId=1, title=My Plan, userId=1, priority=HIGH
```
