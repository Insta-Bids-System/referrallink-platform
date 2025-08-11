#!/usr/bin/env python3
"""
Test script to verify API keys are working
"""

import os
import sys
from pathlib import Path

# Add agents directory to path
sys.path.append(str(Path(__file__).parent / "agents"))

# Load environment variables
from load_env import load_api_keys

def test_openai_key():
    """Test OpenAI API key"""
    try:
        import openai
        
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key or api_key == 'your_openai_api_key_here':
            print("[ERROR] OpenAI API key not configured")
            return False
            
        # Note: Actually calling the API would incur costs
        # This just validates the key format
        if api_key.startswith('sk-'):
            print("[OK] OpenAI API key format looks valid")
            print(f"    Key starts with: {api_key[:10]}...")
            return True
        else:
            print("[ERROR] OpenAI API key format invalid")
            return False
            
    except Exception as e:
        print(f"[ERROR] Testing OpenAI key: {e}")
        return False

def test_anthropic_key():
    """Test Anthropic API key"""
    try:
        api_key = os.getenv('ANTHROPIC_API_KEY')
        if not api_key or api_key == 'your_anthropic_api_key_here':
            print("[ERROR] Anthropic API key not configured")
            return False
            
        # Note: Actually calling the API would incur costs
        # This just validates the key format
        if api_key.startswith('sk-ant-'):
            print("[OK] Anthropic API key format looks valid")
            print(f"    Key starts with: {api_key[:15]}...")
            return True
        else:
            print("[ERROR] Anthropic API key format invalid")
            return False
            
    except Exception as e:
        print(f"[ERROR] Testing Anthropic key: {e}")
        return False

def main():
    print("="*50)
    print("API Keys Verification")
    print("="*50)
    
    # Load keys from .env
    keys = load_api_keys()
    
    if not keys:
        print("\n[ERROR] Failed to load API keys from .env")
        return
    
    print("\n" + "="*50)
    print("Testing API Keys")
    print("="*50)
    
    # Test OpenAI
    print("\nOpenAI API Key:")
    openai_ok = test_openai_key()
    
    # Test Anthropic
    print("\nAnthropic API Key:")
    anthropic_ok = test_anthropic_key()
    
    print("\n" + "="*50)
    print("Summary")
    print("="*50)
    
    if openai_ok and anthropic_ok:
        print("\n[SUCCESS] Both API keys are configured correctly!")
        print("\nYou can now use the multi-agent system with:")
        print("  python run_parallel_agents.py")
    elif openai_ok:
        print("\n[PARTIAL] Only OpenAI API key is configured")
        print("You can use OpenAI-based agents")
    elif anthropic_ok:
        print("\n[PARTIAL] Only Anthropic API key is configured")
        print("You can use Claude-based agents")
    else:
        print("\n[ERROR] No valid API keys found")
        print("Please check your .env file and API_SETUP_GUIDE.md")
    
    print("\nModel Settings:")
    print(f"  Default Model: {keys['model']}")
    print(f"  Temperature: {keys['temperature']}")

if __name__ == "__main__":
    main()