import os
import logging
from typing import Dict, List
from analysis_engine import CodeAnalysisEngine
from dotenv import load_dotenv
import openai
import bandit

load_dotenv()

class CodeReviewAgent:
    def __init__(self):
        openai.api_key = os.getenv('OPENAI_API_KEY')
        self.analysis_engine = CodeAnalysisEngine()
        self.logger = logging.getLogger(__name__)

    def review_code(self, code: Dict) -> Dict:
        """
        Comprehensive code review process
        
        Args:
            code (Dict): Generated code to review
        
        Returns:
            Dict: Detailed code review results
        """
        try:
            security_analysis = self._run_security_checks(code)
            performance_analysis = self._evaluate_performance(code)
            style_analysis = self._check_code_style(code)
            
            review_result = {
                'task_id': code.get('task_id'),
                'status': 'REVIEW_COMPLETE',
                'quality_score': self._calculate_quality_score(
                    security_analysis, 
                    performance_analysis, 
                    style_analysis
                ),
                'security_issues': security_analysis,
                'performance_recommendations': performance_analysis,
                'style_suggestions': style_analysis
            }
            
            return review_result
        except Exception as e:
            self.logger.error(f"Code review error: {e}")
            return {
                'status': 'REVIEW_FAILED',
                'error': str(e)
            }

    def _run_security_checks(self, code: Dict) -> List[Dict]:
        """
        Perform security vulnerability checks
        
        Args:
            code (Dict): Code to analyze
        
        Returns:
            List[Dict]: Detected security issues
        """
        issues = []
        for filename, snippet in code.get('generated_code', {}).items():
            bandit_results = bandit.run_tests([snippet])
            issues.extend([
                {
                    'file': filename,
                    'issue': issue.text,
                    'severity': issue.severity
                } for issue in bandit_results
            ])
        
        return issues

    def _evaluate_performance(self, code: Dict) -> Dict:
        """
        Analyze code performance characteristics
        
        Args:
            code (Dict): Code to analyze
        
        Returns:
            Dict: Performance analysis results
        """
        return self.analysis_engine.analyze_performance(
            code.get('generated_code', {})
        )

    def _check_code_style(self, code: Dict) -> List[str]:
        """
        Check code against style guidelines
        
        Args:
            code (Dict): Code to analyze
        
        Returns:
            List[str]: Style improvement suggestions
        """
        return self.analysis_engine.check_code_style(
            code.get('generated_code', {})
        )

    def _calculate_quality_score(
        self, 
        security_issues: List[Dict],
        performance: Dict,
        style_suggestions: List[str]
    ) -> float:
        """
        Calculate an overall code quality score
        
        Args:
            security_issues (List[Dict]): Security vulnerabilities
            performance (Dict): Performance analysis
            style_suggestions (List[str]): Style recommendations
        
        Returns:
            float: Quality score between 0 and 1
        """
        base_score = 1.0

        base_score -= 0.1 * len(security_issues)
        base_score -= 0.05 * len(style_suggestions)

        base_score -= 0.1 if performance.get('time_complexity', 'O(n)') == 'O(n^2)' else 0
        
        return max(0, min(base_score, 1.0))
