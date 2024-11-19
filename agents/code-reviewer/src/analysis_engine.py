import re
import ast
import logging
from typing import Dict, List, Any

class CodeAnalysisEngine:
    def __init__(self):
        self.logger = logging.getLogger(self.__class__.__name__)
    
    def analyze_code_structure(self, code: str) -> Dict[str, Any]:
        """
        Perform comprehensive static code analysis
        
        Args:
            code (str): Source code to analyze
        
        Returns:
            Dict containing structural analysis results
        """
        try:
            tree = ast.parse(code)

            structure_report = {
                'function_count': len([node for node in ast.walk(tree) if isinstance(node, ast.FunctionDef)]),
                'class_count': len([node for node in ast.walk(tree) if isinstance(node, ast.ClassDef)]),
                'complexity_metrics': self._calculate_cyclomatic_complexity(tree),
                'potential_issues': self._identify_code_smells(tree)
            }
            
            return structure_report
        except SyntaxError as e:
            self.logger.error(f"Syntax error in code analysis: {str(e)}")
            return {'error': str(e)}
    
    def _calculate_cyclomatic_complexity(self, tree: ast.AST) -> Dict[str, float]:
        """
        Calculate cyclomatic complexity for the code
        
        Args:
            tree (ast.AST): Abstract Syntax Tree of the code
        
        Returns:
            Dict with complexity metrics
        """
        complexity_metrics = {
            'total_complexity': 1,
            'branch_points': 0
        }
        
        for node in ast.walk(tree):
            if isinstance(node, (ast.If, ast.While, ast.For, ast.Try, ast.ExceptHandler)):
                complexity_metrics['total_complexity'] += 1
                complexity_metrics['branch_points'] += 1
        
        return complexity_metrics
    
    def _identify_code_smells(self, tree: ast.AST) -> List[str]:
        """
        Identify potential code quality issues
        
        Args:
            tree (ast.AST): Abstract Syntax Tree of the code
        
        Returns:
            List of potential code smell descriptions
        """
        code_smells = []

        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                if len(node.body) > 20:
                    code_smells.append(f"Long method detected: {node.name}")

        nested_depth = self._check_nested_complexity(tree)
        if nested_depth > 3:
            code_smells.append(f"High nested complexity: {nested_depth} levels")
        
        return code_smells
    
    def _check_nested_complexity(self, tree: ast.AST, max_depth: int = 3) -> int:
        """
        Check maximum nesting depth in the code
        
        Args:
            tree (ast.AST): Abstract Syntax Tree
            max_depth (int): Maximum acceptable nesting depth
        
        Returns:
            Maximum nesting depth found
        """
        def _depth_traverse(node, current_depth=0):
            max_found = current_depth
            for child in ast.iter_child_nodes(node):
                if isinstance(child, (ast.If, ast.For, ast.While)):
                    max_found = max(max_found, _depth_traverse(child, current_depth + 1))
            return max_found
        
        return _depth_traverse(tree)
    
    def security_vulnerability_scan(self, code: str) -> Dict[str, List[str]]:
        """
        Perform security vulnerability scanning
        
        Args:
            code (str): Source code to scan
        
        Returns:
            Dict of security vulnerability categories and findings
        """
        vulnerabilities = {
            'input_validation': [],
            'potential_injection_risks': [],
            'authentication_issues': []
        }

        if re.search(r'input\(', code) or re.search(r'eval\(', code):
            vulnerabilities['input_validation'].append('Potential unsafe input handling')

        if re.search(r'execute.*sql', code, re.IGNORECASE):
            vulnerabilities['potential_injection_risks'].append('Potential SQL injection risk')

        if re.search(r'password.*=.*plain', code, re.IGNORECASE):
            vulnerabilities['authentication_issues'].append('Potential plaintext password storage')
        
        return vulnerabilities
