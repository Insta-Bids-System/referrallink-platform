"""
Load environment variables from .env file
This module should be imported at the beginning of agent scripts
"""

import os
from pathlib import Path
from dotenv import load_dotenv

def load_api_keys():
    """Load API keys from .env file"""
    
    # Find .env file in project root
    env_path = Path(__file__).parent.parent / '.env'
    
    if env_path.exists():
        # Load environment variables from .env file
        load_dotenv(env_path)
        
        # Check if keys are loaded
        openai_key = os.getenv('OPENAI_API_KEY')
        anthropic_key = os.getenv('ANTHROPIC_API_KEY')
        
        if openai_key and openai_key != 'your_openai_api_key_here':
            print("[OK] OpenAI API key loaded")
        else:
            print("[WARNING] OpenAI API key not configured in .env")
            
        if anthropic_key and anthropic_key != 'your_anthropic_api_key_here':
            print("[OK] Anthropic API key loaded")
        else:
            print("[WARNING] Anthropic API key not configured in .env")
            
        return {
            'openai': openai_key,
            'anthropic': anthropic_key,
            'model': os.getenv('DEFAULT_MODEL', 'gpt-4o'),
            'temperature': float(os.getenv('DEFAULT_TEMPERATURE', '0.7'))
        }
    else:
        print(f"[WARNING] .env file not found at {env_path}")
        print("Please create .env file with your API keys")
        return None

# Auto-load when imported
if __name__ != "__main__":
    load_api_keys()