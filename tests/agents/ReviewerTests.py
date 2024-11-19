import unittest
from src.reviewer import CodeReviewAgent

class TestCodeReviewAgent(unittest.TestCase):
    def setUp(self):
        self.reviewer = CodeReviewAgent()
        self.sample_code = '''
        def create_user(username, password):
            # Validate input
            if not username or not password:
                return None
            
            # Create user logic
            user = User(username=username)
            user.set_password(password)
            user.save()
            return user
        '''

    def test_code_review(self):
        review_result = self.reviewer.review_code(self.sample_code)
        
        self.assertIsNotNone(review_result)
        self.assertTrue(review_result['is_acceptable'])
        self.assertGreater(review_result['quality_score'], 0.7)

    def test_security_analysis(self):
        security_report = self.reviewer.analyze_security(self.sample_code)
        
        self.assertIn('potential_vulnerabilities', security_report)
        self.assertIn('recommendations', security_report)

    def test_performance_evaluation(self):
        performance_metrics = self.reviewer.evaluate_performance(self.sample_code)
        
        self.assertIn('time_complexity', performance_metrics)
        self.assertIn('space_complexity', performance_metrics)
        self.assertTrue(performance_metrics['time_complexity'] <= 'O(n)')
