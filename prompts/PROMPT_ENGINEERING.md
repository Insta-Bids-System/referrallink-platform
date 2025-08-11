# Prompt Engineering Guide
*Based on IndyDevDan's Principled AI Coding Approach*

## Core Principles

### 1. Specification-First Development
Always start with a clear, detailed specification before implementation. The spec acts as a contract between you and the AI.

### 2. Context is King
Provide comprehensive context:
- Existing code structure
- Dependencies and constraints
- Expected outcomes
- Edge cases to consider

### 3. Iterative Refinement
Start broad, then narrow:
1. High-level requirements
2. Detailed specifications
3. Implementation details
4. Optimization and polish

## Effective Prompt Patterns

### The SPEC Pattern
```
Specification:
- Purpose: [What and why]
- Inputs: [Data/parameters]
- Outputs: [Expected results]
- Constraints: [Limitations]
- Examples: [Concrete examples]
```

### The ROLE Pattern
```
You are an expert [role] with deep knowledge in [domain].
Your task is to [specific action].
Consider [important factors].
Avoid [common pitfalls].
```

### The CHAIN Pattern
```
Step 1: [First action]
Step 2: [Second action dependent on Step 1]
Step 3: [Third action building on previous]
...
Final: [Deliverable]
```

### The REVIEW Pattern
```
Review the following [artifact]:
[Content]

Check for:
1. [Criterion 1]
2. [Criterion 2]
...

Provide:
- Issues found
- Suggestions for improvement
- Priority of changes
```

## Prompt Templates by Task Type

### Feature Implementation
```
Implement [feature name] that [does what].

Context:
- Current system: [description]
- Integration points: [where it fits]
- User flow: [how it's used]

Requirements:
- Must: [essential features]
- Should: [important features]
- Could: [nice-to-haves]

Constraints:
- Performance: [targets]
- Security: [requirements]
- Compatibility: [needs]

Deliver:
1. Implementation plan
2. Code
3. Tests
4. Documentation
```

### Bug Fixing
```
Bug Report:
- Symptom: [what's wrong]
- Expected: [correct behavior]
- Actual: [current behavior]
- Steps to reproduce: [how to trigger]

Environment:
- System: [details]
- Version: [software versions]
- Context: [relevant state]

Code:
[relevant code sections]

Fix requirements:
- Maintain backward compatibility
- Add tests to prevent regression
- Document the fix
```

### Code Review
```
Review this code for [specific purpose]:

[code block]

Focus on:
- [Primary concern]
- [Secondary concern]
- [Additional aspects]

Provide:
1. Critical issues (must fix)
2. Important suggestions (should fix)
3. Minor improvements (could fix)
4. Positive observations (what's done well)
```

### Performance Optimization
```
Optimize this code for [specific metric]:

Current performance: [baseline]
Target: [goal]

[code block]

Constraints:
- Maintain: [what can't change]
- Resources: [available resources]
- Timeline: [when needed]

Consider:
- Algorithm complexity
- Memory usage
- I/O operations
- Caching opportunities
- Parallelization potential
```

## Advanced Techniques

### 1. Few-Shot Learning
Provide examples of desired output:
```
Example 1:
Input: [sample input]
Output: [sample output]

Example 2:
Input: [different input]
Output: [corresponding output]

Now process:
Input: [actual input]
```

### 2. Chain of Thought
```
Let's think step by step:
1. First, we need to [identify the problem]
2. Then, we should [analyze options]
3. Next, we can [implement solution]
4. Finally, we must [verify results]
```

### 3. Self-Consistency
```
Approach this problem three different ways:
1. [Method A]
2. [Method B]
3. [Method C]

Compare the approaches and select the best solution.
```

### 4. Constitutional AI
```
Implement [feature] following these principles:
- Principle 1: [e.g., User privacy first]
- Principle 2: [e.g., Fail safely]
- Principle 3: [e.g., Transparent operations]

If conflicts arise, prioritize in the order listed.
```

## Common Pitfalls to Avoid

### 1. Vague Instructions
❌ "Make it better"
✅ "Improve performance by reducing database queries through caching"

### 2. Missing Context
❌ "Fix the bug"
✅ "Fix the null pointer exception in line 42 when user input is empty"

### 3. Conflicting Requirements
❌ "Make it fast but also very detailed"
✅ "Optimize for speed with a target of <100ms, maintaining essential details"

### 4. No Success Criteria
❌ "Refactor this code"
✅ "Refactor to improve readability, reduce complexity below 10, and maintain 100% test coverage"

## Prompt Optimization Workflow

1. **Start Simple**: Begin with a basic prompt
2. **Test Output**: Evaluate the response
3. **Identify Gaps**: What's missing or wrong?
4. **Add Constraints**: Specify requirements more clearly
5. **Provide Examples**: Show desired format/style
6. **Iterate**: Refine based on results

## Measuring Prompt Effectiveness

### Metrics to Track:
- **Accuracy**: Does it solve the right problem?
- **Completeness**: Are all requirements met?
- **Efficiency**: Is the solution optimal?
- **Maintainability**: Is the code clean and documented?
- **Iterations needed**: How many refinements required?

### Prompt Quality Checklist:
- [ ] Clear objective stated
- [ ] Context provided
- [ ] Constraints specified
- [ ] Success criteria defined
- [ ] Examples included (if helpful)
- [ ] Output format specified
- [ ] Edge cases mentioned
- [ ] Dependencies noted

## Project-Specific Patterns

### For This Project:
1. **Agent Coordination**: Use clear handoff prompts between agents
2. **Spec-to-Code**: Always generate spec first, then implement
3. **Test-Driven**: Generate tests before or with implementation
4. **Documentation**: Generate docs as part of the workflow

## Resources

- Store successful prompts in `prompts/library/`
- Track prompt performance in `prompts/metrics.json`
- Share team prompts in `prompts/shared/`
- Keep personal refinements in `prompts/personal/`

## Remember

> "The quality of the output is directly proportional to the quality of the input prompt." - IndyDevDan

The best prompts are:
- **Specific** without being restrictive
- **Comprehensive** without being overwhelming
- **Clear** without being simplistic
- **Structured** without being rigid

Keep refining, keep learning, keep building! 🚀