import unittest
from unittest.mock import patch
from src.generator import CodeGenerationAgent

class TestCodeGenerationAgent(unittest.TestCase):
    def setUp(self):
        self.generator = CodeGenerationAgent()
        self.sample_plan = {
            'task_id': 'auth-task-001',
            'implementation_steps': [
                'Create user model',
                'Implement login endpoint'
            ]
        }

    def test_code_generation(self):
        generated_code = self.generator.generate_code(self.sample_plan)
        
        self.assertIsNotNone(generated_code)
        self.assertTrue(len(generated_code) > 0)
        self.assertIn('user_model', generated_code)
        self.assertIn('login_endpoint', generated_code)

    @patch('src.generator.language_model_service')
    def test_language_specific_generation(self, mock_language_model):
        mock_language_model.return_value = {
            'code': 'def create_user(username, password):',
            'language': 'python'
        }

        python_code = self.generator.generate_language_specific_code(
            self.sample_plan, 
            language='python'
        )
        
        self.assertEqual(python_code['language'], 'python')
        self.assertTrue('def create_user' in python_code['code'])

    def test_code_style_consistency(self):
        multi_step_plan = {
            'task_id': 'complex-task-001',
            'implementation_steps': [
                'Create user authentication module',
                'Implement password hashing',
                'Add JWT token generation'
            ]
        }

        generated_code = self.generator.generate_code(multi_step_plan)
        
        self.assertTrue(self.generator.validate_code_style(generated_code))
