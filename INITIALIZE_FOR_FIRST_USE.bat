@echo off
echo ========================================
echo Checking solo-pm Project Status...
echo ========================================

:: Check if the solo-pm folder already exists
if exist "solo-pm\" (
    echo Project folder already exists. Skipping creation and full install.
    cd solo-pm
    goto UPDATE_FILES
)

:: Step 1: Create Vite project and install dependencies (Only runs on first use)
call npm create vite@latest solo-pm -- --template react-ts
cd solo-pm
call npm install
call npm install lucide-react tailwindcss @tailwindcss/vite

:UPDATE_FILES
:: Step 2: Copy and overwrite contents of the src folder from the root directory
echo Updating src files...
xcopy "..\src" "src\" /E /I /Y

:: Step 3: Replace vite.config.ts with the one from the root directory
echo Updating vite.config.ts...
copy /y "..\vite.config.ts" "vite.config.ts"

echo ========================================
echo Initialization/Update complete successfully!
echo ========================================
pause