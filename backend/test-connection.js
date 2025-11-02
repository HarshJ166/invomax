// Quick connection test script
import pg from "pg";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, ".env") });

const { Client } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL not found in environment variables");
  console.error("Make sure you have a .env file with DATABASE_URL set");
  process.exit(1);
}

console.log("Testing connection...");
const maskedUrl = connectionString.replace(/:[^:@]+@/, ":***@");
console.log("Connection string (masked):", maskedUrl);

// Parse connection string to check for SSL
const hasSSL =
  connectionString.includes("sslmode") || connectionString.includes("ssl=");
if (!hasSSL) {
  console.warn(
    "⚠️  WARNING: Connection string does not include SSL parameters"
  );
  console.warn(
    "Aiven requires SSL. Add ?sslmode=require to your connection string"
  );
}

// Parse connection string to extract parts
const url = new URL(connectionString.replace(/^postgres:/, "postgresql:"));
const sslConfig = {
  rejectUnauthorized: false,
  sslmode: "require",
};

const client = new Client({
  host: url.hostname,
  port: parseInt(url.port, 10),
  database: url.pathname.slice(1), // Remove leading '/'
  user: url.username,
  password: url.password,
  ssl: sslConfig,
});

console.log("\nAttempting to connect...\n");

client
  .connect()
  .then(() => {
    console.log("✅ Connection successful!");
    return client.query("SELECT NOW(), version()");
  })
  .then((result) => {
    console.log("📅 Database time:", result.rows[0].now);
    console.log(
      "🗄️  PostgreSQL version:",
      result.rows[0].version.split(",")[0]
    );
    console.log("\n✅ Your database connection is working!");
    client.end();
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Connection failed!\n");
    console.error("Error:", err.message);
    console.error("\n🔧 Troubleshooting steps:");
    console.error("1. Add SSL parameter to your connection string:");
    console.error(
      '   DATABASE_URL="postgresql://user:pass@host:port/db?sslmode=require"'
    );
    console.error(
      "2. Check Aiven Dashboard → Your Service → Connection information:"
    );
    console.error("   - Verify your IP is whitelisted");
    console.error("   - Copy the exact connection string from Aiven");
    console.error("3. Ensure database service is running (not paused)");
    console.error("4. Check network/firewall is not blocking port 10724");
    console.error("\n💡 Your connection string should look like:");
    console.error(
      "   postgresql://username:password@host:port/database?sslmode=require"
    );
    client.end();
    process.exit(1);
  });
