
import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { upload } from './config/multerConfig';
import merchantRoutes from './api/merchantRoutes';
import loyaltyProgramRoutes from './api/loyaltyProgramRoutes';
import analyticsRoutes from './api/analyticsRoutes';
import customerRoutes from './api/customerRoutes';
import subscriptionRoutes from './api/subscriptionRoutes';

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
app.use('/api/subscriptions', subscriptionRoutes);

export default app;
