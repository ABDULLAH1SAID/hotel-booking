import express, { Request, Response, NextFunction } from 'express';
import connectDB from './DB/connect'
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import authRouter from "./modules/auth/auth.route";
import userRourter from "./modules/user/user.route"
import roomRouter from "./modules/room/room.route";
import BookingRouter from "./modules/Booking/Booking.route"
import webhookRouter from "./modules/webhook/webhook.route";

dotenv.config()
const port = process.env.PORT ? Number(process.env.PORT) : 5000;
const app = express();

connectDB()

app.use('/webhook', webhookRouter)

app.use(express.json())
app.use(cors());
app.use(helmet());
app.use(hpp());
app.use(morgan("dev"));


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, 
});
app.use(limiter);


// Global middleware: logs request method and URL
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'Hotel Booking API is working!',
    env: process.env.NODE_ENV,
    port: port
  });
});

app.get('/success', (req:Request, res:Response) => {
  res.send(' الدفع تم بنجاح! شكراً ليك.');
});

app.get('/cancel', (req:Request, res:Response) => {
  res.send(' تم إلغاء العملية. حاول مرة أخرى.');
});

app.use('/auth', authRouter)
app.use('/user', userRourter)
app.use('/room', roomRouter)
app.use('/Booking', BookingRouter)

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = error.statusCode || 500;
  console.log(statusCode)
  res.status(statusCode).json({
    success: false,
    message: error.message,
    stack: error.stack,
  });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;