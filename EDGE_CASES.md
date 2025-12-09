# Invoice Generator - Potential Edge Cases & User-End Issues

## 1. **Node.js Spawn Error (FIXED)**
### Issue
`Error: spawn node ENOENT` - Application fails to start Next.js server on systems without Node.js installed.

### Root Cause
The application was using `spawn("node", ...)` which looks for Node.js in system PATH. Packaged Electron apps don't have access to system Node.js.

### Solution Implemented
Changed to `spawn(process.execPath, ...)` to use Electron's bundled Node.js runtime.

### Impact
✅ Application now works on any Windows machine without requiring Node.js installation.

---

## 2. **Database Location & Persistence**
### Potential Issue
Database location changes between development and production modes.

### Current Behavior
- **Development**: Database stored in `electron-app/invoicegen.db`
- **Production**: Database stored in `%APPDATA%\invoice-generator\database\invoicegen.db`

### Edge Cases
1. **First-time users**: Fresh database created automatically
2. **Upgrading users**: Legacy migration from old location to new userData folder
3. **Multiple installations**: Each user profile has separate database
4. **Uninstall**: Database persists after uninstall (by design - `deleteAppDataOnUninstall: false`)

### Recommendations
- Database backups are created automatically before migrations
- Users should be informed about database location for manual backups
- Consider adding export/import functionality for data portability

---

## 3. **Log File Management**
### Current Behavior
Logs stored in:
- **Development**: `logs/app-YYYY-MM-DD.log`
- **Production**: `%USERPROFILE%\InvoiceGenerator\logs\app-YYYY-MM-DD.log`

### Edge Cases
1. **Log file growth**: Daily log files created, but no automatic cleanup
2. **Disk space**: Over time, logs can accumulate
3. **Permissions**: If user profile has restricted permissions, logging may fail silently

### Recommendations
- Implement log rotation (keep last 30 days)
- Add log file size limits
- Provide UI to view/clear logs

---

## 4. **Next.js Server Startup**
### Potential Issues
1. **Port 3000 already in use**: If another application uses port 3000, server won't start
2. **Timeout assumption**: 5-second timeout assumes server starts successfully
3. **Silent failures**: If server crashes after timeout, window loads but shows connection error

### Edge Cases
```javascript
// Current timeout logic (line 109-112 in main.js)
setTimeout(() => {
  logger.info("Next.js server startup timeout completed, assuming ready");
  resolve();
}, 5000);
```

### Recommendations
- Implement actual server health check instead of timeout
- Use dynamic port allocation if 3000 is unavailable
- Add retry logic with exponential backoff
- Show loading screen until server is confirmed ready

---

## 5. **File Paths in Packaged App**
### Current Behavior
```javascript
// Line 38-39 in main.js
nextPath = path.join(process.resourcesPath, "app");
```

### Edge Cases
1. **ASAR packaging**: Files inside `.asar` are read-only
2. **Path separators**: Windows vs Unix path handling
3. **Special characters**: Paths with spaces or special characters

### Status
✅ Currently handled correctly using `process.resourcesPath`

---

## 6. **Better-SQLite3 Native Module**
### Potential Issues
Native module must be rebuilt for Electron's Node.js version.

### Current Mitigation
```json
"postinstall": "electron-rebuild -f -w better-sqlite3"
```

### Edge Cases
1. **Build failures**: If electron-rebuild fails, database won't work
2. **Architecture mismatch**: x64 vs ARM builds
3. **Electron version upgrades**: Requires rebuild

### Recommendations
- Ensure `electron-rebuild` runs successfully during build
- Test on target architecture before distribution
- Include rebuild logs in error messages

---

## 7. **Window Loading Failures**
### Current Behavior
Window loads `http://localhost:3000` in both dev and production modes.

### Edge Cases
1. **Server not ready**: Window loads before server starts
2. **Network restrictions**: Localhost blocked by firewall/antivirus
3. **Multiple instances**: Second instance tries to use same port

### Recommendations
- Implement single-instance lock
- Add retry logic for window loading
- Show splash screen during initialization

---

## 8. **Database Migration Failures**
### Current Behavior
- Automatic backups before migrations
- Rollback on failure
- Migration versioning system

### Edge Cases
1. **Corrupted database**: Migration fails, rollback may also fail
2. **Partial migrations**: Power loss during migration
3. **Disk full**: Backup creation fails

### Current Mitigation
✅ Backup and rollback system implemented
✅ Transaction-based migrations

### Additional Recommendations
- Add database integrity check before migration
- Implement manual recovery mode
- Provide clear error messages with recovery steps

---

## 9. **Resource Packaging**
### Build Configuration Issues
```json
"extraResources": [
  {
    "from": "../my-app/.next/standalone/Documents/coding/invoice-generator/my-app",
    "to": "app"
  }
]
```

### Edge Cases
1. **Absolute paths in standalone build**: Path includes full system path
2. **Build on different machines**: Path structure may vary
3. **Missing files**: If Next.js build fails, resources missing

### Recommendations
- Validate build output before packaging
- Use relative paths consistently
- Add build verification step

---

## 10. **Graceful Shutdown**
### Current Behavior
```javascript
app.on("before-quit", () => {
  closeDatabase();
  if (nextServerProcess) {
    nextServerProcess.kill();
  }
});
```

