import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import config from './configs';
import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import router from './app.route';
import { ErrorResponse, NotFoundError } from './responseHandler/error.response';

const app = express();

//* Init middlewares
// Logger request HTTP method
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
    exposedHeaders: ['set-cookie'],
  })
);

if (config.env === 'dev') {
  app.use(morgan('dev'));
}

// Parse req.body
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(compression());

//* Init db
import './db';

//* Init routes
app.use('/v1/api', router);

//* Handling error

app.all('*', (req, res, next) => {
  next(new NotFoundError(`Can't find ${req.originalUrl} on this server`));
});

app.use((err: ErrorResponse, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    status: 'error',
    statusCode,
    // stack: err.stack,
    message: err.message || 'Internal Server Error',
  });
});
export default app;