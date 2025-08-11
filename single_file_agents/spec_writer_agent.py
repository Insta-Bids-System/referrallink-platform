#!/usr/bin/env python3
"""
Single File Specification Writer Agent
Following IndyDevDan's principle: "One agent, one file, one purpose"
This agent creates detailed technical specifications from requirements
"""

import os
import sys
import json
import argparse
from typing import Dict, Any, Optional
from datetime import datetime

# Configuration
DEFAULT_MODEL = os.getenv("DEFAULT_MODEL", "gpt-4o")
DEFAULT_TEMPERATURE = float(os.getenv("DEFAULT_TEMPERATURE", "0.5"))
API_KEY = os.getenv("OPENAI_API_KEY") or os.getenv("ANTHROPIC_API_KEY")

SYSTEM_PROMPT = """You are an expert technical specification writer.
Your role is to create detailed, actionable specifications that developers can implement.

Your specifications should include:
1. Clear objectives and success criteria
2. User stories with acceptance criteria
3. Technical requirements and constraints
4. Architecture and design decisions
5. Data models and API contracts
6. Testing and validation strategies
7. Timeline and milestones

Make specifications comprehensive but concise.
Use clear, unambiguous language.
Include specific examples where helpful."""

SPEC_TEMPLATE = """# Technical Specification

## 1. Overview
### Purpose
{purpose}

### Scope
{scope}

### Success Criteria
{success_criteria}

## 2. User Stories
{user_stories}

## 3. Functional Requirements
{functional_requirements}

## 4. Non-Functional Requirements
{non_functional_requirements}

## 5. Technical Architecture
### System Design
{system_design}

### Data Model
{data_model}

### API Specification
{api_specification}

## 6. Implementation Plan
### Phases
{implementation_phases}

### Dependencies
{dependencies}

### Risks and Mitigations
{risks}

## 7. Testing Strategy
{testing_strategy}

## 8. Acceptance Criteria
{acceptance_criteria}

## 9. Timeline
{timeline}
"""

