import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

class PlanningService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  /**
   * Generate a comprehensive implementation plan for a task
   * @param {Object} task - The task to be planned
   * @returns {Promise<string>} Detailed implementation plan
   */
  async generatePlan(task) {
    try {
      const prompt = this.constructPlanningPrompt(task);

      const planningResponse = await this.callOpenAIPlanningAPI(prompt);

      const structuredPlan = this.validateAndStructurePlan(planningResponse);

      return structuredPlan;
    } catch (error) {
      console.error('Error in plan generation:', error);
      throw new Error(`Plan generation failed: ${error.message}`);
    }
  }

  /**
   * Construct a detailed prompt for plan generation
   * @param {Object} task - The task to be planned
   * @returns {string} Detailed planning prompt
   */
  constructPlanningPrompt(task) {
    return `
You are an AI software development planning agent. Generate a comprehensive, step-by-step implementation plan for the following task:

Task Title: ${task.title}
Task Description: ${task.description}
Task Complexity: ${task.complexity}

Planning Guidelines:
1. Break down the task into granular, actionable steps
2. Identify potential technical challenges
3. Suggest optimal implementation approach
4. Estimate approximate time for each step
5. Recommend best practices and design patterns
6. Consider scalability and maintainability

Expected Output Format:
- Numbered list of implementation steps
- Each step should include:
  * Detailed description
  * Estimated time
  * Potential challenges
  * Recommended approach

Please provide a detailed, professional, and pragmatic implementation strategy.
    `.trim();
  }

  /**
   * Call OpenAI API for plan generation
   * @param {string} prompt - Planning prompt
   * @returns {Promise<string>} Generated plan
   */
  async callOpenAIPlanningAPI(prompt) {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert software development planning agent. Provide comprehensive, actionable implementation plans.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 1.0,
        frequency_penalty: 0.5,
        presence_penalty: 0.5
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw error;
    }
  }

  /**
   * Validate and structure the generated plan
   * @param {string} plan - Raw plan from AI
   * @returns {string} Structured and validated plan
   */
  validateAndStructurePlan(plan) {
    const steps = plan.split('\n').filter(step => 
      step.trim() && 
      /^\d+\./.test(step.trim())
    );

    if (steps.length < 3 || steps.length > 10) {
      throw new Error('Invalid plan generation: Unexpected number of steps');
    }
    const structuredPlan = {
      rawPlan: plan,
      steps: steps.map(step => ({
        number: parseInt(step.match(/^\d+/)[0]),
        description: step.replace(/^\d+\.\s*/, '').trim()
      }))
    };

    return JSON.stringify(structuredPlan, null, 2);
  }

  /**
   * Analyze task complexity and refine planning strategy
   * @param {Object} task - The task to be analyzed
   * @returns {Object} Refined planning strategy
   */
  async analyzeTaskComplexity(task) {
    const complexityFactors = {
      Low: {
        maxSteps: 5,
        timeEstimate: '2-4 hours',
        approachEmphasis: 'Quick implementation'
      },
      Medium: {
        maxSteps: 8,
        timeEstimate: '4-8 hours',
        approachEmphasis: 'Balanced design and implementation'
      },
      High: {
        maxSteps: 12,
        timeEstimate: '8-16 hours',
        approachEmphasis: 'Comprehensive architecture and modular design'
      }
    };

    const complexityConfig = complexityFactors[task.complexity || 'Medium'];

    return {
      ...complexityConfig,
      taskDescription: task.description
    };
  }

  /**
   * Recommend additional resources or considerations for the plan
   * @param {Object} plan - Generated implementation plan
   * @returns {Array} Additional recommendations
   */
  generateAdditionalRecommendations(plan) {
    const parsedPlan = JSON.parse(plan);
    
    const recommendations = [];

    if (parsedPlan.steps.some(step => step.description.includes('database'))) {
      recommendations.push('Consider database indexing and query optimization');
    }

    if (parsedPlan.steps.some(step => step.description.includes('API'))) {
      recommendations.push('Implement comprehensive API rate limiting and validation');
    }

    return recommendations;
  }
}

export default new PlanningService();
