require("dotenv").config();
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const { initializeDatabase, closeDatabase } = require("./database/db");
const { setupIpcHandlers } = require("./ipc/handlers");

const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;
let mainWindow = null;
let nextServerProcess = null;

function startNextServer() {
  if (isDev) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    let nextPath;
    
    if (app.isPackaged) {
      nextPath = path.join(process.resourcesPath, "app", ".next", "standalone", "my-app");
    } else {
      nextPath = path.join(__dirname, "..", "my-app", ".next", "standalone", "my-app");
    }
    
    const serverFile = path.join(nextPath, "server.js");

    if (!fs.existsSync(serverFile)) {
      reject(new Error(`Next.js server file not found at ${serverFile}`));
      return;
    }

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

    serverProcess.stdout.on("data", (data) => {
      console.log(`Next.js: ${data}`);
    });

    serverProcess.stderr.on("data", (data) => {
      console.error(`Next.js error: ${data}`);
    });

    serverProcess.on("error", (error) => {
      console.error("Failed to start Next.js server:", error);
      reject(error);
    });

    serverProcess.on("exit", (code) => {
      if (code !== 0 && code !== null) {
        console.error(`Next.js server exited with code ${code}`);
      }
    });

    setTimeout(() => {
      resolve();
    }, 5000);
  });
}

function createWindow() {
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
  mainWindow.loadURL(url);
}

app.whenReady().then(async () => {
  initializeDatabase();
  setupIpcHandlers(ipcMain);
  
  if (!isDev) {
    await startNextServer();
  }
  
  createWindow();
});

app.on("window-all-closed", () => {
  closeDatabase();
  if (nextServerProcess) {
    nextServerProcess.kill();
  }
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  closeDatabase();
  if (nextServerProcess) {
    nextServerProcess.kill();
  }
});
