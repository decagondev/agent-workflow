import Task from '../models/Task.js';
import Agent from '../models/Agent.js';
import { 
  planningService, 
  generationService, 
  reviewService 
} from '../services/index.js';
import { WebSocketServer } from 'ws';

class TaskController {
  /**
   * Create a new task
   */
  async createTask(req, res) {
    try {
      const { 
        title, 
        description, 
        complexity, 
        tags 
      } = req.body;

      const creator = req.user._id;

      const task = new Task({
        title,
        description,
        creator,
        complexity,
        tags
      });

      await task.save();

      this.broadcastTaskUpdate(task);

      res.status(201).json({
        message: 'Task created successfully',
        task
      });
    } catch (error) {
      res.status(400).json({ 
        message: 'Error creating task', 
        error: error.message 
      });
    }
  }

  /**
   * Initiate task planning phase
   */
  async planTask(req, res) {
    try {
      const { id } = req.params;
      const task = await Task.findById(id);

      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      if (task.planningAttempts >= 3) {
        return res.status(400).json({ 
          message: 'Maximum planning attempts reached' 
        });
      }

      const planningAgent = await Agent.findOne({ 
        type: 'CodePlanner', 
        isActive: true 
      });

      if (!planningAgent) {
        return res.status(500).json({ 
          message: 'No available planning agents' 
        });
      }

      const implementationPlan = await planningService.generatePlan(task);

      task.implementationPlan = implementationPlan;
      task.status = 'Ready to Code';
      task.planningAttempts += 1;
      task.assignedAgents.push(planningAgent._id);
      task.addAgentHistory(
        planningAgent, 
        'Task Planning', 
        `Generated implementation plan: ${implementationPlan.slice(0, 100)}...`
      );

      await task.save();

      planningAgent.updatePerformanceMetrics(true, Date.now() - task.createdAt);
      await planningAgent.save();

      this.broadcastTaskUpdate(task);

      res.status(200).json({
        message: 'Task planning completed',
        task,
        plan: implementationPlan
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Error in task planning', 
        error: error.message 
      });
    }
  }

  /**
   * Generate code for the task
   */
  async generateCode(req, res) {
    try {
      const { id } = req.params;
      const task = await Task.findById(id);

      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      if (!task.implementationPlan) {
        return res.status(400).json({ 
          message: 'No implementation plan available' 
        });
      }

      if (task.generationAttempts >= 3) {
        return res.status(400).json({ 
          message: 'Maximum code generation attempts reached' 
        });
      }

      const generationAgent = await Agent.findOne({ 
        type: 'CodeGenerator', 
        isActive: true 
      });

      if (!generationAgent) {
        return res.status(500).json({ 
          message: 'No available generation agents' 
        });
      }

      const generatedCode = await generationService.generateCode(
        task.implementationPlan
      );

      task.generatedCode = generatedCode;
      task.status = 'Code Review';
      task.generationAttempts += 1;
      task.assignedAgents.push(generationAgent._id);
      task.addAgentHistory(
        generationAgent, 
        'Code Generation', 
        `Generated code: ${generatedCode.slice(0, 100)}...`
      );

      await task.save();

      generationAgent.updatePerformanceMetrics(true, Date.now() - task.createdAt);
      await generationAgent.save();

      this.broadcastTaskUpdate(task);

      res.status(200).json({
        message: 'Code generation completed',
        task,
        code: generatedCode
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Error in code generation', 
        error: error.message 
      });
    }
  }

  /**
   * Review generated code
   */
  async reviewCode(req, res) {
    try {
      const { id } = req.params;
      const task = await Task.findById(id);

      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      if (!task.generatedCode) {
        return res.status(400).json({ 
          message: 'No code available for review' 
        });
      }

      const reviewAgent = await Agent.findOne({ 
        type: 'CodeReviewer', 
        isActive: true 
      });

      if (!reviewAgent) {
        return res.status(500).json({ 
          message: 'No available review agents' 
        });
      }

      const reviewFeedback = await reviewService.reviewCode(task.generatedCode);

      task.codeReviewFeedback = reviewFeedback;
      task.status = reviewFeedback.requiresChanges ? 'Code Generation' : 'Completed';
      task.addAgentHistory(
        reviewAgent, 
        'Code Review', 
        `Review result: ${reviewFeedback.summary}`
      );

      await task.save();

      reviewAgent.updatePerformanceMetrics(
        !reviewFeedback.requiresChanges, 
        Date.now() - task.createdAt
      );
      await reviewAgent.save();

      this.broadcastTaskUpdate(task);

      res.status(200).json({
        message: 'Code review completed',
        task,
        feedback: reviewFeedback
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Error in code review', 
        error: error.message 
      });
    }
  }

  /**
   * Approve task completion
   */
  async approveTask(req, res) {
    try {
      const { id } = req.params;
      const { approved } = req.body;

      const task = await Task.findById(id);

      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      if (approved) {
        task.status = 'Completed';
        task.addAgentHistory(
          req.user, 
          'Task Approval', 
          'Task marked as completed by human reviewer'
        );
      } else {
        task.status = 'Code Generation';
        task.addAgentHistory(
          req.user, 
          'Task Rejection', 
          'Task requires further refinement'
        );
      }

      await task.save();

      this.broadcastTaskUpdate(task);

      res.status(200).json({
        message: 'Task approval processed',
        task
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Error in task approval', 
        error: error.message 
      });
    }
  }

  /**
   * Retrieve task details
   */
  async getTask(req, res) {
    try {
      const { id } = req.params;
      const task = await Task.findById(id)
        .populate('creator', 'name email')
        .populate('assignedAgents', 'name type');

      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      res.status(200).json(task);
    } catch (error) {
      res.status(500).json({ 
        message: 'Error retrieving task', 
        error: error.message 
      });
    }
  }

  /**
   * List tasks with filtering and pagination
   */
  async listTasks(req, res) {
    try {
      const { 
        status, 
        page = 1, 
        limit = 10, 
        sortBy = 'createdAt', 
        sortOrder = 'desc' 
      } = req.query;

      const query = status ? { status } : {};

      const tasks = await Task.find(query)
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('creator', 'name')
        .populate('assignedAgents', 'name type');

      const total = await Task.countDocuments(query);

      res.status(200).json({
        tasks,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalTasks: total
        }
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Error listing tasks', 
        error: error.message 
      });
    }
  }

  /**
   * Broadcast task updates via WebSocket
   */
  broadcastTaskUpdate(task) {
    if (this.wss) {
      this.wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'TASK_UPDATE',
            task: task.toObject()
          }));
        }
      });
    }
  }

  /**
   * Initialize WebSocket server
   */
  initWebSocketServer(server) {
    this.wss = new WebSocketServer({ server });

    this.wss.on('connection', (ws) => {
      console.log('WebSocket client connected');

      ws.on('message', (message) => {
        console.log('Received WebSocket message:', message);
      });

      ws.on('close', () => {
        console.log('WebSocket client disconnected');
      });
    });
  }
}

export default new TaskController();
