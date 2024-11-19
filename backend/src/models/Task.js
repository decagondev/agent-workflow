import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Todo', 'Ready to Code', 'Code Generation', 'Code Review', 'Completed'],
    default: 'Todo'
  },
  planningAttempts: {
    type: Number,
    default: 0,
    max: 3
  },
  generationAttempts: {
    type: Number,
    default: 0,
    max: 3
  },
  implementationPlan: {
    type: String,
    default: null
  },
  generatedCode: {
    type: String,
    default: null
  },
  codeReviewFeedback: {
    type: String,
    default: null
  },
  assignedAgents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent'
  }],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  complexity: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  estimatedTime: {
    type: Number,
    default: null
  },
  tags: [{
    type: String
  }],
  history: [{
    action: String,
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

TaskSchema.methods.updateStatus = function(newStatus) {
  if (this.status !== newStatus) {
    this.history.push({
      action: `Status changed from ${this.status} to ${newStatus}`,
      details: `Workflow state transition`
    });
    this.status = newStatus;
  }
  return this;
};

TaskSchema.methods.addAgentHistory = function(agent, action, details) {
  this.history.push({
    action,
    agent: agent._id,
    details
  });
  return this;
};

export default mongoose.model('Task', TaskSchema);
