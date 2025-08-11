"""
Specification Agent - Creates detailed specifications from requirements
Following IndyDevDan's spec-first approach to AI coding
"""

from typing import Dict, Any, List, Optional
from base_agent import BaseAgent, AgentConfig, AgentRole

class SpecAgent(BaseAgent):
    """Agent specialized in creating technical specifications"""
    
    def __init__(self, name: str = "SpecAgent"):
        config = AgentConfig(
            name=name,
            role=AgentRole.ARCHITECT,
            temperature=0.5,
            max_tokens=6000,
            system_prompt="""You are an expert technical specification writer. 
            You create detailed, actionable specifications that AI agents and developers can follow.
            Your specifications are clear, comprehensive, and include all necessary details for implementation."""
        )
        super().__init__(config)
    
    def process_task(self, task: str, context: Optional[Dict[str, Any]] = None) -> str:
        """Process a specification creation task"""
        context = context or {}
        
        spec_type = context.get("spec_type", "feature")
        spec = self._create_specification(task, spec_type, context)
        
        self.add_message("user", task)
        self.add_message("assistant", spec)
        
        return spec
    
    def _create_specification(self, task: str, spec_type: str, context: Dict[str, Any]) -> str:
        """Create a detailed specification"""
        
        if spec_type == "feature":
            return self._create_feature_spec(task, context)
        elif spec_type == "api":
            return self._create_api_spec(task, context)
        elif spec_type == "database":
            return self._create_database_spec(task, context)
        elif spec_type == "architecture":
            return self._create_architecture_spec(task, context)
        else:
            return self._create_general_spec(task, context)
    
    def _create_feature_spec(self, task: str, context: Dict[str, Any]) -> str:
        """Create a feature specification"""
        template = """# Feature Specification

## Overview
{overview}

## User Stories
{user_stories}

## Functional Requirements
{functional_requirements}

## Non-Functional Requirements
{non_functional_requirements}

## Technical Implementation
{technical_implementation}

## Acceptance Criteria
{acceptance_criteria}

## Dependencies
{dependencies}

## Testing Strategy
{testing_strategy}

## Timeline & Milestones
{timeline}
"""
        
        # Build specification components
        spec_data = {
            "overview": f"Feature: {task}",
            "user_stories": self._generate_user_stories(task, context),
            "functional_requirements": self._generate_functional_requirements(task, context),
            "non_functional_requirements": self._generate_non_functional_requirements(context),
            "technical_implementation": self._generate_technical_details(task, context),
            "acceptance_criteria": self._generate_acceptance_criteria(task, context),
            "dependencies": context.get("dependencies", "- None identified"),
            "testing_strategy": self._generate_testing_strategy(context),
            "timeline": context.get("timeline", "- Phase 1: Planning (1 week)\n- Phase 2: Implementation (2 weeks)\n- Phase 3: Testing (1 week)")
        }
        
        return template.format(**spec_data)
    
    def _create_api_spec(self, task: str, context: Dict[str, Any]) -> str:
        """Create an API specification"""
        template = """# API Specification

## API Overview
{overview}

## Base URL
{base_url}

## Authentication
{authentication}

## Endpoints

{endpoints}

## Request/Response Formats
{formats}

## Error Handling
{error_handling}

## Rate Limiting
{rate_limiting}

## Versioning
{versioning}

## Examples
{examples}
"""
        
        spec_data = {
            "overview": f"API for: {task}",
            "base_url": context.get("base_url", "https://api.example.com/v1"),
            "authentication": context.get("auth", "Bearer token authentication"),
            "endpoints": self._generate_endpoints(task, context),
            "formats": "JSON for all requests and responses",
            "error_handling": self._generate_error_handling(),
            "rate_limiting": "1000 requests per hour per API key",
            "versioning": "URL-based versioning (e.g., /v1/, /v2/)",
            "examples": self._generate_api_examples(task, context)
        }
        
        return template.format(**spec_data)
    
    def _create_database_spec(self, task: str, context: Dict[str, Any]) -> str:
        """Create a database specification"""
        template = """# Database Specification

## Overview
{overview}

## Database Type
{db_type}

## Schema Design

{schema}

## Indexes
{indexes}

## Relationships
{relationships}

## Constraints
{constraints}

## Migration Strategy
{migration}

## Backup & Recovery
{backup}

## Performance Considerations
{performance}
"""
        
        spec_data = {
            "overview": f"Database design for: {task}",
            "db_type": context.get("db_type", "PostgreSQL"),
            "schema": self._generate_schema(task, context),
            "indexes": self._generate_indexes(context),
            "relationships": self._generate_relationships(context),
            "constraints": self._generate_constraints(context),
            "migration": "Use migration tools for version control",
            "backup": "Daily automated backups with 30-day retention",
            "performance": "Optimize queries, use appropriate indexes"
        }
        
        return template.format(**spec_data)
    
    def _create_architecture_spec(self, task: str, context: Dict[str, Any]) -> str:
        """Create an architecture specification"""
        template = """# Architecture Specification

## System Overview
{overview}

## Architecture Pattern
{pattern}

## Components

{components}

## Data Flow
{data_flow}

## Technology Stack
{tech_stack}

## Security Considerations
{security}

## Scalability Strategy
{scalability}

## Deployment Architecture
{deployment}

## Monitoring & Logging
{monitoring}
"""
        
        spec_data = {
            "overview": f"Architecture for: {task}",
            "pattern": context.get("pattern", "Microservices architecture"),
            "components": self._generate_components(task, context),
            "data_flow": self._generate_data_flow(context),
            "tech_stack": self._generate_tech_stack(context),
            "security": self._generate_security_considerations(context),
            "scalability": "Horizontal scaling with load balancing",
            "deployment": context.get("deployment", "Container-based deployment with Kubernetes"),
            "monitoring": "Centralized logging with monitoring dashboards"
        }
        
        return template.format(**spec_data)
    
    def _create_general_spec(self, task: str, context: Dict[str, Any]) -> str:
        """Create a general specification"""
        return f"""# Technical Specification

## Task
{task}

## Context
{context.get('description', 'No additional context provided')}

## Requirements
{self._format_requirements(context.get('requirements', []))}

## Implementation Details
{context.get('implementation', 'To be determined during development')}

## Success Criteria
{self._format_criteria(context.get('criteria', []))}
"""
    
    # Helper methods for generating specification components
    def _generate_user_stories(self, task: str, context: Dict[str, Any]) -> str:
        stories = context.get("user_stories", [])
        if not stories:
            stories = [
                f"As a user, I want to {task} so that I can achieve my goals",
                "As an admin, I want to manage this feature effectively",
                "As a developer, I want clear APIs and documentation"
            ]
        return "\n".join(f"- {story}" for story in stories)
    
    def _generate_functional_requirements(self, task: str, context: Dict[str, Any]) -> str:
        reqs = context.get("functional_requirements", [])
        if not reqs:
            reqs = [
                f"System shall {task}",
                "System shall validate all inputs",
                "System shall provide appropriate error messages",
                "System shall log all operations"
            ]
        return "\n".join(f"- {req}" for req in reqs)
    
    def _generate_non_functional_requirements(self, context: Dict[str, Any]) -> str:
        reqs = context.get("non_functional_requirements", [])
        if not reqs:
            reqs = [
                "Response time < 200ms for 95% of requests",
                "99.9% uptime availability",
                "Support for 1000 concurrent users",
                "WCAG 2.1 AA compliance for accessibility"
            ]
        return "\n".join(f"- {req}" for req in reqs)
    
    def _generate_technical_details(self, task: str, context: Dict[str, Any]) -> str:
        return context.get("technical_details", f"""
### Components
- Frontend: React/TypeScript
- Backend: Node.js/Express
- Database: PostgreSQL
- Cache: Redis

### Key Implementation Points
- Implement {task} following established patterns
- Use dependency injection for testability
- Implement comprehensive error handling
- Add monitoring and logging
""")
    
    def _generate_acceptance_criteria(self, task: str, context: Dict[str, Any]) -> str:
        criteria = context.get("acceptance_criteria", [])
        if not criteria:
            criteria = [
                f"Feature successfully implements {task}",
                "All tests pass with >90% coverage",
                "Documentation is complete",
                "Code review approved",
                "Performance benchmarks met"
            ]
        return "\n".join(f"- [ ] {criterion}" for criterion in criteria)
    
    def _generate_testing_strategy(self, context: Dict[str, Any]) -> str:
        return context.get("testing_strategy", """
- Unit tests for all components
- Integration tests for API endpoints
- End-to-end tests for critical user flows
- Performance testing under load
- Security testing for vulnerabilities
""")
    
    def _generate_endpoints(self, task: str, context: Dict[str, Any]) -> str:
        return """
### GET /resources
- Description: Retrieve resources
- Parameters: limit, offset, filter
- Response: 200 OK with resource array

### POST /resources
- Description: Create new resource
- Body: Resource object
- Response: 201 Created with new resource

### PUT /resources/{id}
- Description: Update resource
- Body: Updated resource object
- Response: 200 OK with updated resource

### DELETE /resources/{id}
- Description: Delete resource
- Response: 204 No Content
"""
    
    def _generate_error_handling(self) -> str:
        return """
- 400 Bad Request: Invalid input
- 401 Unauthorized: Authentication required
- 403 Forbidden: Insufficient permissions
- 404 Not Found: Resource not found
- 500 Internal Server Error: Server error
"""
    
    def _generate_api_examples(self, task: str, context: Dict[str, Any]) -> str:
        return """
```json
// Request
POST /api/v1/resources
{
  "name": "Example Resource",
  "type": "example",
  "data": {}
}

// Response
{
  "id": "123",
  "name": "Example Resource",
  "type": "example",
  "data": {},
  "created_at": "2024-01-01T00:00:00Z"
}
```
"""
    
    def _generate_schema(self, task: str, context: Dict[str, Any]) -> str:
        return """
```sql
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
"""
    
    def _generate_indexes(self, context: Dict[str, Any]) -> str:
        return """
- Primary key index on id
- Index on created_at for time-based queries
- Composite index on (name, type) for searches
"""
    
    def _generate_relationships(self, context: Dict[str, Any]) -> str:
        return """
- One-to-many: User -> Resources
- Many-to-many: Resources <-> Tags
- One-to-one: Resource -> Configuration
"""
    
    def _generate_constraints(self, context: Dict[str, Any]) -> str:
        return """
- NOT NULL constraints on required fields
- UNIQUE constraint on email fields
- CHECK constraints for valid ranges
- Foreign key constraints with CASCADE options
"""
    
    def _generate_components(self, task: str, context: Dict[str, Any]) -> str:
        return """
### Frontend Components
- User Interface Layer
- State Management
- API Client

### Backend Services
- API Gateway
- Business Logic Service
- Data Access Layer

### Infrastructure
- Load Balancer
- Message Queue
- Cache Layer
"""
    
    def _generate_data_flow(self, context: Dict[str, Any]) -> str:
        return """
1. Client sends request to API Gateway
2. Gateway authenticates and routes request
3. Service processes business logic
4. Data layer handles persistence
5. Response flows back through layers
"""
    
    def _generate_tech_stack(self, context: Dict[str, Any]) -> str:
        return """
- Frontend: React, TypeScript, Tailwind CSS
- Backend: Node.js, Express, GraphQL
- Database: PostgreSQL, Redis
- Infrastructure: Docker, Kubernetes, AWS
- Monitoring: Prometheus, Grafana, ELK Stack
"""
    
    def _generate_security_considerations(self, context: Dict[str, Any]) -> str:
        return """
- Authentication: JWT tokens with refresh mechanism
- Authorization: Role-based access control (RBAC)
- Encryption: TLS 1.3 for transit, AES-256 for storage
- Input validation: Sanitize all user inputs
- Rate limiting: Prevent DoS attacks
- Audit logging: Track all sensitive operations
"""
    
    def _format_requirements(self, requirements: List[str]) -> str:
        if not requirements:
            return "- No specific requirements provided"
        return "\n".join(f"- {req}" for req in requirements)
    
    def _format_criteria(self, criteria: List[str]) -> str:
        if not criteria:
            return "- Task completed successfully"
        return "\n".join(f"- {criterion}" for criterion in criteria)