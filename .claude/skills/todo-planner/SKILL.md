---
name: todo-planner
description: "Read TODOS.md, create a detailed implementation plan in TODO_PLAN.md, then execute it phase by phase with token-efficient context management."
argument-hint: "[phase-number]"
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Task, TaskCreate, TaskUpdate, TaskList, TaskGet, AskUserQuestion
---

<objective>
Implementation orchestrator for the GDC project. Reads the current TODO list, creates a detailed phased plan, and executes it efficiently by delegating to specialized agents with isolated contexts.
</objective>

<quick_start>
1. Run `/todo-planner` to analyze TODOS.md and generate a plan
2. Run `/todo-planner 2` to skip to phase 2 execution
</quick_start>

<process>

**Step 1: Read & Analyze TODOs**

1. Read `TODOS.md` from the project root
2. For each TODO item, explore the relevant codebase areas to understand:
   - What files are involved
   - What currently exists vs what needs to change
   - Dependencies between TODO items
   - Estimated complexity (Low / Medium / High)
3. Group TODOs into logical phases based on dependencies and complexity

**Step 2: Write the Plan**

Write a detailed implementation plan to `TODO_PLAN.md` in the project root. The plan must include:

- **Overview**: Summary of what the TODOs cover
- **Phases**: Grouped by dependency order (Phase 0 = prerequisites, Phase 1+ = implementation)
- **Per-item details**:
  - Problem statement (what's missing or broken)
  - Current state (what exists already)
  - Specific changes needed (files, components, schemas)
  - Which agent to use (from the project's custom agents)
- **Dependency map**: Visual tree showing phase/item dependencies
- **Effort summary table**: Item | Complexity | Schema Change | Key Files
- **Agent assignments table**: Which agent handles what

**Step 3: Execute Phase by Phase**

If `$ARGUMENTS` is provided, skip to that phase number. Otherwise start from Phase 0.

For each phase:

1. **Create task list** using TaskCreate for all items in the phase
2. **Delegate work** to the appropriate specialized agent using the Task tool:
   - `distillery-admin-builder` — admin features, stores, components
   - `distillery-frontend-designer` — public-facing UI/design
   - `data-model-specialist` — schema changes (Mongoose + TS interface + Yup + Pinia + form sync)
   - `pro-debugger` — if something breaks during implementation
   - `test-writer` — after feature implementation
3. **Run agents in parallel** when items within a phase have no dependencies on each other
4. **Mark tasks complete** as each finishes
5. **Verify** the phase works before moving to the next:
   - Run `npm run build` to check for compilation errors
   - Spot-check key files for correctness

**Step 4: Context Management**

Critical for token efficiency:

- Launch agents via the Task tool — each agent gets its own isolated context
- Provide agents with **complete, self-contained prompts** including:
  - The specific TODO item text
  - Relevant file paths and line numbers from the plan
  - Current state of the code (what exists)
  - Exact changes needed
  - Any patterns to follow (reference CLAUDE.md conventions)
- Do NOT read large files in the main context — delegate that to agents
- After each phase completes, summarize results concisely before moving on
- Use `run_in_background: true` for parallel agent work when possible

**Step 5: Update Plan**

After all phases are complete:
1. Update `TODO_PLAN.md` with completion status
2. Update `TODOS.md` — mark completed items or remove them
3. Summarize what was accomplished
</process>

<agent_prompt_template>
When delegating to an agent, use this structure:

```
## Task: [Item number and title]

### Context
[Brief description of what this is about]

### Current State
[What files exist, what they currently do — include paths and line numbers]

### Required Changes
[Specific, detailed changes to make]

### Files to Modify
- `path/to/file.vue` — [what to change]
- `path/to/schema.ts` — [what to add]

### Patterns to Follow
- [Reference existing patterns in the codebase]
- [Nuxt UI v4 conventions from CLAUDE.md]

### Verification
- [How to confirm the change works]
```
</agent_prompt_template>

<rules>
- Always read TODOS.md fresh — don't assume the old plan is current
- If a TODO item is ambiguous, use AskUserQuestion to clarify before planning
- Never skip the planning step — always write TODO_PLAN.md before executing
- If a phase fails, stop and report rather than pushing forward blindly
- Keep the main conversation context lean — heavy lifting goes to agents
</rules>

<success_criteria>
- TODOS.md has been read and analyzed
- TODO_PLAN.md written with phases, dependencies, and agent assignments
- All phases executed with agents delegated appropriately
- Build passes after each phase (`npm run build`)
- TODOS.md and TODO_PLAN.md updated with completion status
</success_criteria>
