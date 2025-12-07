require("dotenv").config();
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const { initializeDatabase, closeDatabase } = require("./database/db");
const { setupIpcHandlers } = require("./ipc/handlers");
const logger = require("./logger");

const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;
let mainWindow = null;
let nextServerProcess = null;

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

function startNextServer() {
  if (isDev) {
    logger.info("Development mode: Skipping Next.js server startup");
    return Promise.resolve();
  }

  logger.info("Starting Next.js server in production mode");

  return new Promise((resolve, reject) => {
    let nextPath;
    
    if (app.isPackaged) {
      // In packaged app, server.js is directly in resources/app/
      nextPath = path.join(process.resourcesPath, "app");
      logger.info("Packaged app: Next.js path", { nextPath });
    } else {
      // In development, use the standalone build path
      // Note: This path includes the full absolute path from Next.js standalone build
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
      
      reject(error);
      return;
    }

    logger.info("Next.js server file found, spawning process");

    const serverProcess = spawn("node", [serverFile], {
      cwd: nextPath,
      env: {
        ...process.env,
        PORT: "3000",
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
      
      reject(error);
    });

    serverProcess.on("exit", (code, signal) => {
      logger.warn("Next.js server process exited", { code, signal });
      if (code !== 0 && code !== null) {
        logger.error(`Next.js server exited with non-zero code: ${code}`);
      }
    });

    setTimeout(() => {
      logger.info("Next.js server startup timeout completed, assuming ready");
      resolve();
    }, 5000);
  });
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

  const url = isDev ? "http://localhost:3000" : "http://localhost:3000";
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

app.whenReady().then(async () => {
  logger.info("Electron app ready event fired");
  
  try {
    logger.info("Initializing database");
    await initializeDatabase();
    logger.info("Database initialized successfully");
    
    logger.info("Setting up IPC handlers");
    setupIpcHandlers(ipcMain);
    logger.info("IPC handlers setup complete");
    
    if (!isDev) {
      logger.info("Starting Next.js server");
      await startNextServer();
      logger.info("Next.js server started successfully");
    }
    
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
