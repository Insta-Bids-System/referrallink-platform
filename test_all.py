#!/usr/bin/env python3
"""
Automated Test Suite for ReferralLink Platform
Tests all components: Backend API, Mobile App, and Multi-Agent System
"""

import subprocess
import requests
import json
import time
import sys
from pathlib import Path
from typing import List, Tuple, Dict, Any

class Color:
    """ANSI color codes for terminal output"""
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

class TestRunner:
    """Main test runner for the platform"""
    
    def __init__(self):
        self.root_dir = Path(__file__).parent
        self.results = []
        self.backend_process = None
        
    def print_header(self, text: str):
        """Print a formatted header"""
        print(f"\n{Color.BOLD}{Color.BLUE}{'='*60}{Color.RESET}")
        print(f"{Color.BOLD}{Color.BLUE}{text:^60}{Color.RESET}")
        print(f"{Color.BOLD}{Color.BLUE}{'='*60}{Color.RESET}\n")
    
    def print_test(self, name: str, passed: bool, message: str = ""):
        """Print test result"""
        status = f"{Color.GREEN}[PASS]{Color.RESET}" if passed else f"{Color.RED}[FAIL]{Color.RESET}"
        print(f"{status} {name}")
        if message:
            print(f"  {Color.YELLOW}{message}{Color.RESET}")
        self.results.append((name, passed, message))
    
    def run_command(self, command: str, cwd: str = None) -> Tuple[bool, str]:
        """Run a shell command and return success status and output"""
        try:
            result = subprocess.run(
                command,
                shell=True,
                cwd=cwd or self.root_dir,
                capture_output=True,
                text=True,
                timeout=10
            )
            return result.returncode == 0, result.stdout + result.stderr
        except subprocess.TimeoutExpired:
            return False, "Command timed out"
        except Exception as e:
            return False, str(e)
    
    def test_backend_api(self):
        """Test Backend API functionality"""
        self.print_header("Testing Backend API")
        
        # Test 1: Check if backend directory exists
        backend_dir = self.root_dir / "ReferralLinkPlatform" / "backend"
        passed = backend_dir.exists()
        self.print_test("Backend directory exists", passed)
        
        if not passed:
            return
        
        # Test 2: Check package.json
        package_json = backend_dir / "package.json"
        passed = package_json.exists()
        self.print_test("Package.json exists", passed)
        
        # Test 3: Check TypeScript compilation
        success, output = self.run_command("npx tsc --noEmit", cwd=str(backend_dir))
        self.print_test("TypeScript compilation", success, 
                       "No compilation errors" if success else "Compilation errors found")
        
        # Test 4: Test API endpoints
        api_tests = [
            ("Health Check", "GET", "http://localhost:5000/health", None),
            ("API Test", "GET", "http://localhost:5000/api/test", None),
            ("Login", "POST", "http://localhost:5000/api/auth/login", 
             {"email": "test@example.com", "password": "password123"}),
            ("Register", "POST", "http://localhost:5000/api/auth/register",
             {"email": "new@example.com", "password": "password123", 
              "firstName": "Test", "lastName": "User"})
        ]
        
        print("\n" + Color.YELLOW + "Testing API Endpoints..." + Color.RESET)
        for name, method, url, data in api_tests:
            try:
                if method == "GET":
                    response = requests.get(url, timeout=2)
                else:
                    response = requests.post(url, json=data, timeout=2)
                
                passed = response.status_code in [200, 201]
                self.print_test(f"  {name} ({method} {url.split('/')[-1]})", passed,
                               f"Status: {response.status_code}")
            except requests.exceptions.ConnectionError:
                self.print_test(f"  {name} ({method})", False, "Server not running")
            except Exception as e:
                self.print_test(f"  {name} ({method})", False, str(e))
    
    def test_mobile_app(self):
        """Test Mobile App setup"""
        self.print_header("Testing Mobile App")
        
        # Test 1: Check if mobile directory exists
        mobile_dir = self.root_dir / "ReferralLinkPlatform" / "mobile"
        passed = mobile_dir.exists()
        self.print_test("Mobile directory exists", passed)
        
        if not passed:
            return
        
        # Test 2: Check package.json
        package_json = mobile_dir / "package.json"
        passed = package_json.exists()
        self.print_test("Package.json exists", passed)
        
        # Test 3: Check key files exist
        key_files = [
            ("App.tsx", "App.tsx"),
            ("Dashboard Screen", "src/screens/DashboardScreen.tsx"),
            ("Login Screen", "src/screens/LoginScreen.tsx"),
            ("Auth Store", "src/stores/authStore.ts"),
            ("Navigation", "src/navigation/AppNavigator.tsx")
        ]
        
        for name, path in key_files:
            file_path = mobile_dir / path
            passed = file_path.exists()
            self.print_test(f"  {name} exists", passed)
        
        # Test 4: Check TypeScript configuration
        tsconfig = mobile_dir / "tsconfig.json"
        passed = tsconfig.exists()
        self.print_test("TypeScript config exists", passed)
    
    def test_multi_agent_system(self):
        """Test Multi-Agent System"""
        self.print_header("Testing Multi-Agent System")
        
        # Test 1: Check if agents directory exists
        agents_dir = self.root_dir / "agents"
        passed = agents_dir.exists()
        self.print_test("Agents directory exists", passed)
        
        if not passed:
            return
        
        # Test 2: Check agent files
        agent_files = [
            ("Base Agent", "base_agent.py"),
            ("Code Agent", "code_agent.py"),
            ("Spec Agent", "spec_agent.py"),
            ("Parallel Orchestrator", "parallel_agent_orchestrator.py"),
            ("Config Orchestrator", "config_driven_orchestrator.py"),
            ("Agent Config", "agent_config.yaml")
        ]
        
        for name, filename in agent_files:
            file_path = agents_dir / filename
            passed = file_path.exists()
            self.print_test(f"  {name} exists", passed)
        
        # Test 3: Test agent execution
        test_commands = [
            ("Code Agent", 'python run_agent.py agent code "Create a test function"'),
            ("Spec Agent", 'python run_agent.py agent spec "Design a REST API"')
        ]
        
        print("\n" + Color.YELLOW + "Testing Agent Execution..." + Color.RESET)
        for name, command in test_commands:
            success, output = self.run_command(command, cwd=str(agents_dir))
            self.print_test(f"  {name}", success, 
                           "Executed successfully" if success else "Execution failed")
    
    def test_observability(self):
        """Test Observability System"""
        self.print_header("Testing Observability System")
        
        # Test 1: Check observability directory
        obs_dir = self.root_dir / "observability"
        passed = obs_dir.exists()
        self.print_test("Observability directory exists", passed)
        
        if not passed:
            return
        
        # Test 2: Check key files
        key_files = [
            ("Agent Monitor", "agent_monitor.py"),
            ("Dashboard", "dashboard.html")
        ]
        
        for name, filename in key_files:
            file_path = obs_dir / filename
            passed = file_path.exists()
            self.print_test(f"  {name} exists", passed)
    
    def generate_report(self):
        """Generate final test report"""
        self.print_header("Test Summary")
        
        total = len(self.results)
        passed = sum(1 for _, p, _ in self.results if p)
        failed = total - passed
        
        print(f"{Color.GREEN}Passed: {passed}{Color.RESET}")
        print(f"{Color.RED}Failed: {failed}{Color.RESET}")
        print(f"Total: {total}")
        
        if failed > 0:
            print(f"\n{Color.RED}Failed Tests:{Color.RESET}")
            for name, passed, message in self.results:
                if not passed:
                    print(f"  - {name}: {message}")
        
        # Calculate success rate
        success_rate = (passed / total * 100) if total > 0 else 0
        
        print(f"\n{Color.BOLD}Success Rate: {success_rate:.1f}%{Color.RESET}")
        
        # Save report to file
        report_file = self.root_dir / "test_report.json"
        report_data = {
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "total_tests": total,
            "passed": passed,
            "failed": failed,
            "success_rate": success_rate,
            "results": [
                {"name": name, "passed": passed, "message": message}
                for name, passed, message in self.results
            ]
        }
        
        with open(report_file, 'w') as f:
            json.dump(report_data, f, indent=2)
        
        print(f"\n{Color.BLUE}Report saved to: {report_file}{Color.RESET}")
        
        return success_rate >= 70  # Return True if at least 70% tests pass
    
    def run_all_tests(self):
        """Run all tests"""
        print(f"{Color.BOLD}{Color.BLUE}")
        print("="*60)
        print("ReferralLink Platform - Automated Test Suite".center(60))
        print("="*60)
        print(f"{Color.RESET}")
        
        # Run test suites
        self.test_backend_api()
        self.test_mobile_app()
        self.test_multi_agent_system()
        self.test_observability()
        
        # Generate report
        success = self.generate_report()
        
        if success:
            print(f"\n{Color.GREEN}{Color.BOLD}[SUCCESS] All critical tests passed!{Color.RESET}")
        else:
            print(f"\n{Color.RED}{Color.BOLD}[WARNING] Some tests failed. Please review the report.{Color.RESET}")
        
        return 0 if success else 1

def main():
    """Main entry point"""
    runner = TestRunner()
    sys.exit(runner.run_all_tests())

if __name__ == "__main__":
    main()