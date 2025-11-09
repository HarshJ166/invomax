# invoMax - SMB Invoice Management System

A comprehensive invoice management system designed for small and medium businesses with GST compliance features.

## Features

- User authentication and company onboarding
- Client and item master data management
- Invoice creation with automatic tax calculation (GST)
- PDF generation for invoices
- Invoice status tracking
- Responsive web interface

## Tech Stack

### Backend

- Node.js with Express
- TypeScript
- PostgreSQL with Prisma ORM
- JWT authentication
- @react-pdf/renderer for PDF generation

### Frontend

- Next.js 16 with React
- TypeScript
- Tailwind CSS
- Axios for API calls
- shadcn/ui components

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- pnpm (for frontend) or npm

### Installation

1. Clone the repository

2. Install backend dependencies:

```bash
cd backend
npm install
```

3. Set up backend environment:

```bash
# Create .env file with your DATABASE_URL
# Example:
# DATABASE_URL="postgresql://user:password@localhost:5432/invomax"
# PORT=8080
# JWT_SECRET="your-secret-key"
# FRONTEND_URL="http://localhost:3000"
```

4. Run database migrations:

```bash
npm run db:migrate
```

5. Install frontend dependencies:

```bash
cd ../frontend
pnpm install
# or npm install
```

6. Set up frontend environment (optional):

```bash
# Create .env.local file if needed
# NEXT_PUBLIC_API_URL="http://localhost:8080"
```

## Running the Application

### Start Backend Server

In the `backend` directory:

```bash
npm run dev
```

The backend API will be available at: `http://localhost:8080`

### Start Frontend Server

In a **separate terminal**, navigate to the `frontend` directory:

```bash
cd frontend
npm run dev
# or pnpm dev
```

The frontend application will be available at: `http://localhost:3000`

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── modules/        # Domain modules (DDD structure)
│   │   │   ├── auth/
│   │   │   ├── company/
│   │   │   ├── client/
│   │   │   ├── item/
│   │   │   ├── invoice/
│   │   │   └── settings/
│   │   └── shared/         # Shared utilities
│   │       ├── config/
│   │       ├── db/         # Prisma client singleton
│   │       ├── middleware/
│   │       └── tax-calculator/
│   └── prisma/             # Database schema and migrations
└── frontend/
    ├── app/                # Next.js app router pages
    ├── components/         # React components
    ├── lib/                # Utilities and API client
    └── hooks/              # Custom React hooks
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user and company
- `POST /api/auth/login` - User login

### Companies

- `GET /api/companies` - Get company details
- `PATCH /api/companies` - Update company details

### Clients

- `GET /api/clients` - List all clients
- `POST /api/clients` - Create new client
- `GET /api/clients/:id` - Get client details
- `PATCH /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Items

- `GET /api/items` - List all items
- `POST /api/items` - Create new item
- `GET /api/items/:id` - Get item details
- `PATCH /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### Invoices

- `GET /api/invoices` - List invoices (with pagination and filters)
- `POST /api/invoices` - Create new invoice
- `GET /api/invoices/:id` - Get invoice details
- `PATCH /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice
- `GET /api/invoices/:id/pdf` - Generate PDF

### Settings

- `GET /api/settings` - Get user and company settings
- `POST /api/settings/logo` - Upload company logo
- `DELETE /api/settings/logo` - Delete company logo

## Development Notes

- All API routes require authentication except `/api/auth/*`
- Tax calculation automatically handles CGST/SGST (intra-state) vs IGST (inter-state)
- Invoices are soft-deleted for audit trail
- Invoice numbers are auto-generated per company with configurable prefix
- Backend uses a singleton PrismaClient instance for connection pooling optimization
- Frontend connects to backend via `NEXT_PUBLIC_API_URL` environment variable (defaults to `http://localhost:8080`)

## License

MIT
