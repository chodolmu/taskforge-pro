@echo off
echo Stopping TaskForge GUI server on port 7777...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":7777 "') do (
    taskkill /pid %%a /f >nul 2>&1
)
echo Done.
