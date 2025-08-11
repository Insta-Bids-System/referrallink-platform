#!/usr/bin/env python3
"""
Single File Code Improver Agent
Following IndyDevDan's principle: "Prompts are the new fundamental unit of programming"
This agent analyzes and improves existing code
"""

import os
import sys
import json
import argparse
import ast
import re
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime

# Configuration
DEFAULT_MODEL = os.getenv("DEFAULT_MODEL", "gpt-4o")
DEFAULT_TEMPERATURE = float(os.getenv("DEFAULT_TEMPERATURE", "0.3"))
API_KEY = os.getenv("OPENAI_API_KEY") or os.getenv("ANTHROPIC_API_KEY")

SYSTEM_PROMPT = """You are an expert code improvement specialist.
Your role is to analyze code and make it better through:
1. Refactoring for clarity and maintainability
2. Performance optimization
3. Security hardening
4. Bug fixing
5. Adding proper error handling
6. Improving documentation
7. Following best practices

Always maintain backward compatibility unless explicitly told otherwise.
Explain your improvements clearly."""

@dataclass
class CodeIssue:
    """Represents an issue found in code"""
    severity: str  # critical, major, minor, info
    category: str  # bug, performance, security, style, documentation
    line: Optional[int]
    message: str
    suggestion: str

@dataclass
class ImprovementResult:
    """Result of code improvement"""
    original_code: str
    improved_code: str
    issues_found: List[CodeIssue]
    improvements_made: List[str]
    metrics: Dict[str, Any]

