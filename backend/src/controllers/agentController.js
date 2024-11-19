import Agent from '../models/Agent.js';
import Task from '../models/Task.js';

class AgentController {
  /**
   * Create a new agent
   */
  async createAgent(req, res) {
    try {
      const { 
        name, 
        type, 
        specialization, 
        configuration 
      } = req.body;

      const existingAgent = await Agent.findOne({ name });
      if (existingAgent) {
        return res.status(400).json({ 
          message: 'Agent with this name already exists' 
        });
      }

      const agent = new Agent({
        name,
        type,
        specialization,
        configuration,
        isActive: true
      });

      await agent.save();

      res.status(201).json({
        message: 'Agent created successfully',
        agent
      });
    } catch (error) {
      res.status(400).json({ 
        message: 'Error creating agent', 
        error: error.message 
      });
    }
  }

  /**
   * Get agent details
   */
  async getAgent(req, res) {
    try {
      const { id } = req.params;
      
      const agent = await Agent.findById(id)
        .populate({
          path: 'assignedTasks',
          select: 'title status createdAt',
          options: { 
            limit: 10, 
            sort: { createdAt: -1 } 
          }
        });

      if (!agent) {
        return res.status(404).json({ message: 'Agent not found' });
      }

      res.status(200).json(agent);
    } catch (error) {
      res.status(500).json({ 
        message: 'Error retrieving agent', 
        error: error.message 
      });
    }
  }

  /**
   * List agents with filtering and pagination
   */
  async listAgents(req, res) {
    try {
      const { 
        type, 
        isActive, 
        page = 1, 
        limit = 10, 
        sortBy = 'createdAt', 
        sortOrder = 'desc' 
      } = req.query;

      const query = {};
      if (type) query.type = type;
      if (isActive !== undefined) query.isActive = isActive;

      const agents = await Agent.find(query)
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

      const total = await Agent.countDocuments(query);

      res.status(200).json({
        agents,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalAgents: total
        }
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Error listing agents', 
        error: error.message 
      });
    }
  }

  /**
   * Update agent configuration
   */
  async updateAgent(req, res) {
    try {
      const { id } = req.params;
      const { 
        specialization, 
        configuration, 
        isActive 
      } = req.body;

      const agent = await Agent.findById(id);

      if (!agent) {
        return res.status(404).json({ message: 'Agent not found' });
      }

      if (specialization) agent.specialization = specialization;
      if (configuration) agent.configuration = configuration;
      if (isActive !== undefined) agent.isActive = isActive;

      await agent.save();

      res.status(200).json({
        message: 'Agent updated successfully',
        agent
      });
    } catch (error) {
      res.status(400).json({ 
        message: 'Error updating agent', 
        error: error.message 
      });
    }
  }

  /**
   * Get agent performance metrics
   */
  async getAgentPerformance(req, res) {
    try {
      const { id } = req.params;
      
      const agent = await Agent.findById(id);

      if (!agent) {
        return res.status(404).json({ message: 'Agent not found' });
      }

      const recentTasks = await Task.find({ 
        assignedAgents: agent._id 
      })
        .sort({ createdAt: -1 })
        .limit(20)
        .select('status createdAt');

      const performanceBreakdown = {
        completedTasks: recentTasks.filter(task => task.status === 'Completed').length,
        totalTasks: recentTasks.length,
        successRate: agent.performanceMetrics.successRate,
        averageCompletionTime: agent.performanceMetrics.averageCompletionTime
      };

      res.status(200).json({
        performanceMetrics: agent.performanceMetrics,
        performanceBreakdown,
        recentTasks
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Error retrieving agent performance', 
        error: error.message 
      });
    }
  }

  /**
   * Deactivate an agent
   */
  async deactivateAgent(req, res) {
    try {
      const { id } = req.params;

      const agent = await Agent.findById(id);

      if (!agent) {
        return res.status(404).json({ message: 'Agent not found' });
      }

      const activeTasks = await Task.countDocuments({
        assignedAgents: agent._id,
        status: { $ne: 'Completed' }
      });

      if (activeTasks > 0) {
        return res.status(400).json({ 
          message: 'Cannot deactivate agent with active tasks' 
        });
      }

      agent.isActive = false;
      await agent.save();

      res.status(200).json({
        message: 'Agent deactivated successfully',
        agent
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Error deactivating agent', 
        error: error.message 
      });
    }
  }

  /**
   * Find available agents for a specific task type
   */
  async findAvailableAgents(req, res) {
    try {
      const { type } = req.query;

      if (!type) {
        return res.status(400).json({ 
          message: 'Agent type is required' 
        });
      }

      const availableAgents = await Agent.find({
        type,
        isActive: true,
        $expr: { 
          $lt: [{ $size: '$assignedTasks' }, 5]
        }
      });

      res.status(200).json({
        availableAgents,
        count: availableAgents.length
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Error finding available agents', 
        error: error.message 
      });
    }
  }
}

export default new AgentController();
