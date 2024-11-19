import unittest
from unittest.mock import patch
from src.planner import CodePlannerAgent

class TestCodePlannerAgent(unittest.TestCase):
    def setUp(self):
        self.planner = CodePlannerAgent()
        self.sample_task = {
            'title': 'Implement User Authentication',
            'description': 'Create login and registration system'
        }

    def test_initialize_planning(self):
        plan = self.planner.initialize_plan(self.sample_task)
        
        self.assertIsNotNone(plan)
        self.assertTrue(len(plan['implementation_steps']) > 0)
        self.assertEqual(plan['status'], 'PLANNING_COMPLETE')

    @patch('src.planner.external_complexity_analyzer')
    def test_complex_task_decomposition(self, mock_analyzer):
        mock_analyzer.return_value = {
            'complexity_score': 0.8,
            'recommended_subtasks': 4
        }

        detailed_plan = self.planner.decompose_complex_task(self.sample_task)
        
        self.assertGreater(len(detailed_plan['implementation_steps']), 3)
        self.assertTrue(all(step['estimated_time'] is not None for step in detailed_plan['implementation_steps']))

    def test_generate_technical_specifications(self):
        specs = self.planner.generate_technical_specs(self.sample_task)
        
        self.assertIn('architecture_strategy', specs)
        self.assertIn('technology_recommendations', specs)
