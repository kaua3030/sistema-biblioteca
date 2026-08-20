@echo off
cd /d "%~dp0"

if /I "%1"=="subir-backend" goto subir_backend
if /I "%1"=="subir-frontend" goto subir_frontend
if /I "%1"=="subir-tudo" goto subir_tudo
if /I "%1"=="parar-backend" goto parar_backend
if /I "%1"=="parar-frontend" goto parar_frontend
if /I "%1"=="parar-tudo" goto parar_tudo
if /I "%1"=="status" goto status

echo Uso:
echo   biblioteca.cmd subir-backend
echo   biblioteca.cmd subir-frontend
echo   biblioteca.cmd subir-tudo
echo   biblioteca.cmd parar-backend
echo   biblioteca.cmd parar-frontend
echo   biblioteca.cmd parar-tudo
echo   biblioteca.cmd status
exit /b 1

:subir_backend
docker compose -f docker-compose.backend.yml --env-file app/backend/.env up -d --build
exit /b %errorlevel%

:subir_frontend
docker compose -f docker-compose.frontend.yml --env-file app/frontend/.env up -d --build
exit /b %errorlevel%

:subir_tudo
call "%~f0" subir-backend
if errorlevel 1 exit /b %errorlevel%
call "%~f0" subir-frontend
exit /b %errorlevel%

:parar_backend
docker compose -f docker-compose.backend.yml --env-file app/backend/.env down
exit /b %errorlevel%

:parar_frontend
docker compose -f docker-compose.frontend.yml --env-file app/frontend/.env down
exit /b %errorlevel%

:parar_tudo
call "%~f0" parar-frontend
call "%~f0" parar-backend
exit /b %errorlevel%

:status
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"