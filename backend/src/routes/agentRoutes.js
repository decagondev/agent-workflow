import express from 'express';
import AgentController from '../controllers/agentController';
import AuthMiddleware from '../middleware/authMiddleware';
import ValidationMiddleware from '../middleware/validationMiddleware';

class AgentRoutes {
  constructor() {
    this.router = express.Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get(
      '/status', 
      AuthMiddleware.authenticateToken,
      AuthMiddleware.roleAuthorization(['ADMIN', 'PROJECT_MANAGER']),
      this.handleGetAgentStatus
    );

    this.router.get(
      '/performance', 
      AuthMiddleware.authenticateToken,
      AuthMiddleware.roleAuthorization(['ADMIN', 'PROJECT_MANAGER']),
      ValidationMiddleware.listQueryValidation(),
      ValidationMiddleware.validateRequest,
      this.handleGetAgentPerformance
    );

    this.router.post(
      '/interact', 
      AuthMiddleware.authenticateToken,
      AuthMiddleware.roleAuthorization(['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER']),
      ValidationMiddleware.agentInteractionValidation(),
      ValidationMiddleware.validateRequest,
      this.handleAgentInteraction
    );

    this.router.patch(
      '/config', 
      AuthMiddleware.authenticateToken,
      AuthMiddleware.roleAuthorization(['ADMIN']),
      this.handleUpdateAgentConfig
    );

    this.router.get(
      '/logs', 
      AuthMiddleware.authenticateToken,
      AuthMiddleware.roleAuthorization(['ADMIN', 'PROJECT_MANAGER']),
      ValidationMiddleware.listQueryValidation(),
      ValidationMiddleware.validateRequest,
      this.handleGetAgentLogs
    );
  }

  async handleGetAgentStatus(req, res) {
    try {
      const agentStatus = await AgentController.getAgentStatus();
      res.json(agentStatus);
    } catch (error) {
      res.status(error.status || 500).json({ 
        error: error.message,
        code: error.code || 'AGENT_STATUS_ERROR'
      });
    }
  }

  async handleGetAgentPerformance(req, res) {
    try {
      const { page, limit, sortBy, order } = req.query;
      const performanceMetrics = await AgentController.getAgentPerformance({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        sortBy: sortBy || 'timestamp',
        order: order || 'desc'
      });
      res.json(performanceMetrics);
    } catch (error) {
      res.status(error.status || 500).json({ 
        error: error.message,
        code: error.code || 'AGENT_PERFORMANCE_ERROR'
      });
    }
  }

  async handleAgentInteraction(req, res) {
    try {
      const { taskId, agentType, payload } = req.body;
      const interactionResult = await AgentController.interactWithAgent(
        taskId, 
        agentType, 
        payload,
        req.user
      );
      res.json(interactionResult);
    } catch (error) {
      res.status(error.status || 500).json({ 
        error: error.message,
        code: error.code || 'AGENT_INTERACTION_ERROR'
      });
    }
  }

  async handleUpdateAgentConfig(req, res) {
    try {
      const updatedConfig = await AgentController.updateAgentConfiguration(
        req.body,
        req.user
      );
      res.json(updatedConfig);
    } catch (error) {
      res.status(error.status || 500).json({ 
        error: error.message,
        code: error.code || 'AGENT_CONFIG_UPDATE_ERROR'
      });
    }
  }

  async handleGetAgentLogs(req, res) {
    try {
      const { page, limit, sortBy, order } = req.query;
      const agentLogs = await AgentController.getAgentLogs({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 50,
        sortBy: sortBy || 'timestamp',
        order: order || 'desc'
      });
      res.json(agentLogs);
    } catch (error) {
      res.status(error.status || 500).json({ 
        error: error.message,
        code: error.code || 'AGENT_LOGS_ERROR'
      });
    }
  }

  getRouter() {
    return this.router;
  }
}

export default new AgentRoutes().getRouter();