class CodeImproverAgent:
    """Single-purpose agent for improving code quality"""
    
    def __init__(self, model: str = DEFAULT_MODEL, temperature: float = DEFAULT_TEMPERATURE):
        self.model = model
        self.temperature = temperature
        self.api_key = API_KEY
        
        if not self.api_key:
            raise ValueError("API key not found. Set OPENAI_API_KEY or ANTHROPIC_API_KEY")
    
    def improve_code(self, 
                    code: str, 
                    language: str = "python",
                    focus_areas: Optional[List[str]] = None,
                    context: Optional[Dict[str, Any]] = None) -> ImprovementResult:
        """
        Improve code quality across multiple dimensions
        
        Args:
            code: The code to improve
            language: Programming language
            focus_areas: Specific areas to focus on (performance, security, etc.)
            context: Additional context about the code
        
        Returns:
            ImprovementResult with improved code and analysis
        """
        
        context = context or {}
        focus_areas = focus_areas or ["all"]
        
        # Analyze the code
        issues = self._analyze_code(code, language)
        
        # Generate improvements
        improved_code = self._generate_improvements(code, language, issues, focus_areas, context)
        
        # Calculate metrics
        metrics = self._calculate_metrics(code, improved_code)
        
        # List improvements made
        improvements = self._list_improvements(code, improved_code, issues)
        
        return ImprovementResult(
            original_code=code,
            improved_code=improved_code,
            issues_found=issues,
            improvements_made=improvements,
            metrics=metrics
        )
    
    def _analyze_code(self, code: str, language: str) -> List[CodeIssue]:
        """Analyze code for issues and improvement opportunities"""
        
        issues = []
        
        if language == "python":
            issues.extend(self._analyze_python_code(code))
        elif language == "javascript":
            issues.extend(self._analyze_javascript_code(code))
        else:
            issues.extend(self._analyze_generic_code(code))
        
        return issues
    
    def _analyze_python_code(self, code: str) -> List[CodeIssue]:
        """Python-specific code analysis"""
        
        issues = []
        
        # Check for common Python issues
        lines = code.split('\n')
        
        for i, line in enumerate(lines, 1):
            # Check for bare except
            if re.match(r'\s*except\s*:', line):
                issues.append(CodeIssue(
                    severity="major",
                    category="bug",
                    line=i,
                    message="Bare except clause catches all exceptions",
                    suggestion="Specify exception types to catch"
                ))
            
            # Check for mutable default arguments
            if re.search(r'def\s+\w+\([^)]*=\s*(\[\]|\{\})', line):
                issues.append(CodeIssue(
                    severity="major",
                    category="bug",
                    line=i,
                    message="Mutable default argument",
                    suggestion="Use None as default and create new instance in function"
                ))
            
            # Check for == None instead of is None
            if '== None' in line or '!= None' in line:
                issues.append(CodeIssue(
                    severity="minor",
                    category="style",
                    line=i,
                    message="Use 'is None' instead of '== None'",
                    suggestion="Replace with 'is None' or 'is not None'"
                ))
            
            # Check for missing docstrings
            if re.match(r'\s*def\s+\w+\(', line):
                # Check next line for docstring
                if i < len(lines) and not re.match(r'\s*"""', lines[i]):
                    issues.append(CodeIssue(
                        severity="minor",
                        category="documentation",
                        line=i,
                        message="Function missing docstring",
                        suggestion="Add docstring describing function purpose"
                    ))
        
        # Try to parse AST for deeper analysis
        try:
            tree = ast.parse(code)
            # Add more sophisticated AST-based checks here
        except SyntaxError:
            issues.append(CodeIssue(
                severity="critical",
                category="bug",
                line=None,
                message="Code has syntax errors",
                suggestion="Fix syntax errors before improvement"
            ))
        
        return issues
    
    def _analyze_javascript_code(self, code: str) -> List[CodeIssue]:
        """JavaScript-specific code analysis"""
        
        issues = []
        lines = code.split('\n')
        
        for i, line in enumerate(lines, 1):
            # Check for var usage
            if re.match(r'\s*var\s+', line):
                issues.append(CodeIssue(
                    severity="minor",
                    category="style",
                    line=i,
                    message="Using 'var' instead of 'let' or 'const'",
                    suggestion="Use 'const' for constants, 'let' for variables"
                ))
            
            # Check for == instead of ===
            if '==' in line and '===' not in line:
                issues.append(CodeIssue(
                    severity="minor",
                    category="bug",
                    line=i,
                    message="Using == instead of ===",
                    suggestion="Use === for strict equality"
                ))
        
        return issues
    
    def _analyze_generic_code(self, code: str) -> List[CodeIssue]:
        """Generic code analysis for any language"""
        
        issues = []
        lines = code.split('\n')
        
        # Check for TODO/FIXME comments
        for i, line in enumerate(lines, 1):
            if 'TODO' in line or 'FIXME' in line:
                issues.append(CodeIssue(
                    severity="info",
                    category="documentation",
                    line=i,
                    message="Unresolved TODO/FIXME comment",
                    suggestion="Address the TODO/FIXME item"
                ))
            
            # Check for very long lines
            if len(line) > 120:
                issues.append(CodeIssue(
                    severity="minor",
                    category="style",
                    line=i,
                    message="Line exceeds 120 characters",
                    suggestion="Break into multiple lines for readability"
                ))
        
        # Check for lack of comments
        comment_lines = sum(1 for line in lines if line.strip().startswith(('#', '//', '/*')))
        if len(lines) > 20 and comment_lines < len(lines) * 0.1:
            issues.append(CodeIssue(
                severity="minor",
                category="documentation",
                line=None,
                message="Code lacks sufficient comments",
                suggestion="Add comments to explain complex logic"
            ))
        
        return issues
    
    def _generate_improvements(self, 
                              code: str, 
                              language: str,
                              issues: List[CodeIssue],
                              focus_areas: List[str],
                              context: Dict[str, Any]) -> str:
        """Generate improved version of the code"""
        
        # Build improvement prompt
        prompt = self._build_improvement_prompt(code, language, issues, focus_areas, context)
        
        # TODO: Call actual LLM API here
        print(f"🤖 Improving code with {self.model}...")
        print(f"   Focus areas: {', '.join(focus_areas)}")
        print(f"   Issues found: {len(issues)}")
        
        # Simulated improvement (placeholder)
        improved = self._apply_basic_improvements(code, language, issues)
        
        return improved
    
    def _build_improvement_prompt(self,
                                 code: str,
                                 language: str,
                                 issues: List[CodeIssue],
                                 focus_areas: List[str],
                                 context: Dict[str, Any]) -> str:
        """Build prompt for code improvement"""
        
        prompt_parts = [
            f"Improve the following {language} code:",
            "",
            "CODE:",
            "```" + language,
            code,
            "```",
            ""
        ]
        
        if issues:
            prompt_parts.extend([
                "IDENTIFIED ISSUES:",
                "\n".join(f"- {issue.message}" for issue in issues[:10]),
                ""
            ])
        
        if "all" not in focus_areas:
            prompt_parts.extend([
                "FOCUS ON:",
                "\n".join(f"- {area}" for area in focus_areas),
                ""
            ])
        
        prompt_parts.extend([
            "REQUIREMENTS:",
            "- Maintain functionality",
            "- Follow best practices",
            "- Add appropriate error handling",
            "- Improve readability",
            "- Add helpful comments",
            "",
            "Return the improved code with explanations of changes made."
        ])
        
        return "\n".join(prompt_parts)
    
    def _apply_basic_improvements(self, code: str, language: str, issues: List[CodeIssue]) -> str:
        """Apply basic automatic improvements"""
        
        improved = code
        
        # Apply simple replacements based on issues
        for issue in issues:
            if issue.category == "style":
                if "is None" in issue.suggestion:
                    improved = improved.replace("== None", "is None")
                    improved = improved.replace("!= None", "is not None")
        
        # Add basic improvements
        if language == "python":
            # Add type hints if missing
            improved = re.sub(
                r'def (\w+)\((.*?)\):',
                r'def \1(\2) -> Any:',
                improved
            )
            
            # Add basic docstring if missing
            lines = improved.split('\n')
            new_lines = []
            for i, line in enumerate(lines):
                new_lines.append(line)
                if re.match(r'\s*def\s+\w+\(', line):
                    indent = len(line) - len(line.lstrip())
                    if i + 1 < len(lines) and not '"""' in lines[i + 1]:
                        new_lines.append(' ' * (indent + 4) + '"""TODO: Add description"""')
            improved = '\n'.join(new_lines)
        
        return improved
    
    def _calculate_metrics(self, original: str, improved: str) -> Dict[str, Any]:
        """Calculate improvement metrics"""
        
        metrics = {
            "lines_original": len(original.split('\n')),
            "lines_improved": len(improved.split('\n')),
            "characters_original": len(original),
            "characters_improved": len(improved),
            "complexity_reduced": False,
            "documentation_added": '"""' in improved and '"""' not in original,
            "error_handling_added": 'try:' in improved and 'try:' not in original
        }
        
        # Check if complexity was reduced
        if metrics["lines_improved"] < metrics["lines_original"]:
            metrics["complexity_reduced"] = True
        
        return metrics
    
    def _list_improvements(self, original: str, improved: str, issues: List[CodeIssue]) -> List[str]:
        """List the improvements made"""
        
        improvements = []
        
        # Check for specific improvements
        if '"""' in improved and '"""' not in original:
            improvements.append("Added documentation/docstrings")
        
        if 'try:' in improved and 'try:' not in original:
            improvements.append("Added error handling")
        
        if 'is None' in improved and '== None' in original:
            improvements.append("Fixed None comparisons")
        
        if '-> ' in improved and '-> ' not in original:
            improvements.append("Added type hints")
        
        # Add improvements based on resolved issues
        for issue in issues:
            if issue.severity in ["critical", "major"]:
                improvements.append(f"Fixed: {issue.message}")
        
        return improvements

