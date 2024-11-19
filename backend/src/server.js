const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');

const taskRoutes = require('./routes/taskRoutes');
const agentRoutes = require('./routes/agentRoutes');
const userRoutes = require('./routes/userRoutes');

const errorHandler = require('./middleware/errorHandler');
const authMiddleware = require('./middleware/authMiddleware');

class Server {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 5000;
        this.initializeMiddleware();
        this.connectDatabase();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }

    initializeMiddleware() {
        this.app.use(helmet());

        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000,
            max: 100
        });
        this.app.use(limiter);

        this.app.use(compression());

        this.app.use(cors({
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            credentials: true
        }));

        this.app.use(express.json({ limit: '50mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));
    }

    async connectDatabase() {
        try {
            await mongoose.connect(process.env.MONGODB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            console.log('MongoDB connected successfully');
        } catch (error) {
            console.error('MongoDB connection error:', error);
            process.exit(1);
        }
    }

    initializeRoutes() {
        this.app.get('/health', (req, res) => {
            res.status(200).json({
                status: 'healthy',
                timestamp: new Date().toISOString()
            });
        });

        this.app.use('/api/tasks', authMiddleware, taskRoutes);
        this.app.use('/api/agents', authMiddleware, agentRoutes);
        this.app.use('/api/users', userRoutes);
    }

    initializeErrorHandling() {
        this.app.use((req, res, next) => {
            res.status(404).json({
                error: 'Not Found',
                path: req.path
            });
        });

        this.app.use(errorHandler);
    }

    start() {
        const server = this.app.listen(this.port, () => {
            console.log(`Server running on port ${this.port}`);
        });

        process.on('SIGTERM', () => {
            console.log('SIGTERM signal received. Closing HTTP server.');
            server.close(() => {
                console.log('HTTP server closed.');
                mongoose.connection.close(false, () => {
                    console.log('MongoDB connection closed.');
                    process.exit(0);
                });
            });
        });

        return server;
    }
}

module.exports = new Server();
