const request = require('supertest');
const app = require('../src/app');
const { AgentOrchestrator } = require('../services/agentOrchestrator');

describe('Agent Orchestration', () => {
  let mockTask;

  beforeEach(() => {
    mockTask = {
      id: 'test-task-1',
      title: 'Test Authentication Feature',
      status: 'TODO'
    };
  });

  test('planner agent initializes task plan', async () => {
    const plannerResponse = await AgentOrchestrator.initializePlan(mockTask);

    expect(plannerResponse).toHaveProperty('implementation_steps');
    expect(plannerResponse.status).toBe('PLANNING_COMPLETE');
    expect(plannerResponse.implementation_steps.length).toBeGreaterThan(0);
  });

  test('generation agent creates code for task', async () => {
    const planDetails = {
      task_id: mockTask.id,
      implementation_steps: ['Create user model', 'Implement login endpoint']
    };

    const generationResponse = await AgentOrchestrator.generateCode(planDetails);

    expect(generationResponse).toHaveProperty('generated_code');
    expect(generationResponse.status).toBe('CODE_GENERATION_COMPLETE');
    expect(generationResponse.generated_code).toBeTruthy();
  });

  test('review agent validates generated code', async () => {
    const codeToReview = {
      task_id: mockTask.id,
      code: 'function userLogin() { /* implementation */ }'
    };

    const reviewResponse = await AgentOrchestrator.reviewCode(codeToReview);

    expect(reviewResponse).toHaveProperty('review_comments');
    expect(reviewResponse.status).toBe('REVIEW_COMPLETE');
    expect(reviewResponse.code_quality_score).toBeGreaterThan(0.7);
  });
});
