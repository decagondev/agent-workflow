import express from 'express';
import TaskController from '../controllers/taskController';
import AuthMiddleware from '../middleware/authMiddleware';
import ValidationMiddleware from '../middleware/validationMiddleware';

class TaskRoutes {
  constructor() {
    this.router = express.Router();
    this.initializeRoutes();
  }

  initializeRoutes() {

    this.router.post(
      '/create', 
      AuthMiddleware.authenticateToken,
      AuthMiddleware.roleAuthorization(['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER']),
      ValidationMiddleware.taskCreationValidation(),
      ValidationMiddleware.validateRequest,
      this.handleCreateTask
    );

    this.router.get(
      '/:id', 
      AuthMiddleware.authenticateToken,
      ValidationMiddleware.paramIdValidation(),
      ValidationMiddleware.validateRequest,
      this.handleGetTask
    );

    this.router.get(
      '/', 
      AuthMiddleware.authenticateToken,
      ValidationMiddleware.listQueryValidation(),
      ValidationMiddleware.validateRequest,
      this.handleListTasks
    );

    this.router.patch(
      '/:id', 
      AuthMiddleware.authenticateToken,
      AuthMiddleware.roleAuthorization(['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER']),
      ValidationMiddleware.paramIdValidation(),
      ValidationMiddleware.taskCreationValidation(),
      ValidationMiddleware.validateRequest,
      this.handleUpdateTask
    );

    this.router.delete(
      '/:id', 
      AuthMiddleware.authenticateToken,
      AuthMiddleware.roleAuthorization(['ADMIN', 'PROJECT_MANAGER']),
      ValidationMiddleware.paramIdValidation(),
      ValidationMiddleware.validateRequest,
      this.handleDeleteTask
    );

    this.router.post(
      '/:id/plan', 
      AuthMiddleware.authenticateToken,
      AuthMiddleware.roleAuthorization(['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER']),
      ValidationMiddleware.paramIdValidation(),
      ValidationMiddleware.validateRequest,
      this.handleTaskPlanning
    );

    this.router.post(
      '/:id/generate', 
      AuthMiddleware.authenticateToken,
      AuthMiddleware.roleAuthorization(['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER']),
      ValidationMiddleware.paramIdValidation(),
      ValidationMiddleware.codeGenerationValidation(),
      ValidationMiddleware.validateRequest,
      this.handleCodeGeneration
    );

    this.router.post(
      '/:id/review', 
      AuthMiddleware.authenticateToken,
      AuthMiddleware.roleAuthorization(['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER']),
      ValidationMiddleware.paramIdValidation(),
      ValidationMiddleware.validateRequest,
      this.handleCodeReview
    );

    this.router.post(
      '/:id/approve', 
      AuthMiddleware.authenticateToken,
      AuthMiddleware.roleAuthorization(['ADMIN', 'PROJECT_MANAGER']),
      ValidationMiddleware.paramIdValidation(),
      ValidationMiddleware.validateRequest,
      this.handleTaskApproval
    );
  }

  // Route Handlers
  async handleCreateTask(req, res) {
    try {
      const task = await TaskController.createTask(req.body, req.user);
      res.status(201).json(task);
    } catch (error) {
      res.status(error.status || 500).json({ 
        error: error.message,
        code: error.code || 'TASK_CREATION_ERROR'
      });
    }
  }

  async handleGetTask(req, res) {
    try {
      const task = await TaskController.getTask(req.params.id, req.user);
      res.json(task);
    } catch (error) {
      res.status(error.status || 404).json({ 
        error: error.message,
        code: error.code || 'TASK_RETRIEVAL_ERROR'
      });
    }
  }

  async handleListTasks(req, res) {
    try {
      const { page, limit, sortBy, order } = req.query;
      const tasks = await TaskController.listTasks(
        req.user, 
        {
          page: parseInt(page) || 1,
          limit: parseInt(limit) || 10,
          sortBy: sortBy || 'createdAt',
          order: order || 'desc'
        }
      );
      res.json(tasks);
    } catch (error) {
      res.status(error.status || 500).json({ 
        error: error.message,
        code: error.code || 'TASK_LIST_ERROR'
      });
    }
  }

  async handleUpdateTask(req, res) {
    try {
      const updatedTask = await TaskController.updateTask(
        req.params.id, 
        req.body, 
        req.user
      );
      res.json(updatedTask);
    } catch (error) {
      res.status(error.status || 500).json({ 
        error: error.message,
        code: error.code || 'TASK_UPDATE_ERROR'
      });
    }
  }

  async handleDeleteTask(req, res) {
    try {
      await TaskController.deleteTask(req.params.id, req.user);
      res.status(204).send();
    } catch (error) {
      res.status(error.status || 500).json({ 
        error: error.message,
        code: error.code || 'TASK_DELETION_ERROR'
      });
    }
  }

  async handleTaskPlanning(req, res) {
    try {
      const planningResult = await TaskController.planTask(
        req.params.id, 
        req.user
      );
      res.json(planningResult);
    } catch (error) {
      res.status(error.status || 500).json({ 
        error: error.message,
        code: error.code || 'TASK_PLANNING_ERROR'
      });
    }
  }

  async handleCodeGeneration(req, res) {
    try {
      const generationResult = await TaskController.generateCode(
        req.params.id, 
        req.body,
        req.user
      );
      res.json(generationResult);
    } catch (error) {
      res.status(error.status || 500).json({ 
        error: error.message,
        code: error.code || 'CODE_GENERATION_ERROR'
      });
    }
  }

  async handleCodeReview(req, res) {
    try {
      const reviewResult = await TaskController.reviewCode(
        req.params.id, 
        req.user
      );
      res.json(reviewResult);
    } catch (error) {
      res.status(error.status || 500).json({ 
        error: error.message,
        code: error.code || 'CODE_REVIEW_ERROR'
      });
    }
  }

  async handleTaskApproval(req, res) {
    try {
      const approvalResult = await TaskController.approveTask(
        req.params.id, 
        req.user
      );
      res.json(approvalResult);
    } catch (error) {
      res.status(error.status || 500).json({ 
        error: error.message,
        code: error.code || 'TASK_APPROVAL_ERROR'
      });
    }
  }

  getRouter() {
    return this.router;
  }
}

export default new TaskRoutes().getRouter();
