@echo off
setlocal

set "PROJECT_ROOT=%~dp0"
set "RUNTIME_ROOT=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies"
set "PATH=%RUNTIME_ROOT%\node\bin;%RUNTIME_ROOT%\bin\fallback;%PATH%"

cd /d "%PROJECT_ROOT%"

echo Starting AI Research Meeting Assistant Demo...
echo.
echo Backend:  http://127.0.0.1:4000/api
echo Frontend: http://127.0.0.1:5173
echo.

start "AI Meeting Backend" cmd /k "cd /d "%PROJECT_ROOT%" && set "PATH=%PATH%" && pnpm --filter backend start"
timeout /t 2 /nobreak > nul
start "AI Meeting Frontend" cmd /k "cd /d "%PROJECT_ROOT%" && set "PATH=%PATH%" && pnpm --filter frontend dev -- --host 127.0.0.1"

echo Open http://127.0.0.1:5173 in your browser.
pause