class SpecWriterAgent:
    """Single-purpose agent for writing technical specifications"""
    
    def __init__(self, model: str = DEFAULT_MODEL, temperature: float = DEFAULT_TEMPERATURE):
        self.model = model
        self.temperature = temperature
        self.api_key = API_KEY
        
        if not self.api_key:
            raise ValueError("API key not found. Set OPENAI_API_KEY or ANTHROPIC_API_KEY")
    
    def create_specification(self, requirements: str, context: Optional[Dict[str, Any]] = None) -> str:
        """
        Create a detailed technical specification from requirements
        
        Args:
            requirements: Natural language description of what needs to be built
            context: Additional context (e.g., existing system, constraints)
        
        Returns:
            Formatted technical specification
        """
        
        context = context or {}
        
        # Build the prompt
        prompt = self._build_prompt(requirements, context)
        
        # Call LLM (placeholder - implement actual API call)
        spec_content = self._generate_spec(prompt)
        
        # Format into template
        formatted_spec = self._format_specification(spec_content)
        
        return formatted_spec
    
    def _build_prompt(self, requirements: str, context: Dict[str, Any]) -> str:
        """Build the prompt for specification generation"""
        
        prompt_parts = [
            "Create a detailed technical specification for the following requirements:",
            "",
            "REQUIREMENTS:",
            requirements,
            ""
        ]
        
        if context.get("existing_system"):
            prompt_parts.extend([
                "EXISTING SYSTEM:",
                context["existing_system"],
                ""
            ])
        
        if context.get("constraints"):
            prompt_parts.extend([
                "CONSTRAINTS:",
                "\n".join(f"- {c}" for c in context["constraints"]),
                ""
            ])
        
        if context.get("technology_stack"):
            prompt_parts.extend([
                "TECHNOLOGY STACK:",
                context["technology_stack"],
                ""
            ])
        
        prompt_parts.extend([
            "Generate a comprehensive specification that includes all sections mentioned in the template.",
            "Be specific and actionable. Include concrete examples where appropriate."
        ])
        
        return "\n".join(prompt_parts)
    
    def _generate_spec(self, prompt: str) -> Dict[str, str]:
        """Generate specification content using LLM"""
        
        # TODO: Implement actual LLM API call here
        # This is a placeholder that returns example content
        
        print(f"🤖 Generating specification with {self.model}...")
        print(f"   Temperature: {self.temperature}")
        print(f"   Prompt length: {len(prompt)} characters")
        
        # Simulated response
        return {
            "purpose": "Build a robust, scalable system based on the provided requirements",
            "scope": "Complete end-to-end implementation including backend, frontend, and infrastructure",
            "success_criteria": "- All functional requirements met\n- Performance targets achieved\n- Security standards implemented\n- 95% test coverage",
            "user_stories": "- As a user, I want to [action] so that [benefit]\n- As an admin, I want to [action] so that [benefit]",
            "functional_requirements": "- FR1: System shall [requirement]\n- FR2: System shall [requirement]\n- FR3: System shall [requirement]",
            "non_functional_requirements": "- Performance: <200ms response time\n- Availability: 99.9% uptime\n- Security: OAuth2 authentication\n- Scalability: Support 10,000 concurrent users",
            "system_design": "Microservices architecture with API Gateway, separate services for each domain",
            "data_model": "```sql\nCREATE TABLE entities (\n  id UUID PRIMARY KEY,\n  name VARCHAR(255),\n  created_at TIMESTAMP\n);\n```",
            "api_specification": "```yaml\npaths:\n  /api/v1/resources:\n    get:\n      summary: List resources\n    post:\n      summary: Create resource\n```",
            "implementation_phases": "1. Phase 1: Core infrastructure (Week 1-2)\n2. Phase 2: API development (Week 3-4)\n3. Phase 3: Frontend (Week 5-6)\n4. Phase 4: Testing & deployment (Week 7-8)",
            "dependencies": "- External API service\n- Database infrastructure\n- Authentication service",
            "risks": "- Risk 1: API latency | Mitigation: Implement caching\n- Risk 2: Data migration | Mitigation: Phased rollout",
            "testing_strategy": "- Unit tests: 90% coverage\n- Integration tests: All API endpoints\n- E2E tests: Critical user flows\n- Performance tests: Load testing",
            "acceptance_criteria": "- [ ] All features implemented\n- [ ] Tests passing\n- [ ] Documentation complete\n- [ ] Performance benchmarks met",
            "timeline": "Total: 8 weeks\n- Planning: 1 week\n- Development: 5 weeks\n- Testing: 1 week\n- Deployment: 1 week"
        }
    
    def _format_specification(self, content: Dict[str, str]) -> str:
        """Format specification content into template"""
        
        return SPEC_TEMPLATE.format(**content)
    
    def validate_specification(self, spec: str) -> Dict[str, Any]:
        """Validate that specification meets quality standards"""
        
        validation_results = {
            "is_valid": True,
            "warnings": [],
            "errors": [],
            "completeness": 0
        }
        
        # Check for required sections
        required_sections = [
            "Overview", "User Stories", "Functional Requirements",
            "Technical Architecture", "Testing Strategy", "Timeline"
        ]
        
        sections_found = 0
        for section in required_sections:
            if section in spec:
                sections_found += 1
            else:
                validation_results["warnings"].append(f"Missing section: {section}")
        
        validation_results["completeness"] = (sections_found / len(required_sections)) * 100
        
        # Check specification length
        if len(spec) < 1000:
            validation_results["warnings"].append("Specification seems too short")
        
        # Check for placeholders
        if "{" in spec or "TODO" in spec or "TBD" in spec:
            validation_results["warnings"].append("Specification contains placeholders")
        
        if validation_results["errors"]:
            validation_results["is_valid"] = False
        
        return validation_results

def main():
    """CLI interface for the Spec Writer Agent"""
    
    parser = argparse.ArgumentParser(
        description="Single File Specification Writer Agent - Creates detailed technical specs"
    )
    
    parser.add_argument(
        "requirements",
        help="Requirements description (or path to requirements file)"
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
        help="Output file path (default: stdout)"
    )
    
    parser.add_argument(
        "--context",
        help="Additional context as JSON"
    )
    
    parser.add_argument(
        "--validate",
        action="store_true",
        help="Validate the generated specification"
    )
    
    args = parser.parse_args()
    
    # Load requirements
    if os.path.exists(args.requirements):
        with open(args.requirements, 'r') as f:
            requirements = f.read()
    else:
        requirements = args.requirements
    
    # Parse context
    context = {}
    if args.context:
        context = json.loads(args.context)
    
    # Create agent and generate specification
    print("\n🚀 Spec Writer Agent")
    print("=" * 50)
    
    agent = SpecWriterAgent(model=args.model, temperature=args.temperature)
    
    print(f"\n📝 Generating specification...")
    spec = agent.create_specification(requirements, context)
    
    # Validate if requested
    if args.validate:
        print(f"\n🔍 Validating specification...")
        validation = agent.validate_specification(spec)
        print(f"   Completeness: {validation['completeness']:.0f}%")
        if validation['warnings']:
            print("   ⚠️  Warnings:")
            for warning in validation['warnings']:
                print(f"      - {warning}")
    
    # Output specification
    if args.output:
        with open(args.output, 'w') as f:
            f.write(spec)
        print(f"\n✅ Specification saved to: {args.output}")
    else:
        print("\n" + "=" * 50)
        print("GENERATED SPECIFICATION")
        print("=" * 50)
        print(spec)
    
    print("\n✨ Spec Writer Agent completed successfully!")

if __name__ == "__main__":
    main()