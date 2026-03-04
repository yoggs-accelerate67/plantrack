@echo off

:: Opens ONE window split into 4 panes running in PRODUCTION MODE
:: This activates the 'prod' profile, which triggers file logging in logback-spring.xml

wt -w 0 new-tab -p "Command Prompt" --title "Eureka (Top-Left)" -d "plantrack-eureka" cmd /k "echo EUREKA SERVER [PROD] && mvn spring-boot:run -Dspring-boot.run.profiles=prod" ; ^
split-pane -V -p "Command Prompt" --title "Gateway (Top-Right)" -d "plantrack-gateway" cmd /k "echo GATEWAY [PROD] && echo Waiting for Eureka... && timeout /t 15 && mvn spring-boot:run -Dspring-boot.run.profiles=prod" ; ^
split-pane -H -p "Command Prompt" --title "Notification (Bottom-Right)" -d "notification-service" cmd /k "echo NOTIFICATION [PROD] && echo Waiting for Eureka... && timeout /t 15 && mvn spring-boot:run -Dspring-boot.run.profiles=prod" ; ^
move-focus left ; ^
split-pane -H -p "Command Prompt" --title "Main (Bottom-Left)" -d "main-service" cmd /k "echo MAIN SERVICE [PROD] && echo Waiting for Eureka... && timeout /t 15 && mvn spring-boot:run -Dspring-boot.run.profiles=prod"