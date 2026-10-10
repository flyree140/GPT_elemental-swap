@echo off
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
  py -3 tools\start_server.py
) else (
  python tools\start_server.py
)
pause
