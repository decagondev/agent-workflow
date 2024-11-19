import os
import logging
from typing import Dict, List
from strategy_generator import StrategyGenerator
from dotenv import load_dotenv
import openai

load_dotenv()

class CodePlannerAgent:
    def __init__(self):
        openai.api_key = os.getenv('OPENAI_API_KEY')
        self.strategy_generator = StrategyGenerator()
        self.logger = logging.getLogger(__name__)

    def initialize_plan(self, task: Dict) -> Dict:
        """
        Generate a comprehensive implementation plan for a given task
        
        Args:
            task (Dict): Task details including title and description
        
        Returns:
            Dict: Detailed implementation plan
        """
        try:
            # Generate initial strategy
            strategy = self.strategy_generator.generate_strategy(task)
            
            # Decompose into implementation steps
            implementation_steps = self._decompose_strategy(strategy)
            
            return {
                'task_id': task.get('id'),
                'status': 'PLANNING_COMPLETE',
                'implementation_steps': implementation_steps,
                'estimated_complexity': strategy.get('complexity', 'MEDIUM')
            }
        except Exception as e:
            self.logger.error(f"Planning error: {e}")
            return {
                'status': 'PLANNING_FAILED',
                'error': str(e)
            }

    def _decompose_strategy(self, strategy: Dict) -> List[Dict]:
        """
        Break down strategy into granular implementation steps
        
        Args:
            strategy (Dict): Generated strategy details
        
        Returns:
            List[Dict]: Detailed implementation steps
        """
        steps = []
        for key, details in strategy.get('components', {}).items():
            step = {
                'name': key,
                'description': details.get('description', ''),
                'estimated_time': details.get('estimated_time', '1-2 hours'),
                'dependencies': details.get('dependencies', [])
            }
            steps.append(step)
        
        return steps

    def validate_plan(self, plan: Dict) -> bool:
        """
        Validate the generated implementation plan
        
        Args:
            plan (Dict): Implementation plan to validate
        
        Returns:
            bool: Whether plan is valid and complete
        """
        if not plan or len(plan.get('implementation_steps', [])) == 0:
            return False
        
        return all(
            step.get('name') and 
            step.get('description') 
            for step in plan['implementation_steps']
        )
