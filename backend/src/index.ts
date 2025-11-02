import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './shared/config/config.js';
import { errorHandler } from './shared/middleware/error-handler.js';
import { authRouter } from './modules/auth/auth.router.js';
import { companyRouter } from './modules/company/company.router.js';
import { clientRouter } from './modules/client/client.router.js';
import { itemRouter } from './modules/item/item.router.js';
import { invoiceRouter } from './modules/invoice/invoice.router.js';

const app = express();

app.use(helmet());
app.use(cors({
  origin: config.frontendUrl,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

app.use('/api/auth', authRouter);
app.use('/api/companies', companyRouter);
app.use('/api/clients', clientRouter);
app.use('/api/items', itemRouter);
app.use('/api/invoices', invoiceRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

const PORT = config.port || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