### Edge Cases
1. **Force quit**: Process killed before cleanup
2. **Database locks**: WAL checkpoint may fail
3. **Orphaned processes**: Next.js server may not terminate

### Recommendations
- Add timeout for cleanup operations
- Force kill server process if graceful shutdown fails
- Implement process cleanup on startup (kill orphaned processes)

---

## 11. **Error Dialog Handling**
### Current Behavior
Error dialogs shown for critical failures.

### Edge Cases
1. **Multiple errors**: Cascading error dialogs
2. **User dismisses dialog**: App continues in broken state
3. **No user interaction**: Automated testing/CI environments

### Recommendations
- Consolidate error messages
- Force quit on critical errors
- Add headless mode for testing

---

## 12. **File System Permissions**
### Potential Issues
1. **Read-only installation**: Program Files directory
2. **User permissions**: Limited user accounts
3. **Antivirus interference**: Files blocked or quarantined

### Current Mitigation
✅ Database stored in userData (user-writable)
✅ Logs stored in user profile

### Edge Cases
- Corporate environments with restricted permissions
- Antivirus blocking SQLite operations
- Network drives or cloud-synced folders

---

## 13. **Electron Version Compatibility**
### Current Version
```json
"electron": "33.0.0"
```

### Edge Cases
1. **Breaking changes**: Future Electron updates
2. **Security patches**: Urgent updates needed
3. **Node.js version**: Bundled Node.js version changes

### Recommendations
- Pin Electron version in production
- Test thoroughly before upgrading
- Monitor Electron security advisories

---

## 14. **Development vs Production Differences**
### Key Differences
```javascript
const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;
```

### Edge Cases
1. **Environment variable conflicts**: NODE_ENV set incorrectly
2. **Packaged dev builds**: Testing packaged app
3. **Path resolution**: Different paths in dev vs prod

### Recommendations
- Always use `app.isPackaged` as source of truth
- Test packaged builds before release
- Document environment-specific behaviors

---

## 15. **Auto-Update Mechanism**
### Current Status
❌ Not implemented

### Recommendations for Future
- Implement auto-update using electron-updater
- Handle database migrations during updates
- Preserve user data across updates
- Rollback mechanism for failed updates

---

## Testing Checklist for User End

### Pre-Distribution Testing
- [ ] Test on clean Windows machine without Node.js
- [ ] Test with antivirus enabled
- [ ] Test with limited user permissions
- [ ] Test installation to different drives
- [ ] Test with port 3000 already in use
- [ ] Test database migration from previous version
- [ ] Test with corrupted database file
- [ ] Test graceful shutdown and restart
- [ ] Test multiple simultaneous launches
- [ ] Test uninstall and reinstall

### Performance Testing
- [ ] Measure startup time
- [ ] Monitor memory usage
- [ ] Check CPU usage during idle
- [ ] Test with large database (1000+ invoices)
- [ ] Verify log file sizes over time

### Error Recovery Testing
- [ ] Force quit during database operation
- [ ] Delete database file while running
- [ ] Corrupt database file
- [ ] Fill disk space during operation
- [ ] Network/firewall blocking localhost

---

## Monitoring & Diagnostics

### Log Locations
- **Development**: `<project-root>/logs/`
- **Production**: `%USERPROFILE%\InvoiceGenerator\logs\`

### Database Locations
- **Development**: `<project-root>/electron-app/invoicegen.db`
- **Production**: `%APPDATA%\invoice-generator\database\invoicegen.db`

### Backup Locations
- `<database-directory>/backups/`

### Useful Commands
```powershell
# View logs
node scripts/view-logs.js

# Monitor logs in real-time
node scripts/monitor-logs.js

# Check database location
# Logged in application startup
```

---

## Critical Fixes Applied

### ✅ Fixed: spawn node ENOENT
**File**: `electron-app/main.js` (Line 67)
**Change**: `spawn("node", ...)` → `spawn(process.execPath, ...)` with `ELECTRON_RUN_AS_NODE: "1"`
**Impact**: Application now works on systems without Node.js installed, properly running the script instead of a new app instance.

### ✅ Fixed: Next.js Server Startup (Health Check)
**File**: `electron-app/main.js`
**Change**: Implemented `waitForServer` polling instead of 5s timeout.
**Impact**: Application waits until server is actually ready.

### ✅ Fixed: Port 3000 Conflict
**File**: `electron-app/main.js`
**Change**: Implemented `findAvailablePort` to dynamically select an open port.
**Impact**: Application starts even if port 3000 is occupied.

### ✅ Fixed: Single Instance Lock
**File**: `electron-app/main.js`
**Change**: Added `app.requestSingleInstanceLock()`.
**Impact**: Prevents multiple instances from running simultaneously.

### ✅ Fixed: Log cleanup
**File**: `electron-app/logger.js`
**Change**: Added `cleanOldLogs` method.
**Impact**: Automatically deletes logs older than 30 days.

## Recommended Next Steps

1. **Verify Distribution Build**: Run a full build and test on a clean VM.
2. **Create user documentation** for common issues.
3. **Implement crash reporting** for production debugging.
4. **Add auto-update mechanism** for seamless updates.
5. **Add system requirements check** on first launch.
