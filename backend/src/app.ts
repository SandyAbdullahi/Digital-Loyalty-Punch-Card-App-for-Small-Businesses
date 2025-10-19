
import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import merchantRoutes from './api/merchantRoutes';
import loyaltyProgramRoutes from './api/loyaltyProgramRoutes';
import analyticsRoutes from './api/analyticsRoutes';
import customerRoutes from './api/customerRoutes';

dotenv.config();

const app: Express = express();

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.use('/api/merchants', merchantRoutes);
app.use('/api/loyalty-programs', loyaltyProgramRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/customers', customerRoutes);

export default app;
