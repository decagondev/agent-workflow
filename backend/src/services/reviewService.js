import { logger } from '../utils/logger';
import { Task } from '../models/Task';
import OpenAI from 'openai';
import { execSync } from 'child_process';
import * as ts from 'typescript';
import * as eslint from 'eslint';

class ReviewService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  /**
   * Comprehensive code review process
   * @param {string} taskId - Unique identifier for the task
   * @returns {Promise<Object>} Detailed code review results
   */
  async reviewCode(taskId) {
    try {
      const task = await Task.findById(taskId);
      if (!task) {
        throw new Error(`Task with ID ${taskId} not found`);
      }

      if (task.status !== 'CODE_GENERATED') {
        throw new Error(`Invalid task status for code review: ${task.status}`);
      }

      const reviewResults = {
        staticAnalysis: await this.performStaticCodeAnalysis(task.generatedCode, task.plannedLanguage),
        securityAnalysis: await this.performSecurityAnalysis(task.generatedCode),
        aiCodeReview: await this.performAICodeReview(task.generatedCode, task.description),
        performanceAnalysis: await this.performPerformanceAnalysis(task.generatedCode)
      };

      reviewResults.overallStatus = this.assessOverallCodeQuality(reviewResults);

      task.reviewResults = reviewResults;
      task.status = reviewResults.overallStatus === 'PASSED' 
        ? 'REVIEW_PASSED' 
        : 'REQUIRES_MODIFICATION';
      await task.save();

      logger.info(`Code review completed for task ${taskId}`, { 
        taskId, 
        reviewStatus: task.status 
      });

      return reviewResults;
    } catch (error) {
      logger.error('Code review failed', { 
        taskId, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Perform static code analysis using language-specific tools
   * @param {string} code - Code to analyze
   * @param {string} language - Programming language
   * @returns {Promise<Object>} Static analysis results
   */
  async performStaticCodeAnalysis(code, language) {
    switch (language?.toLowerCase()) {
      case 'typescript':
      case 'javascript':
        return this.performJSStaticAnalysis(code);
      case 'python':
        return this.performPythonStaticAnalysis(code);
      default:
        return {
          status: 'UNSUPPORTED_LANGUAGE',
          issues: [`Static analysis not supported for ${language}`]
        };
    }
  }

  /**
   * JavaScript/TypeScript Static Analysis
   * @param {string} code - JavaScript/TypeScript code
   * @returns {Object} Analysis results
   */
  performJSStaticAnalysis(code) {
    const results = {
      syntaxErrors: [],
      codeSmells: [],
      complexityIssues: []
    };

    try {
      const transpileResult = ts.transpileModule(code, {
        compilerOptions: { 
          strict: true, 
          noEmit: true 
        }
      });

      const eslintInstance = new eslint.Linter();
      const messages = eslintInstance.verify(code, {
        env: { es6: true, node: true },
        extends: ['eslint:recommended'],
        parserOptions: { ecmaVersion: 2021 },
        rules: {
          'complexity': ['error', 10],
          'max-depth': ['error', 4],
          'no-unused-vars': 'error'
        }
      });

      messages.forEach(message => {
        const category = message.severity === 2 
          ? (message.ruleId === 'complexity' ? 'complexityIssues' : 'syntaxErrors')
          : 'codeSmells';
        
        results[category].push({
          line: message.line,
          message: message.message,
          ruleId: message.ruleId
        });
      });

      results.status = results.syntaxErrors.length > 0 
        ? 'FAILED' 
        : (results.complexityIssues.length > 0 ? 'NEEDS_IMPROVEMENT' : 'PASSED');

      return results;
    } catch (error) {
      return {
        status: 'ERROR',
        error: error.message
      };
    }
  }

  /**
   * Python Static Analysis
   * @param {string} code - Python code
   * @returns {Object} Analysis results
   */
  performPythonStaticAnalysis(code) {
    try {
      const tempFile = '/tmp/code_to_analyze.py';
      require('fs').writeFileSync(tempFile, code);
      
      const pylintOutput = execSync(`pylint ${tempFile}`).toString();
      
      return {
        status: 'ANALYZED',
        pylintReport: pylintOutput
      };
    } catch (error) {
      return {
        status: 'ERROR',
        error: error.message
      };
    }
  }

  /**
   * Perform AI-powered code review
   * @param {string} code - Code to review
   * @param {string} taskDescription - Original task description
   * @returns {Promise<Object>} AI review results
   */
  async performAICodeReview(code, taskDescription) {
    try {
      const aiReviewResponse = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a senior software engineer performing a detailed code review.'
          },
          {
            role: 'user',
            content: `
Review the following code against the task description:

Task Description: ${taskDescription}

Code to Review:
${code}

Provide a detailed review focusing on:
- Alignment with original task requirements
- Code quality and best practices
- Potential improvements
- Performance considerations
- Readability and maintainability
`
          }
        ],
        max_tokens: 1000,
        temperature: 0.5
      });

      return {
        suggestions: aiReviewResponse.choices[0].message.content.split('\n'),
        status: 'COMPLETED'
      };
    } catch (error) {
      return {
        status: 'ERROR',
        error: error.message
      };
    }
  }

  /**
   * Perform basic security analysis
   * @param {string} code - Code to analyze
   * @returns {Promise<Object>} Security analysis results
   */
  async performSecurityAnalysis(code) {
    const securityIssues = [];

    const securityChecks = [
      { 
        regex: /eval\(/, 
        message: 'Potential security risk: avoid using eval()' 
      },
      { 
        regex: /\.innerHTML\s*=/, 
        message: 'Potential XSS vulnerability: avoid direct innerHTML assignment' 
      },
      { 
        regex: /require\(["']\.\.\//, 
        message: 'Potential path traversal risk in require statements' 
      }
    ];

    securityChecks.forEach(check => {
      if (check.regex.test(code)) {
        securityIssues.push(check.message);
      }
    });

    return {
      status: securityIssues.length > 0 ? 'NEEDS_REVIEW' : 'PASSED',
      vulnerabilities: securityIssues
    };
  }

  /**
   * Perform basic performance analysis
   * @param {string} code - Code to analyze
   * @returns {Promise<Object>} Performance analysis results
   */
  async performPerformanceAnalysis(code) {
    const performanceIssues = [];

    const performanceChecks = [
      { 
        regex: /for\s*\([^)]*\)\s*{[^}]*\.[^}]*push/i, 
        message: 'Potential performance issue: Repeated array push in loop' 
      },
      { 
        regex: /async\s+function[^{]*{[^}]*await[^}]*await/i, 
        message: 'Potential performance issue: Consecutive await calls' 
      }
    ];

    performanceChecks.forEach(check => {
      if (check.regex.test(code)) {
        performanceIssues.push(check.message);
      }
    });

    return {
      status: performanceIssues.length > 0 ? 'NEEDS_OPTIMIZATION' : 'PASSED',
      performanceNotes: performanceIssues
    };
  }

  /**
   * Assess overall code quality
   * @param {Object} reviewResults - Comprehensive review results
   * @returns {string} Overall status
   */
  assessOverallCodeQuality(reviewResults) {
    const criticalIssues = [
      reviewResults.staticAnalysis?.status === 'FAILED',
      reviewResults.securityAnalysis?.status === 'NEEDS_REVIEW',
      reviewResults.performanceAnalysis?.status === 'NEEDS_OPTIMIZATION'
    ];

    const totalCriticalIssues = criticalIssues.filter(Boolean).length;

    if (totalCriticalIssues > 1) {
      return 'REQUIRES_SIGNIFICANT_MODIFICATION';
    } else if (totalCriticalIssues === 1) {
      return 'REQUIRES_MODIFICATION';
    }

    return 'PASSED';
  }
}

export default new ReviewService();
