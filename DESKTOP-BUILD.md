# ProtoSigner Desktop App - Tauri Setup

This folder contains scripts to convert the ProtoSigner web application into installable desktop apps for Windows, macOS, and Linux using [Tauri](https://tauri.app/) (Rust-based desktop framework).

## Prerequisites

Before running any script, ensure you have installed:

1. **Node.js** (v18+) - https://nodejs.org
2. **Rust** - https://rustup.rs

## Quick Start

### Windows

Simply double-click or run in Command Prompt:
```cmd
setup-tauri.bat
```

### macOS

```bash
chmod +x setup-tauri-mac.sh
./setup-tauri-mac.sh
```

### Linux

```bash
chmod +x setup-tauri-linux.sh
./setup-tauri-linux.sh
```

## What Each Script Does

1. **Checks prerequisites** (Node.js, npm, Rust, Cargo)
2. **Installs Tauri CLI** (@tauri-apps/cli)
3. **Initializes Tauri** in the project (creates src-tauri folder)
4. **Configures** tauri.conf.json with app settings
5. **Installs** @tauri-apps/api package
6. **Builds** the desktop application

## Output Files

After building, you'll find:

### Windows
- `src-tauri/target/release/bundle/msi/` - MSI installer
- `src-tauri/target/release/bundle/nsis/` - NSIS installer (.exe)
- `src-tauri/target/release/ProtoSigner.exe` - Standalone executable

### macOS
- `src-tauri/target/release/bundle/app/` - .app bundle
- `src-tauri/target/release/bundle/dmg/` - .dmg installer

### Linux
- `src-tauri/target/release/bundle/deb/` - .deb package
- `src-tauri/target/release/bundle/rpm/` - .rpm package
- `src-tauri/target/release/protosigner` - Standalone binary

## Development Commands

After setup, you can use:

```bash
# Run in development mode (with hot reload)
npm run tauri dev

# Build for production
npm run tauri build

# Open Tauri devtools (for debugging)
npm run tauri dev -- --debug
```

## Cross-Compilation

To build for other platforms:

### From Windows to macOS/Linux
- Install target: `rustup target add x86_64-apple-darwin aarch64-apple-darwin x86_64-unknown-linux-gnu`
- Use CI tools or GitHub Actions

### From macOS to Windows/Linux
- Install Rust targets via rustup

For cross-compilation, it's recommended to use GitHub Actions or CI/CD pipelines.

## Configuration

Edit `src-tauri/tauri.conf.json` to customize:
- App name and version
- Window size and behavior
- App icon
- Build targets (MSI, NSIS, DMG, AppImage, etc.)

## Troubleshooting

### "WebView2 not found" (Windows)
Download and install WebView2 from: https://developer.microsoft.com/en-us/microsoft-edge/webview2/

### "webkit2gtk not found" (Linux)
Run the Linux setup script again - it will install dependencies automatically.

### Build fails with Rust errors
Try:
```bash
rustup update
cargo clean
npm run tauri build
```

## Notes

- First build may take 10-30 minutes (compiling Rust dependencies)
- Subsequent builds are much faster
- The app runs entirely locally - no server needed
- All your ProtoSigner features work in the desktop app!
