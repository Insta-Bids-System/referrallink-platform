#!/usr/bin/env python3
"""
Example workflow demonstrating AI agent usage
Following IndyDevDan's approach to AI-assisted development
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'agents'))

from run_agent import AgentRunner
from code_agent import CodeAgent
from spec_agent import SpecAgent

def example_feature_development():
    """Example: Develop a complete feature using AI agents"""
    
    print("🚀 AI-Assisted Feature Development Example")
    print("=" * 50)
    
    # Initialize runner
    runner = AgentRunner()
    
    # Step 1: Create a specification
    feature_description = """
    Create a real-time notification system that:
    - Supports multiple notification channels (email, SMS, push)
    - Has user preference management
    - Includes delivery tracking
    - Handles retry logic for failed deliveries
    """
    
    print("\n📝 Step 1: Creating Specification...")
    spec = runner.run_agent("spec", feature_description, {
        "spec_type": "feature",
        "requirements": [
            "Must support at least 10,000 notifications per minute",
            "Must have 99.9% delivery success rate",
            "Must respect user timezone preferences"
        ]
    })
    
    print("✅ Specification created!")
    
    # Step 2: Generate implementation
    print("\n💻 Step 2: Generating Implementation...")
    implementation = runner.run_agent("code", 
        "Implement notification system based on specification", {
        "specifications": spec,
        "language": "python",
        "requirements": [
            "Use asyncio for concurrent processing",
            "Implement circuit breaker pattern",
            "Add comprehensive logging"
        ]
    })
    
    print("✅ Implementation generated!")
    
    # Step 3: Generate tests
    print("\n🧪 Step 3: Generating Tests...")
    code_agent = CodeAgent()
    tests = code_agent.add_tests(implementation, "python", "pytest")
    
    print("✅ Tests generated!")
    
    # Step 4: Generate documentation
    print("\n📚 Step 4: Generating Documentation...")
    docs = code_agent.document_code(implementation, "python", "docstring")
    
    print("✅ Documentation generated!")
    
    # Save outputs
    print("\n💾 Saving outputs...")
    outputs_dir = os.path.join(os.path.dirname(__file__), '..', 'outputs')
    os.makedirs(outputs_dir, exist_ok=True)
    
    with open(os.path.join(outputs_dir, 'notification_spec.md'), 'w') as f:
        f.write(spec)
    
    with open(os.path.join(outputs_dir, 'notification_system.py'), 'w') as f:
        f.write(implementation)
    
    with open(os.path.join(outputs_dir, 'test_notification_system.py'), 'w') as f:
        f.write(tests)
    
    print("✅ All outputs saved to outputs/ directory!")
    
    print("\n" + "=" * 50)
    print("🎉 Feature development completed successfully!")
    print("\nNext steps:")
    print("1. Review generated code in outputs/")
    print("2. Run tests: pytest outputs/test_notification_system.py")
    print("3. Integrate into your project")
    print("4. Use 'aider' for any modifications")

def example_code_refactoring():
    """Example: Refactor existing code using AI"""
    
    print("\n🔧 AI-Assisted Code Refactoring Example")
    print("=" * 50)
    
    # Sample legacy code
    legacy_code = """
def process_data(data):
    result = []
    for i in range(len(data)):
        if data[i] > 0:
            temp = data[i] * 2
            if temp < 100:
                result.append(temp)
            else:
                result.append(100)
    return result
"""
    
    print("Original code:")
    print(legacy_code)
    
    code_agent = CodeAgent()
    
    improvements = [
        "Use list comprehension for better readability",
        "Add type hints",
        "Add docstring",
        "Use more descriptive variable names",
        "Follow PEP 8 style guidelines"
    ]
    
    print("\n🔄 Refactoring with improvements:")
    for improvement in improvements:
        print(f"  - {improvement}")
    
    refactored = code_agent.refactor_code(legacy_code, "python", improvements)
    
    print("\n✅ Refactored code generated!")
    print("\nSee outputs/refactored_code.py for results")
    
    # Save output
    outputs_dir = os.path.join(os.path.dirname(__file__), '..', 'outputs')
    os.makedirs(outputs_dir, exist_ok=True)
    
    with open(os.path.join(outputs_dir, 'refactored_code.py'), 'w') as f:
        f.write(refactored)

def example_api_development():
    """Example: Design and implement an API"""
    
    print("\n🌐 AI-Assisted API Development Example")
    print("=" * 50)
    
    runner = AgentRunner()
    
    api_description = """
    Design a RESTful API for a task management system with:
    - CRUD operations for tasks
    - User authentication
    - Task assignment and collaboration
    - Due date tracking and reminders
    - Search and filtering capabilities
    """
    
    print("📝 Creating API Specification...")
    api_spec = runner.run_agent("spec", api_description, {
        "spec_type": "api",
        "base_url": "https://api.taskmanager.com/v1",
        "auth": "JWT Bearer tokens"
    })
    
    print("✅ API Specification created!")
    
    print("\n💻 Generating API Implementation...")
    api_code = runner.run_agent("code", 
        "Implement the API based on specification using FastAPI", {
        "specifications": api_spec,
        "language": "python",
        "requirements": [
            "Use FastAPI framework",
            "Include request validation",
            "Add OpenAPI documentation",
            "Implement pagination"
        ]
    })
    
    print("✅ API Implementation generated!")
    
    # Save outputs
    outputs_dir = os.path.join(os.path.dirname(__file__), '..', 'outputs')
    os.makedirs(outputs_dir, exist_ok=True)
    
    with open(os.path.join(outputs_dir, 'api_spec.md'), 'w') as f:
        f.write(api_spec)
    
    with open(os.path.join(outputs_dir, 'api_implementation.py'), 'w') as f:
        f.write(api_code)
    
    print("\n📁 Outputs saved to outputs/ directory")
    print("Ready for implementation!")

def main():
    """Run example workflows"""
    
    print("""
╔════════════════════════════════════════════╗
║   AI-Assisted Development Examples         ║
║   Following IndyDevDan's Approach          ║
╚════════════════════════════════════════════╝
    """)
    
    print("Select an example to run:")
    print("1. Feature Development Workflow")
    print("2. Code Refactoring Example")
    print("3. API Development Example")
    print("4. Run All Examples")
    
    choice = input("\nEnter your choice (1-4): ").strip()
    
    if choice == "1":
        example_feature_development()
    elif choice == "2":
        example_code_refactoring()
    elif choice == "3":
        example_api_development()
    elif choice == "4":
        example_feature_development()
        example_code_refactoring()
        example_api_development()
    else:
        print("Invalid choice. Please run again and select 1-4.")
        sys.exit(1)
    
    print("\n" + "=" * 50)
    print("🎓 Examples completed!")
    print("\nLearn more:")
    print("- Check outputs/ directory for generated files")
    print("- Read prompts/PROMPT_ENGINEERING.md for tips")
    print("- Run 'aider' for interactive AI coding")
    print("- Watch IndyDevDan's videos for advanced techniques")

if __name__ == "__main__":
    main()