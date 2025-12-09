require("dotenv").config();
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const net = require("net");
const http = require("http");
const { initializeDatabase, closeDatabase } = require("./database/db");
const { setupIpcHandlers } = require("./ipc/handlers");
const logger = require("./logger");

const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;
let mainWindow = null;
let nextServerProcess = null;
let serverPort = 3000; // Default, will be updated dynamically

logger.separator();
logger.info("Application Starting", {
  isDev,
  isPackaged: app.isPackaged,
  platform: process.platform,
  arch: process.arch,
  electronVersion: process.versions.electron,
  nodeVersion: process.versions.node,
  appPath: app.getAppPath(),
  resourcesPath: process.resourcesPath,
});

// --- Helper Functions ---

function findAvailablePort(startPort) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        resolve(findAvailablePort(startPort + 1));
      } else {
        logger.error("Error finding port", err);
        reject(err);
      }
    });
    server.listen(startPort, () => {
      const { port } = server.address();
      server.close(() => {
        resolve(port);
      });
    });
  });
}

function waitForServer(port) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const timeout = 30000; // 30 seconds timeout
    
    logger.info(`Waiting for server to be ready on port ${port}...`);

    const check = () => {
      const req = http.get(`http://127.0.0.1:${port}`, (res) => {
        // We consider any response as "server is up"
        // Even 404 means the Next.js server is handling requests
        // But ideally we want 200
        logger.info(`Server responded with status: ${res.statusCode}`);
        resolve();
      });

      req.on("error", (err) => {
        if (Date.now() - startTime > timeout) {
          reject(new Error(`Server startup timed out after ${timeout}ms`));
        } else {
          // Retry after 500ms
          setTimeout(check, 500);
        }
      });
      
      req.end();
    };
    
    check();
  });
}

async function startNextServer() {
  if (isDev) {
    logger.info("Development mode: Skipping Next.js server startup");
    // In dev, we assume port 3000 is running
    serverPort = 3000;
    return Promise.resolve();
  }

  logger.info("Starting Next.js server in production mode");
  
  // Find an available port first
  try {
    serverPort = await findAvailablePort(3000);
    logger.info(`Found available port: ${serverPort}`);
  } catch (error) {
    logger.error("Failed to find available port", error);
    throw error;
  }

  let nextPath;
  
  if (app.isPackaged) {
    // In packaged app, server.js is directly in resources/app/
    nextPath = path.join(process.resourcesPath, "app");
    logger.info("Packaged app: Next.js path", { nextPath });
  } else {
    // In development logic path (fallback)
    const standalonePath = path.join(__dirname, "..", "my-app", ".next", "standalone");
    nextPath = path.join(standalonePath, "Documents", "coding", "invoice-generator", "my-app");
    logger.info("Unpackaged app: Next.js path", { nextPath });
  }
  
  const serverFile = path.join(nextPath, "server.js");
  logger.info("Looking for Next.js server file", { serverFile });

  if (!fs.existsSync(serverFile)) {
    const error = new Error(`Next.js server file not found at ${serverFile}`);
    logger.error("Next.js server file not found", error);
    
    dialog.showErrorBox(
      "Application Error",
      `Failed to start the application.\n\nNext.js server file not found at:\n${serverFile}\n\nPlease reinstall the application.`
    );
    throw error;
  }

  logger.info("Next.js server file found, spawning process");

  // Use Electron's bundled Node.js instead of system node
  // This prevents "spawn node ENOENT" errors on systems without Node.js installed
  const nodeExecutable = process.execPath;
  logger.info("Using Node.js executable", { nodeExecutable });

  const serverProcess = spawn(nodeExecutable, [serverFile], {
    cwd: nextPath,
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1",
      PORT: serverPort.toString(), // Connect to dynamic port
      NODE_ENV: "production",
      HOSTNAME: "127.0.0.1",
    },
    stdio: "pipe",
  });

  nextServerProcess = serverProcess;
  logger.info("Next.js server process spawned", { pid: serverProcess.pid });

  serverProcess.stdout.on("data", (data) => {
    const message = data.toString().trim();
    logger.info(`Next.js stdout: ${message}`);
  });

  serverProcess.stderr.on("data", (data) => {
    const message = data.toString().trim();
    logger.warn(`Next.js stderr: ${message}`);
  });

  serverProcess.on("error", (error) => {
    logger.error("Failed to start Next.js server", error);
    dialog.showErrorBox(
      "Server Error",
      `Failed to start the Next.js server.\n\nError: ${error.message}\n\nCheck the logs for more details.`
    );
  });

  serverProcess.on("exit", (code, signal) => {
    logger.warn("Next.js server process exited", { code, signal });
    if (code !== 0 && code !== null) {
      logger.error(`Next.js server exited with non-zero code: ${code}`);
    }
  });

  // Wait for server to be ready with health check
  await waitForServer(serverPort);
  logger.info("Next.js server is ready and responding");
}

function createWindow() {
  logger.info("Creating main window");
  
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  const url = isDev ? `http://localhost:3000` : `http://localhost:${serverPort}`;
  logger.info("Loading URL in window", { url });
  
  mainWindow.loadURL(url);

  mainWindow.webContents.on("did-fail-load", (event, errorCode, errorDescription) => {
    logger.error("Window failed to load", { errorCode, errorDescription });
  });

  mainWindow.webContents.on("did-finish-load", () => {
    logger.info("Window finished loading successfully");
  });

  mainWindow.on("closed", () => {
    logger.info("Main window closed");
    mainWindow = null;
  });
}

// Single Instance Lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  logger.warn("Another instance is already running. Quitting.");
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    logger.info("Second instance attempted to launch");
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(async () => {
    logger.info("Electron app ready event fired");
    
    try {
      logger.info("Initializing database");
      await initializeDatabase();
      logger.info("Database initialized successfully");
      
      logger.info("Setting up IPC handlers");
      setupIpcHandlers(ipcMain);
      logger.info("IPC handlers setup complete");
      
      // We always attempt to start the server unless in Dev mode we want to skip it
      // The startNextServer function now handles the port finding and health check
      logger.info("Starting Next.js server");
      await startNextServer();
      logger.info("Next.js server started successfully");
      
      logger.info("Creating application window");
      createWindow();
      logger.info("Application startup complete");
      
    } catch (error) {
      logger.error("Failed to start application", error);
      
      dialog.showErrorBox(
        "Startup Error",
        `The application failed to start.\n\nError: ${error.message}\n\nLog file: ${logger.getLogFilePath()}`
      );
      
      app.quit();
    }
  });
}

app.on("window-all-closed", () => {
  logger.info("All windows closed");
  
  logger.info("Closing database");
  closeDatabase();
  
  if (nextServerProcess) {
    logger.info("Killing Next.js server process");
    nextServerProcess.kill();
  }
  
  if (process.platform !== "darwin") {
    logger.info("Quitting application");
    app.quit();
  }
});

app.on("before-quit", () => {
  logger.info("Application before-quit event");
  
  closeDatabase();
  
  if (nextServerProcess) {
    nextServerProcess.kill();
  }
  
  logger.separator();
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception", error);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection", { reason, promise });
});
