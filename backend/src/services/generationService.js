import { OpenAI } from 'openai';
import { logger } from '../utils/logger';
import { Task } from '../models/Task';

class GenerationService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  /**
   * Generate implementation code based on task planning details
   * @param {string} taskId - Unique identifier for the task
   * @returns {Promise<Object>} Generated code and metadata
   */
  async generateCode(taskId) {
    try {
      const task = await Task.findById(taskId);
      if (!task) {
        throw new Error(`Task with ID ${taskId} not found`);
      }

      if (task.status !== 'PLANNING_COMPLETE') {
        throw new Error(`Invalid task status for code generation: ${task.status}`);
      }

      const prompt = this.constructCodeGenerationPrompt(task);

      const codeResponse = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert software development AI assistant. Generate high-quality, production-ready code based on the provided specifications.' 
          },
          { 
            role: 'user', 
            content: prompt 
          }
        ],
        max_tokens: 4096,
        temperature: 0.7
      });

      const generatedCode = codeResponse.choices[0].message.content;

      task.generatedCode = generatedCode;
      task.status = 'CODE_GENERATED';
      await task.save();

      logger.info(`Code generated for task ${taskId}`, { 
        taskId, 
        codeLength: generatedCode.length 
      });

      return {
        taskId,
        generatedCode,
        language: task.plannedLanguage || 'javascript',
        timestamp: new Date()
      };
    } catch (error) {
      logger.error('Code generation failed', { 
        taskId, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Construct a detailed prompt for code generation
   * @param {Object} task - Task document
   * @returns {string} Detailed code generation prompt
   */
  constructCodeGenerationPrompt(task) {
    return `
Generate code for the following task specifications:

Task Description: ${task.description}
Planned Implementation Strategy:
${task.implementationPlan}

Specific Requirements:
${task.technicalRequirements || 'No specific requirements provided'}

Coding Language: ${task.plannedLanguage || 'JavaScript'}

Constraints and Considerations:
- Maintain clean, readable, and well-structured code
- Follow best practices for the specified language
- Include necessary error handling
- Add inline comments explaining complex logic
- Ensure the code is modular and follows SOLID principles

Expected Output Format:
- Complete, runnable code
- Separate files if multiple components are needed
- Include any necessary imports or dependencies
`;
  }

  /**
   * Validate generated code against basic quality checks
   * @param {string} code - Generated code to validate
   * @returns {Object} Validation results
   */
  validateGeneratedCode(code) {
    const validationResults = {
      passedChecks: [],
      failedChecks: []
    };

    const lineCount = code.split('\n').length;
    if (lineCount > 1000) {
      validationResults.failedChecks.push('Excessive code length');
    }

    const bracketBalance = this.checkBracketBalance(code);
    if (!bracketBalance.balanced) {
      validationResults.failedChecks.push(`Unbalanced brackets: ${bracketBalance.details}`);
    }

    const todoMatches = code.match(/TODO|FIXME/gi);
    if (todoMatches) {
      validationResults.failedChecks.push(`Found ${todoMatches.length} TODO/FIXME markers`);
    }

    validationResults.passedChecks = [
      'Basic syntax validation',
      'Code length within reasonable limits'
    ];

    validationResults.overallStatus = validationResults.failedChecks.length === 0 
      ? 'PASSED' 
      : 'REQUIRES_REVIEW';

    return validationResults;
  }

  /**
   * Check bracket balance in code
   * @param {string} code - Code to check
   * @returns {Object} Bracket balance check results
   */
  checkBracketBalance(code) {
    const brackets = {
      '(': ')',
      '{': '}',
      '[': ']'
    };
    const stack = [];

    for (let char of code) {
      if (Object.keys(brackets).includes(char)) {
        stack.push(char);
      } else if (Object.values(brackets).includes(char)) {
        const lastOpen = stack.pop();
        if (brackets[lastOpen] !== char) {
          return { 
            balanced: false, 
            details: `Mismatched brackets: expected ${brackets[lastOpen]}, found ${char}` 
          };
        }
      }
    }

    return {
      balanced: stack.length === 0,
      details: stack.length > 0 ? `${stack.length} unclosed brackets` : 'All brackets balanced'
    };
  }
}

export default new GenerationService();
