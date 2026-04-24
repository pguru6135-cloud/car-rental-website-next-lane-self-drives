@echo off
start "Backend" cmd /c "cd next-lane-self-drives\backend && npm run dev"
start "Frontend" cmd /c "cd next-lane-self-drives\backend\client && npm run dev"
