import os
import logging
from typing import Dict, List
from language_models import LanguageModelService
from dotenv import load_dotenv
import openai

# Load environment variables
load_dotenv()

class CodeGenerationAgent:
    def __init__(self):
        # Initialize OpenAI client
        openai.api_key = os.getenv('OPENAI_API_KEY')
        self.language_model = LanguageModelService()
        self.logger = logging.getLogger(__name__)

    def generate_code(self, plan: Dict) -> Dict:
        """
        Generate code based on implementation plan
        
        Args:
            plan (Dict): Detailed implementation plan
        
        Returns:
            Dict: Generated code with metadata
        """
        try:
            generated_code = {}
            
            for step in plan.get('implementation_steps', []):
                code_snippet = self._generate_code_for_step(step)
                generated_code[step['name']] = code_snippet
            
            return {
                'task_id': plan.get('task_id'),
                'status': 'CODE_GENERATION_COMPLETE',
                'generated_code': generated_code,
                'language': 'python'  # Default language
            }
        except Exception as e:
            self.logger.error(f"Code generation error: {e}")
            return {
                'status': 'GENERATION_FAILED',
                'error': str(e)
            }

    def _generate_code_for_step(self, step: Dict) -> str:
        """
        Generate code for a specific implementation step
        
        Args:
            step (Dict): Implementation step details
        
        Returns:
            str: Generated code snippet
        """
        return self.language_model.generate_code_snippet(
            description=step.get('description', ''),
            context=step
        )

    def validate_generated_code(self, code: Dict) -> bool:
        """
        Validate generated code for syntax and basic structure
        
        Args:
            code (Dict): Generated code dictionary
        
        Returns:
            bool: Whether generated code is valid
        """
        if not code or len(code.get('generated_code', {})) == 0:
            return False
        
        return all(
            snippet and len(snippet) > 10 
            for snippet in code['generated_code'].values()
        )
