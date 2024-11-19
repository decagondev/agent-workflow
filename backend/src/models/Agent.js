import mongoose from 'mongoose';

const AgentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['CodePlanner', 'CodeGenerator', 'CodeReviewer'],
    required: true
  },
  specialization: {
    type: String,
    default: null
  },
  performanceMetrics: {
    successRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    averageCompletionTime: {
      type: Number,
      default: null
    },
    totalTasksProcessed: {
      type: Number,
      default: 0
    }
  },
  configuration: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActiveTimestamp: {
    type: Date,
    default: Date.now
  },
  assignedTasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }]
}, {
  timestamps: true
});

AgentSchema.methods.updatePerformanceMetrics = function(taskSuccess, completionTime) {
  const currentTaskCount = this.performanceMetrics.totalTasksProcessed + 1;
  
  this.performanceMetrics.successRate = (
    (this.performanceMetrics.successRate * this.performanceMetrics.totalTasksProcessed + 
    (taskSuccess ? 100 : 0)) / currentTaskCount
  );
  
  this.performanceMetrics.averageCompletionTime = (
    (this.performanceMetrics.averageCompletionTime * this.performanceMetrics.totalTasksProcessed + 
    completionTime) / currentTaskCount
  );
  
  this.performanceMetrics.totalTasksProcessed = currentTaskCount;
  this.lastActiveTimestamp = new Date();
  
  return this;
};

export default mongoose.model('Agent', AgentSchema);
