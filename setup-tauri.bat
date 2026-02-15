@echo off
setlocal enabledelayedexpansion

:: ============================================================
:: ProtoSigner Desktop App Builder - Tauri Setup Script
:: ============================================================
:: This script converts the ProtoSigner web app into
:: installable desktop apps for Windows, macOS, and Linux
:: ============================================================

title ProtoSigner Desktop Builder
color 0A

echo ============================================================
echo   ProtoSigner Desktop App Builder (Tauri)
echo ============================================================
echo.

:: ============================================================
:: SECTION 1: Check Prerequisites
:: ============================================================
echo [1/6] Checking prerequisites...

:: Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo   [ERROR] Node.js is not installed or not in PATH
    echo   Please install Node.js from: https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo   [OK] Node.js !NODE_VERSION!

:: Check npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo   [ERROR] npm is not installed
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo   [OK] npm !NPM_VERSION!

:: Check Rust
where rustc >nul 2>nul
if %errorlevel% neq 0 (
    echo   [ERROR] Rust is not installed or not in PATH
    echo   Please install Rust from: https://rustup.rs
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('rustc --version') do set RUST_VERSION=%%i
echo   [OK] !RUST_VERSION!

:: Check Cargo
where cargo >nul 2>nul
if %errorlevel% neq 0 (
    echo   [ERROR] Cargo is not installed
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('cargo --version') do set CARGO_VERSION=%%i
echo   [OK] !CARGO_VERSION!

echo.
echo ============================================================
echo   Prerequisites OK!
echo ============================================================
echo.

:: ============================================================
:: SECTION 2: Install Tauri CLI
:: ============================================================
echo [2/6] Installing Tauri CLI...

:: Check if @tauri-apps/cli is already installed
set TauriInstalled=
where tauri >nul 2>nul
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('tauri --version') do set TauriInstalled=%%i
)

if defined TauriInstalled (
    echo   [OK] Tauri CLI already installed: !TauriInstalled!
) else (
    echo   Installing @tauri-apps/cli...
    call npm install -D @tauri-apps/cli@latest
    if %errorlevel% neq 0 (
        echo   [ERROR] Failed to install Tauri CLI
        pause
        exit /b 1
    )
    echo   [OK] Tauri CLI installed
)

:: Add node_modules\.bin to PATH for this session
set PATH=%~dp0node_modules\.bin;%PATH%

echo.
echo ============================================================
echo   Tauri CLI Ready
echo ============================================================
echo.

:: ============================================================
:: SECTION 3: Initialize Tauri
:: ============================================================
echo [3/6] Initializing Tauri...

if exist "src-tauri" (
    echo   [INFO] Tauri already initialized
    set TAURI_INIT=SKIP
) else (
    echo   Running: npx tauri init
    echo   (Please fill in the prompts with these values:)
    echo.
    echo   App name: ProtoSigner
    echo   Window title: ProtoSigner
    echo   Dev URL: http://localhost:5173
    echo   Before dev command: npm run dev
    echo   Before build command: npm run build
    echo.
    call npx tauri init --app-name "ProtoSigner" --window-title "ProtoSigner" --dev-url "http://localhost:5173" --before-dev-command "npm run dev" --before-build-command "npm run build" --ci
    if %errorlevel% neq 0 (
        echo   [WARNING] Tauri init had issues, but continuing...
    ) else (
        echo   [OK] Tauri initialized
    )
)

echo.
echo ============================================================
echo   Tauri Initialized
echo ============================================================
echo.

:: ============================================================
:: SECTION 4: Configure Tauri
:: ============================================================
echo [4/6] Configuring Tauri...

:: Update package.json with tauri script
echo   Adding tauri scripts to package.json...

:: Check if tauri script already exists
findstr /C:"\"tauri\"" package.json >nul 2>nul
if %errorlevel% neq 0 (
    echo   Adding "tauri" command to package.json scripts...
    
    :: Use PowerShell to safely update package.json
    powershell -Command ^
        "$json = Get-Content 'package.json' -Raw | ConvertFrom-Json; ^
        $json.scripts | Add-Member -Force -NotePropertyName 'tauri' -NotePropertyValue 'tauri' -PassThru | Out-Null; ^
        $json | ConvertTo-Json -Depth 10 | Set-Content 'package.json'"
    
    echo   [OK] Added tauri script
) else (
    echo   [INFO] Tauri script already exists
)

:: Update tauri.conf.json with app metadata
if exist "src-tauri\tauri.conf.json" (
    echo   Updating tauri.conf.json...
    
    powershell -Command ^
        "$conf = Get-Content 'src-tauri\tauri.conf.json' -Raw | ConvertFrom-Json; ^
        $conf.app.windows[0].title = 'ProtoSigner'; ^
        $conf.app.windows[0].width = 1440; ^
        $conf.app.windows[0].height = 900; ^
        $conf.app.windows[0].minWidth = 800; ^
        $conf.app.windows[0].minHeight = 600; ^
        $conf.app.windows[0].center = $true; ^
        $conf.app.security.csp = 'default-src ''self''; script-src ''self'' ''unsafe-inline''; style-src ''self'' ''unsafe-inline''; img-src ''self'' data: https:;'; ^
        $conf | ConvertTo-Json -Depth 10 | Set-Content 'src-tauri\tauri.conf.json'"
    
    echo   [OK] Updated tauri.conf.json
)

:: Add Tauri API package
echo   Installing @tauri-apps/api...
call npm install @tauri-apps/api@latest
if %errorlevel% equ 0 (
    echo   [OK] @tauri-apps/api installed
) else (
    echo   [WARNING] Failed to install @tauri-apps/api
)

echo.
echo ============================================================
echo   Tauri Configured
echo ============================================================
echo.

:: ============================================================
:: SECTION 5: Build Desktop App
:: ============================================================
echo [5/6] Building desktop app...

echo   This will compile the Rust backend and bundle the web app.
echo   Building for Windows...
echo.

call npx tauri build
if %errorlevel% neq 0 (
    echo.
    echo   [ERROR] Build failed
    echo   Check the errors above for details
    pause
    exit /b 1
)

echo.
echo ============================================================
echo   Build Complete!
echo ============================================================
echo.

:: ============================================================
:: SECTION 6: Show Results
:: ============================================================
echo [6/6] Build Results...
echo.

if exist "src-tauri\target\release\bundle\msi" (
    echo   [MSI Installer]
    for /r "src-tauri\target\release\bundle\msi" %%f in (*.msi) do (
        echo   - %%~nxf
    )
)

if exist "src-tauri\target\release\bundle\nsis" (
    echo   [NSIS Installer]
    for /r "src-tauri\target\release\bundle\nsis" %%f in (*.exe) do (
        echo   - %%~nxf
    )
)

if exist "src-tauri\target\release\ProtoSigner.exe" (
    echo   [Standalone EXE]
    echo   - src-tauri\target\release\ProtoSigner.exe
)

echo.
echo ============================================================
echo   ProtoSigner Desktop App Ready!
echo ============================================================
echo.
echo   To run in development mode:
echo   npm run tauri dev
echo.
echo   To build again:
echo   npm run tauri build
echo.
echo   For macOS/Linux builds, run this script on those platforms.
echo.

pause
