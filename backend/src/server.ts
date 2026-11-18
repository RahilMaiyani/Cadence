import express from 'express';
import { connectDB } from './config/db';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from './routes/authRoutes';

const app = express();
const PORT = process.env.PORT || 5000;

dotenv.config();

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Cadence API is operational',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

app.use("/api/v1/auth/", authRouter);

const startServer = async () => {
    await connectDB();

    const server = app.listen(PORT, () => {
        console.log(`Cadence server is running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
    });

    const shutdown = async () => {
        console.log("\n Shutting down gracefully...");
        server.close(async () => {
            console.log("HTTP server closed.");
            process.exit(1);
        });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
};

startServer();