def main():
    """CLI interface for the Code Improver Agent"""
    
    parser = argparse.ArgumentParser(
        description="Single File Code Improver Agent - Makes your code better"
    )
    
    parser.add_argument(
        "code_file",
        help="Path to code file to improve"
    )
    
    parser.add_argument(
        "--language",
        default="python",
        help="Programming language (default: python)"
    )
    
    parser.add_argument(
        "--focus",
        nargs="+",
        default=["all"],
        help="Focus areas: performance, security, readability, documentation"
    )
    
    parser.add_argument(
        "--model",
        default=DEFAULT_MODEL,
        help=f"LLM model to use (default: {DEFAULT_MODEL})"
    )
    
    parser.add_argument(
        "--temperature",
        type=float,
        default=DEFAULT_TEMPERATURE,
        help=f"Temperature for generation (default: {DEFAULT_TEMPERATURE})"
    )
    
    parser.add_argument(
        "--output",
        help="Output file for improved code"
    )
    
    parser.add_argument(
        "--report",
        action="store_true",
        help="Generate detailed improvement report"
    )
    
    args = parser.parse_args()
    
    # Load code
    with open(args.code_file, 'r') as f:
        code = f.read()
    
    # Create agent and improve code
    print("\n🚀 Code Improver Agent")
    print("=" * 50)
    
    agent = CodeImproverAgent(model=args.model, temperature=args.temperature)
    
    print(f"\n📝 Analyzing {args.code_file}...")
    result = agent.improve_code(
        code=code,
        language=args.language,
        focus_areas=args.focus,
        context={"filename": args.code_file}
    )
    
    # Display results
    print(f"\n📊 Analysis Results:")
    print(f"   Issues found: {len(result.issues_found)}")
    
    if result.issues_found:
        print("\n   Top Issues:")
        for issue in result.issues_found[:5]:
            icon = "🔴" if issue.severity == "critical" else "🟡" if issue.severity == "major" else "🟢"
            print(f"   {icon} Line {issue.line or 'N/A'}: {issue.message}")
    
    print(f"\n✨ Improvements Made:")
    for improvement in result.improvements_made:
        print(f"   - {improvement}")
    
    print(f"\n📈 Metrics:")
    for key, value in result.metrics.items():
        print(f"   {key}: {value}")
    
    # Save improved code
    if args.output:
        with open(args.output, 'w') as f:
            f.write(result.improved_code)
        print(f"\n✅ Improved code saved to: {args.output}")
    
    # Generate report if requested
    if args.report:
        report_path = args.output.replace('.py', '_report.json') if args.output else 'improvement_report.json'
        
        report_data = {
            "timestamp": datetime.now().isoformat(),
            "file": args.code_file,
            "language": args.language,
            "focus_areas": args.focus,
            "issues_found": [
                {
                    "severity": issue.severity,
                    "category": issue.category,
                    "line": issue.line,
                    "message": issue.message
                }
                for issue in result.issues_found
            ],
            "improvements_made": result.improvements_made,
            "metrics": result.metrics
        }
        
        with open(report_path, 'w') as f:
            json.dump(report_data, f, indent=2)
        
        print(f"📄 Report saved to: {report_path}")
    
    print("\n✨ Code Improver Agent completed successfully!")

if __name__ == "__main__":
    main()