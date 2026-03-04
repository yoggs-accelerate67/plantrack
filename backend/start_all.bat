@echo off

:: Opens ONE window split into 4 panes
:: TL: Eureka | TR: Gateway
:: BL: Main   | BR: Notification

wt -w 0 new-tab -p "Command Prompt" --title "Eureka (Top-Left)" -d "plantrack-eureka" cmd /k "echo EUREKA SERVER && mvn spring-boot:run" ; ^
split-pane -V -p "Command Prompt" --title "Gateway (Top-Right)" -d "plantrack-gateway" cmd /k "echo GATEWAY && echo Waiting for Eureka... && timeout /t 15 && mvn spring-boot:run" ; ^
split-pane -H -p "Command Prompt" --title "Notification (Bottom-Right)" -d "notification-service" cmd /k "echo NOTIFICATION && echo Waiting for Eureka... && timeout /t 15 && mvn spring-boot:run" ; ^
move-focus left ; ^
split-pane -H -p "Command Prompt" --title "Main (Bottom-Left)" -d "main-service" cmd /k "echo MAIN SERVICE && echo Waiting for Eureka... && timeout /t 15 && mvn spring-boot:run"