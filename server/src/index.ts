import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import routes from './routes';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Basic health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Mount all routes
app.use('/api', routes);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  if (err.response) {
    console.error('Axios Error Data:', err.response.data);
  }
  res.status(500).json({
    error: err.message || 'Internal Server Error',
    details: err.response?.data || undefined
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
