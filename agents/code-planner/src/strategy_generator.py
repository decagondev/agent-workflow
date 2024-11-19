import json
import openai
from typing import Dict

class StrategyGenerator:
    def __init__(self):
        self.system_prompt = """
        You are an expert software architecture strategy generator. 
        Your task is to break down software development tasks into 
        comprehensive, actionable implementation strategies.
        
        For each task, generate:
        - Core components
        - Implementation details
        - Potential challenges
        - Recommended approaches
        """

    def generate_strategy(self, task: Dict) -> Dict:
        """
        Generate a comprehensive implementation strategy
        
        Args:
            task (Dict): Task details including title and description
        
        Returns:
            Dict: Detailed implementation strategy
        """
        response = openai.ChatCompletion.create(
            model="gpt-4-turbo",
            messages=[
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": json.dumps(task)}
            ],
            response_format={"type": "json_object"}
        )

        strategy = json.loads(response.choices[0].message.content)
        
        return {
            'components': strategy.get('components', {}),
            'complexity': strategy.get('complexity', 'MEDIUM'),
            'recommended_technologies': strategy.get('recommended_technologies', [])
        }
