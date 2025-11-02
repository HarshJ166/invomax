// Script to fix connection string format for Prisma
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '.env') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL not found');
  process.exit(1);
}

// Convert postgres:// to postgresql:// for Prisma compatibility
let fixedUrl = connectionString;
if (fixedUrl.startsWith('postgres://')) {
  fixedUrl = fixedUrl.replace('postgres://', 'postgresql://');
}

// Ensure sslmode=require is present
if (!fixedUrl.includes('sslmode=')) {
  const separator = fixedUrl.includes('?') ? '&' : '?';
  fixedUrl = `${fixedUrl}${separator}sslmode=require`;
}

console.log('Original connection string (masked):', connectionString.replace(/:[^:@]+@/, ':***@'));
console.log('Fixed connection string (masked):', fixedUrl.replace(/:[^:@]+@/, ':***@'));

// Read .env file
const envPath = join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');

// Replace DATABASE_URL (without quotes - Prisma handles this)
const updatedContent = envContent.replace(
  /^DATABASE_URL=.*$/m,
  `DATABASE_URL=${fixedUrl}`
);

// Write back
fs.writeFileSync(envPath, updatedContent, 'utf-8');

console.log('\n✅ Updated .env file with corrected connection string');
console.log('\nYou can now run: npm run db:migrate');
