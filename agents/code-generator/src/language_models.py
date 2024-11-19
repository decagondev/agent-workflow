import openai
from typing import Dict

class LanguageModelService:
    def __init__(self):
        self.code_generation_prompt = """
        You are an expert code generation assistant. 
        Generate clean, efficient, and well-structured code 
        based on the provided description and context.
        
        Considerations:
        - Write production-ready code
        - Include necessary imports
        - Add minimal comments for clarity
        - Follow best practices for the target language
        """

    def generate_code_snippet(self, description: str, context: Dict = None) -> str:
        """
        Generate a code snippet based on description and context
        
        Args:
            description (str): Detailed description of code to generate
            context (Dict, optional): Additional context for code generation
        
        Returns:
            str: Generated code snippet
        """
        response = openai.ChatCompletion.create(
            model="gpt-4-turbo",
            messages=[
                {"role": "system", "content": self.code_generation_prompt},
                {"role": "user", "content": description},
                {"role": "user", "content": f"Context: {context}"}
            ],
            max_tokens=500
        )

        return response.choices[0].message.content.strip()
