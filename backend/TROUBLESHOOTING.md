# Database Connection Troubleshooting

## Error: P1001 Can't reach database server

This error occurs when Prisma cannot connect to your PostgreSQL database.

### For Aiven PostgreSQL (Most Common)

Aiven databases **require SSL**. Your connection string must include SSL parameters.

#### 1. Fix Your Connection String

Update your `backend/.env` file:

```bash
DATABASE_URL="postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
```

**Important**: Replace `USERNAME`, `PASSWORD`, `HOST`, `PORT`, and `DATABASE` with your actual values.

Example:
```bash
DATABASE_URL="postgresql://avnadmin:your_password@pg-20f5e27-harshjajal786-46c0.h.aivencloud.com:10724/defaultdb?sslmode=require"
```

#### 2. Get Correct Connection String from Aiven

1. Go to [Aiven Dashboard](https://console.aiven.io)
2. Select your PostgreSQL service
3. Go to **Overview** → **Connection information**
4. Copy the **Connection string** (it already includes SSL parameters)
5. Paste it into your `backend/.env` file as `DATABASE_URL`

#### 3. Check IP Whitelist

Aiven blocks connections from non-whitelisted IPs by default.

1. Go to Aiven Dashboard → Your Service
2. Navigate to **Settings** → **IP whitelist**
3. Add your current public IP address
4. Or use `0.0.0.0/0` for development (not recommended for production)

#### 4. Verify Database is Running

1. Check Aiven Dashboard → Your Service status
2. Ensure it's not paused or stopped
3. If paused, click **Start** to resume

#### 5. Test Connection

Run the connection test:

```bash
cd backend
npm install  # Install pg if not already installed
npm run db:test
```

This will tell you exactly what's wrong with your connection.

### Common Issues

| Issue | Solution |
|------|----------|
| Missing SSL | Add `?sslmode=require` to connection string |
| IP not whitelisted | Add your IP in Aiven dashboard |
| Wrong credentials | Double-check username/password in Aiven |
| Database paused | Start the service in Aiven dashboard |
| Firewall blocking | Check if port 10724 is accessible |

### Connection String Formats

**With SSL (Required for Aiven):**
```
postgresql://user:pass@host:port/db?sslmode=require
```

**Alternative SSL format:**
```
postgresql://user:pass@host:port/db?sslmode=require&sslcert=&sslkey=&sslrootcert=
```

### Still Not Working?

1. Check if you can reach the host:
   ```bash
   ping pg-20f5e27-harshjajal786-46c0.h.aivencloud.com
   ```

2. Test port accessibility (Windows):
   ```powershell
   Test-NetConnection -ComputerName pg-20f5e27-harshjajal786-46c0.h.aivencloud.com -Port 10724
   ```

3. Verify connection string format - it should NOT have spaces or line breaks
4. Make sure `.env` file is in `backend/` directory (not root)
5. Restart your terminal after editing `.env` file
