#!/bin/bash

# ============================================================
# ProtoSigner Desktop App Builder - Linux Setup Script
# ============================================================
# This script converts the ProtoSigner web app into
# installable desktop apps for Linux
# ============================================================

set -e

echo "============================================================"
echo "  ProtoSigner Desktop App Builder (Tauri) - Linux"
echo "============================================================"
echo ""

# ============================================================
# SECTION 1: Check Prerequisites
# ============================================================
echo "[1/6] Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "  [ERROR] Node.js is not installed"
    echo "  Please install Node.js from: https://nodejs.org"
    exit 1
fi
echo "  [OK] Node.js $(node -v)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "  [ERROR] npm is not installed"
    exit 1
fi
echo "  [OK] npm $(npm -v)"

# Check Rust
if ! command -v rustc &> /dev/null; then
    echo "  [ERROR] Rust is not installed"
    echo "  Please install Rust from: https://rustup.rs"
    exit 1
fi
echo "  [OK] $(rustc --version)"

# Check Cargo
if ! command -v cargo &> /dev/null; then
    echo "  [ERROR] Cargo is not installed"
    exit 1
fi
echo "  [OK] $(cargo --version)"

# Check for Linux build dependencies
echo "  Checking Linux build dependencies..."

if command -v apt-get &> /dev/null; then
    # Debian/Ubuntu
    echo "  [INFO] Detected Debian/Ubuntu system"
    
    # Check if build-essential is installed
    if ! dpkg -s build-essential libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf >/dev/null 2>&1; then
        echo "  [INFO] Installing Linux build dependencies..."
        echo "  [INFO] You may need to enter your password for sudo..."
        sudo apt-get update
        sudo apt-get install -y build-essential libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
    fi
elif command -v dnf &> /dev/null; then
    # Fedora
    echo "  [INFO] Detected Fedora/RHEL system"
    sudo dnf install -y webkit2gtk4.1-devel gcc-c++ make librsvg2-devel
elif command -v pacman &> /dev/null; then
    # Arch Linux
    echo "  [INFO] Detected Arch Linux system"
    sudo pacman -S --noconfirm base-devel webkit2gtk-4.1 libappindicator-1.0
fi

echo ""
echo "============================================================"
echo "  Prerequisites OK!"
echo "============================================================"
echo ""

# ============================================================
# SECTION 2: Install Tauri CLI
# ============================================================
echo "[2/6] Installing Tauri CLI..."

if command -v tauri &> /dev/null; then
    echo "  [OK] Tauri CLI already installed: $(tauri --version)"
else
    echo "  Installing @tauri-apps/cli..."
    npm install -D @tauri-apps/cli@latest
    echo "  [OK] Tauri CLI installed"
fi

echo ""
echo "============================================================"
echo "  Tauri CLI Ready"
echo "============================================================"
echo ""

# ============================================================
# SECTION 3: Initialize Tauri
# ============================================================
echo "[3/6] Initializing Tauri..."

if [ -d "src-tauri" ]; then
    echo "  [INFO] Tauri already initialized"
else
    echo "  Initializing Tauri..."
    npx tauri init --app-name "ProtoSigner" --window-title "ProtoSigner" \
        --dev-url "http://localhost:5173" \
        --before-dev-command "npm run dev" \
        --before-build-command "npm run build" \
        --ci
    echo "  [OK] Tauri initialized"
fi

echo ""
echo "============================================================"
echo "  Tauri Initialized"
echo "============================================================"
echo ""

# ============================================================
# SECTION 4: Configure Tauri
# ============================================================
echo "[4/6] Configuring Tauri..."

# Add tauri script to package.json
if ! grep -q '"tauri"' package.json; then
    echo "  Adding tauri scripts to package.json..."
    node -e "
        const fs = require('fs');
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        pkg.scripts.tauri = 'tauri';
        fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
    "
    echo "  [OK] Added tauri script"
fi

# Update tauri.conf.json
if [ -f "src-tauri/tauri.conf.json" ]; then
    echo "  Updating tauri.conf.json..."
    node -e "
        const fs = require('fs');
        const conf = JSON.parse(fs.readFileSync('src-tauri/tauri.conf.json', 'utf8'));
        conf.app.windows[0].title = 'ProtoSigner';
        conf.app.windows[0].width = 1440;
        conf.app.windows[0].height = 900;
        conf.app.windows[0].minWidth = 800;
        conf.app.windows[0].minHeight = 600;
        conf.app.windows[0].center = true;
        conf.app.security.csp = \"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;\";
        fs.writeFileSync('src-tauri/tauri.conf.json', JSON.stringify(conf, null, 2));
    "
    echo "  [OK] Updated tauri.conf.json"
fi

# Install Tauri API
echo "  Installing @tauri-apps/api..."
npm install @tauri-apps/api@latest
echo "  [OK] @tauri-apps/api installed"

echo ""
echo "============================================================"
echo "  Tauri Configured"
echo "============================================================"
echo ""

# ============================================================
# SECTION 5: Build Desktop App
# ============================================================
echo "[5/6] Building desktop app..."
echo ""
echo "  Building for Linux..."
echo ""

npx tauri build

echo ""
echo "============================================================"
echo "  Build Complete!"
echo "============================================================"
echo ""

# ============================================================
# SECTION 6: Show Results
# ============================================================
echo "[6/6] Build Results..."
echo ""

if [ -d "src-tauri/target/release/bundle/deb" ]; then
    echo "  [DEB Package]"
    find src-tauri/target/release/bundle/deb -name "*.deb" 2>/dev/null | while read f; do
        echo "  - $f"
    done
fi

if [ -d "src-tauri/target/release/bundle/rpm" ]; then
    echo "  [RPM Package]"
    find src-tauri/target/release/bundle/rpm -name "*.rpm" 2>/dev/null | while read f; do
        echo "  - $f"
    done
fi

if [ -f "src-tauri/target/release/protosigner" ]; then
    echo "  [Standalone Binary]"
    echo "  - src-tauri/target/release/protosigner"
fi

echo ""
echo "============================================================"
echo "  ProtoSigner Desktop App Ready!"
echo "============================================================"
echo ""
echo "  To run in development mode:"
echo "  npm run tauri dev"
echo ""
echo "  To build again:"
echo "  npm run tauri build"
echo ""

read -p "Press Enter to continue..."
