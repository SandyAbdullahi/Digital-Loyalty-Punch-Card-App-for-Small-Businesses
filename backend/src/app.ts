
import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import merchantRoutes from './api/merchantRoutes';

dotenv.config();

const app: Express = express();

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.use('/api/merchants', merchantRoutes);

export default app;
