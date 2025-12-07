# Invoice Generator - Desktop Application

A professional invoice generation desktop application built with Electron and Next.js.

## 🚀 Quick Start

### For Users (Non-Technical)

**Double-click to run:**
- `scripts\quick-start.bat` - Interactive menu for all operations
- `scripts\test-build.bat` - Test the built application
- `scripts\view-logs.bat` - View application logs
- `scripts\monitor-logs.bat` - Monitor logs in real-time
- `scripts\open-logs-folder.bat` - Open logs folder

### For Developers

```bash
# Install dependencies
yarn install

# Run in development mode
yarn dev

# Build for production
yarn build

# Create Windows installer
yarn dist:win

# View logs
yarn logs

# Monitor logs (live)
yarn logs:monitor
```

## 📁 Project Structure

```
invoice-generator/
├── electron-app/          # Electron main process
│   ├── main.js           # Application entry point (with logging)
│   ├── logger.js         # Logging system
│   ├── preload.js        # Preload script
│   ├── database/         # Database layer
│   └── ipc/              # IPC handlers
├── my-app/               # Next.js frontend
├── scripts/              # Build and utility scripts
│   ├── quick-start.bat   # Interactive menu
│   ├── test-build.bat    # Test built app
│   ├── view-logs.bat     # View logs
│   ├── monitor-logs.bat  # Live log monitor
│   └── ...
├── build/                # Build resources (icons)
├── dist/                 # Built application
└── logs/                 # Application logs (created at runtime)
```

## 🔍 Logging System

### Log Location
```
%USERPROFILE%\InvoiceGenerator\logs\app-YYYY-MM-DD.log
```

Example: `C:\Users\YourName\InvoiceGenerator\logs\app-2025-12-07.log`

### Viewing Logs

**Command Line:**
```bash
yarn logs              # View latest log
yarn logs:monitor      # Live monitoring
```

**Windows (Double-click):**
- `scripts\view-logs.bat` - View in terminal
- `scripts\monitor-logs.bat` - Live monitoring
- `scripts\open-logs-folder.bat` - Open in Explorer

### What Gets Logged
- ✅ Application startup/shutdown
- ✅ Next.js server status
- ✅ Database operations
- ✅ Window events
- ✅ Errors with stack traces
- ✅ System information
- ❌ No user data or sensitive information

See [LOGGING.md](LOGGING.md) for complete documentation.

## 🛠️ Building the Application

### Development Build
```bash
yarn dev
```

### Production Build
```bash
# Build Next.js app
yarn build

# Create Windows installer
yarn dist:win

# Or build for all platforms
yarn dist
```

### Build Output
- `dist/win-unpacked/` - Unpacked application (for testing)
- `dist/Invoice Generator Setup 1.0.0.exe` - Windows installer

## 🧪 Testing

### Test Unpacked Build
```bash
# Method 1: Use test script
scripts\test-build.bat

# Method 2: Manual
cd dist/win-unpacked
.\Invoice Generator.exe

# Method 3: With log monitoring
yarn logs:monitor
# Then run the app in another terminal
```

### Test Installed Version
1. Run `dist\Invoice Generator Setup 1.0.0.exe`
2. Install the application
3. Start log monitoring: `yarn logs:monitor`
4. Run the installed app from Desktop/Start Menu
5. Monitor logs for any issues

## 🐛 Troubleshooting

### Application Won't Start

1. **Check logs:**
   ```bash
   yarn logs
   ```

2. **Common issues:**
   - "Next.js server file not found" → Rebuild: `yarn build && yarn dist:win`
   - "Port 3000 already in use" → Close other instances
   - "Database error" → Check file permissions

3. **Live debugging:**
   ```bash
   yarn logs:monitor
   # Then run the app
   ```

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for comprehensive solutions.

### Clean Rebuild

```bash
# Delete build artifacts
rm -rf dist
rm -rf my-app/.next

# Rebuild
yarn build
yarn dist:win
```

Or use the interactive menu:
```bash
scripts\quick-start.bat
# Choose option 7: Clean rebuild
```

## 📦 Distribution

### Windows Installer Features
- ✅ Custom installation directory
- ✅ Desktop shortcut
- ✅ Start Menu shortcut
- ✅ Automatic launch after install
- ✅ Proper uninstaller
- ✅ User-level install (no admin required)

### Installer Configuration
See `electron-app/package.json` → `build.nsis` section

## 🔧 Configuration

### Next.js Configuration
- **File:** `my-app/next.config.ts`
- **Output:** Standalone (required for Electron)

### Electron Builder Configuration
- **File:** `electron-app/package.json`
- **Section:** `build`

### Environment Variables
- **File:** `electron-app/.env`
- **Variables:**
  - `DATABASE_URL` - Database file path (optional)
  - `NODE_ENV` - Environment (development/production)

## 📚 Documentation

- [LOGGING.md](LOGGING.md) - Complete logging system documentation
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Comprehensive troubleshooting guide
- [BUILD_SUMMARY.md](BUILD_SUMMARY.md) - Recent changes and improvements

## 🎯 Features

### Application Features
- Invoice generation
- Client management
- Company management
- Item/product catalog
- Purchase entry
- Quotation management
- Dealer payments
- Recycle bin
- PDF generation

### Technical Features
- ✅ Electron + Next.js architecture
- ✅ SQLite database with better-sqlite3
- ✅ Comprehensive logging system
- ✅ Error handling with user-friendly dialogs
- ✅ Standalone Next.js build
- ✅ Native module support
- ✅ IPC communication
- ✅ Auto-updates ready (future)

## 🔐 Privacy & Security

### Logs
- ✅ Application events and errors
- ✅ System information
- ✅ File paths
- ❌ **NO** user data
- ❌ **NO** invoice content
- ❌ **NO** passwords

### Database
- Stored locally on user's machine
- No cloud synchronization
- Full user control

## 📞 Support

When reporting issues, include:
1. Log file from `%USERPROFILE%\InvoiceGenerator\logs\`
2. Steps to reproduce
3. Expected vs actual behavior
4. System information:
   - Windows version
   - Node.js version: `node --version`
   - Yarn version: `yarn --version`

## 🛣️ Roadmap

- [ ] Auto-updates
- [ ] Cloud backup (optional)
- [ ] Multi-language support
- [ ] Custom themes
- [ ] Export to Excel
- [ ] Email integration
- [ ] Recurring invoices

## 📄 License

MIT

## 👨‍💻 Development

### Prerequisites
- Node.js 18+ 
- Yarn package manager
- Windows (for building Windows installer)

### Setup
```bash
# Clone repository
git clone <repository-url>

# Install dependencies
yarn install

# Run in development
yarn dev
```

### Database
- **Engine:** SQLite with better-sqlite3
- **Location:** `electron-app/invoicegen.db`
- **Schema:** Managed by Drizzle ORM

### Tech Stack
- **Frontend:** Next.js 15, React 19, TypeScript
- **Desktop:** Electron 33
- **Database:** SQLite (better-sqlite3)
- **ORM:** Drizzle ORM
- **Styling:** CSS Modules
- **Build:** electron-builder

---

**Built with ❤️ using Electron and Next.js**
