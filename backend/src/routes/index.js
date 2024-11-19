import express from 'express';
import taskRoutes from './taskRoutes';
import agentRoutes from './agentRoutes';
// import authRoutes from './authRoutes';

const router = express.Router();

router.use('/tasks', taskRoutes);
router.use('/agents', agentRoutes);
// router.use('/auth', authRoutes);

router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

router.use((req, res, next) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    method: req.method
  });
});

router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

export default router;
