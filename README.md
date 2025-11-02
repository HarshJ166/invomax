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

- React with TypeScript
- Vite
- React Query for server state
- Zustand for local state
- React Router for navigation

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm run install:all
```

3. Set up database:

```bash
cd backend
# Create .env file with your DATABASE_URL
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
npm run db:migrate
```

4. Start development servers:

Backend:

```bash
npm run dev:backend
```

Frontend (in a new terminal):

```bash
npm run dev:frontend
```

The application will be available at:

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

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
│   │   │   └── invoice/
│   │   └── shared/         # Shared utilities
│   │       ├── config/
│   │       ├── middleware/
│   │       └── tax-calculator/
│   └── prisma/             # Database schema
└── frontend/
    └── src/
        ├── api/            # API client
        ├── components/     # React components
        ├── pages/          # Page components
        └── store/          # Zustand stores
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

## Development Notes

- All API routes require authentication except `/api/auth/*`
- Tax calculation automatically handles CGST/SGST (intra-state) vs IGST (inter-state)
- Invoices are soft-deleted for audit trail
- Invoice numbers are auto-generated per company with configurable prefix

## License

MIT
