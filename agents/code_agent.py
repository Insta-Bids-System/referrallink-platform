"""
Code Generation Agent - Specialized for writing code
Following IndyDevDan's principles of autonomous code generation
"""

import os
import re
from typing import Dict, Any, List, Optional
from base_agent import BaseAgent, AgentConfig, AgentRole

class CodeAgent(BaseAgent):
    """Agent specialized in code generation and implementation"""
    
    def __init__(self, name: str = "CodeAgent"):
        config = AgentConfig(
            name=name,
            role=AgentRole.DEVELOPER,
            temperature=0.3,  # Lower temperature for more consistent code
            max_tokens=8000
        )
        super().__init__(config)
        self.supported_languages = [
            "python", "javascript", "typescript", "java", 
            "c++", "c#", "go", "rust", "html", "css", "sql"
        ]
    
    def process_task(self, task: str, context: Optional[Dict[str, Any]] = None) -> str:
        """Process a code generation task"""
        context = context or {}
        
        # Extract language if specified
        language = context.get("language", "python")
        
        # Build the prompt
        prompt = self._build_code_prompt(task, language, context)
        
        # Add to conversation history
        self.add_message("user", prompt)
        
        # Generate code (placeholder for actual API call)
        generated_code = self._generate_code(prompt, language)
        
        # Add response to history
        self.add_message("assistant", generated_code)
        
        return generated_code
    
    def _build_code_prompt(self, task: str, language: str, context: Dict[str, Any]) -> str:
        """Build a comprehensive prompt for code generation"""
        prompt_parts = [
            f"Task: {task}",
            f"Language: {language}",
        ]
        
        # Add specifications if provided
        if "specifications" in context:
            prompt_parts.append(f"Specifications:\n{context['specifications']}")
        
        # Add existing code context if provided
        if "existing_code" in context:
            prompt_parts.append(f"Existing code context:\n```{language}\n{context['existing_code']}\n```")
        
        # Add requirements
        if "requirements" in context:
            requirements = "\n".join(f"- {req}" for req in context['requirements'])
            prompt_parts.append(f"Requirements:\n{requirements}")
        
        # Add constraints
        if "constraints" in context:
            constraints = "\n".join(f"- {con}" for con in context['constraints'])
            prompt_parts.append(f"Constraints:\n{constraints}")
        
        # Add output format
        prompt_parts.append("Please provide clean, well-commented code that follows best practices.")
        
        return "\n\n".join(prompt_parts)
    
    def _generate_code(self, prompt: str, language: str) -> str:
        """Generate code based on prompt (placeholder for actual implementation)"""
        # This would connect to an actual LLM API
        # For now, return a template
        return f"""```{language}
# Generated code for: {prompt.split('Task: ')[1].split('\n')[0] if 'Task: ' in prompt else 'Custom task'}
# TODO: Implement actual code generation via API

def main():
    # Implementation goes here
    pass

if __name__ == "__main__":
    main()
```"""
    
    def refactor_code(self, code: str, language: str, improvements: List[str]) -> str:
        """Refactor existing code with specified improvements"""
        context = {
            "existing_code": code,
            "requirements": improvements
        }
        
        task = "Refactor the provided code with the following improvements"
        return self.process_task(task, context)
    
    def add_tests(self, code: str, language: str, test_framework: Optional[str] = None) -> str:
        """Generate tests for the provided code"""
        context = {
            "existing_code": code,
            "language": language,
            "test_framework": test_framework or self._get_default_test_framework(language)
        }
        
        task = f"Generate comprehensive tests for the provided code using {context['test_framework']}"
        return self.process_task(task, context)
    
    def _get_default_test_framework(self, language: str) -> str:
        """Get default test framework for a language"""
        frameworks = {
            "python": "pytest",
            "javascript": "jest",
            "typescript": "jest",
            "java": "junit",
            "c#": "nunit",
            "go": "testing",
            "rust": "cargo test"
        }
        return frameworks.get(language.lower(), "standard testing framework")
    
    def optimize_code(self, code: str, language: str, optimization_goals: List[str]) -> str:
        """Optimize code for specific goals"""
        context = {
            "existing_code": code,
            "language": language,
            "requirements": optimization_goals
        }
        
        task = "Optimize the provided code for the specified goals while maintaining functionality"
        return self.process_task(task, context)
    
    def document_code(self, code: str, language: str, doc_style: Optional[str] = None) -> str:
        """Add comprehensive documentation to code"""
        context = {
            "existing_code": code,
            "language": language,
            "doc_style": doc_style or self._get_default_doc_style(language)
        }
        
        task = f"Add comprehensive documentation to the code using {context['doc_style']} style"
        return self.process_task(task, context)
    
    def _get_default_doc_style(self, language: str) -> str:
        """Get default documentation style for a language"""
        styles = {
            "python": "docstring",
            "javascript": "jsdoc",
            "typescript": "tsdoc",
            "java": "javadoc",
            "c#": "xml comments",
            "go": "godoc",
            "rust": "rustdoc"
        }
        return styles.get(language.lower(), "inline comments")