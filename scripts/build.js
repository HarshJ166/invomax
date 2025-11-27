#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const myAppDir = path.join(rootDir, "my-app");

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
  }
}

console.log("Building Next.js application...");

try {
  process.chdir(myAppDir);
  execSync("yarn build", { stdio: "inherit" });
  console.log("Next.js build completed successfully.");
  
  const standaloneDir = path.join(myAppDir, ".next/standalone");
  const staticDir = path.join(myAppDir, ".next/static");
  const publicDir = path.join(myAppDir, "public");
  
  if (fs.existsSync(standaloneDir)) {
    const standalonePublicDir = path.join(standaloneDir, "my-app/public");
    const standaloneStaticDir = path.join(standaloneDir, "my-app/.next/static");
    
    if (fs.existsSync(publicDir)) {
      if (fs.existsSync(standalonePublicDir)) {
        fs.rmSync(standalonePublicDir, { recursive: true, force: true });
      }
      fs.mkdirSync(standalonePublicDir, { recursive: true });
      copyRecursiveSync(publicDir, standalonePublicDir);
      console.log("Copied public directory to standalone build.");
    }
    
    if (fs.existsSync(staticDir)) {
      if (fs.existsSync(standaloneStaticDir)) {
        fs.rmSync(standaloneStaticDir, { recursive: true, force: true });
      }
      fs.mkdirSync(standaloneStaticDir, { recursive: true });
      copyRecursiveSync(staticDir, standaloneStaticDir);
      console.log("Copied static directory to standalone build.");
    }
    
    console.log("Standalone build is ready for Electron packaging.");
  } else {
    console.warn("Warning: Standalone directory not found. Make sure Next.js config has 'output: standalone'.");
  }
} catch (error) {
  console.error("Failed to build Next.js application:", error.message);
  process.exit(1);
}

console.log("\nBuild process completed. Ready for Electron packaging.");
console.log("Run 'yarn dist' to create distributable packages.");

