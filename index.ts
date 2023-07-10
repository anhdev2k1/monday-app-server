require('dotenv').config();
import express, { Request, Response, NextFunction } from 'express';
import { config } from './src/root/configs';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import passport from 'passport';
import router from './src/root/app.route';
import { applyPassportStrategy } from './src/02-authentication/middlewares/passport';
import { ErrorResponse, NotFoundError } from './src/root/responseHandler/error.response';
import morgan from 'morgan';
const PORT = config.app.port;

const app = express();
import './src/root/db';
app.use(cors());

if (config.env === 'dev') {
  app.use(morgan('dev'));
}
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

applyPassportStrategy(passport);

app.get('/', (req, res) => {
  res.send('Hello Văn Anh');
});


app.use('/v1/api', router);
app.use((err: ErrorResponse, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    status: 'error',
    statusCode,
    // stack: err.stack,
    message: err.message || 'Internal Server Error',
  });
});

app.all('*', (req, res, next) => {
  next(new NotFoundError(`Can't find ${req.originalUrl} on this server`));
});
app.listen(PORT, () => console.log(`Server is running on ${PORT}`));
