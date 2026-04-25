@echo off
setlocal
cd /d "%~dp0"
set PORT=7777
set URL=http://localhost:%PORT%

:: Install dependencies if needed
if not exist "%~dp0node_modules" (
    echo Installing dependencies...
    npm install --prefix "%~dp0"
)

:: Start server
if "%~1"=="" (
    start "TaskForge-GUI-Server" /min cmd /c "node server.js %PORT%"
) else (
    start "TaskForge-GUI-Server" /min cmd /c "node server.js ""%~1"" %PORT%"
)

:: Wait briefly for server to start
timeout /t 2 /nobreak >nul

:: Try Chrome first, then Edge, then default browser
set CHROME=
for %%p in (
    "%ProgramFiles%\Google\Chrome\Application\chrome.exe"
    "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
    "%LocalAppData%\Google\Chrome\Application\chrome.exe"
) do (
    if exist %%p (
        set CHROME=%%p
        goto :found_chrome
    )
)
:found_chrome

if defined CHROME (
    start "" %CHROME% --app=%URL% --window-size=1600,950
    goto :done
)

:: Try Edge
set EDGE=
for %%p in (
    "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
    "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
) do (
    if exist %%p (
        set EDGE=%%p
        goto :found_edge
    )
)
:found_edge

if defined EDGE (
    start "" %EDGE% --app=%URL% --window-size=1600,950
    goto :done
)

:: Fallback: default browser
start "" %URL%

:done
endlocal
