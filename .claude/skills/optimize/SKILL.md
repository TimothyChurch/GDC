---
name: optimize
description: "Audit and optimize Claude Code configuration for token efficiency. Checks CLAUDE.md size, memory freshness, agent memory accuracy, .claudeignore coverage, settings bloat, and context usage. Run regularly to keep sessions lean."
argument-hint: "[focus: all|memory|config|agents|report]"
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Agent, AskUserQuestion
---

# Claude Code Optimizer

You are an optimization auditor for the GDC project's Claude Code configuration. Your job is to audit the current state and apply fixes to minimize token waste while maintaining performance.

## Focus Areas

If `$ARGUMENTS` is provided, run only that section. Otherwise run all sections.

- `all` — Full audit (default)
- `memory` — Memory files only (Sections 1-2)
- `config` — CLAUDE.md, rules, .claudeignore (Sections 3-5)
- `agents` — Agent configs and agent memory (Sections 6-7)
- `report` — Generate report only, no changes

## Audit Workflow

### Section 1: Project Memory Audit

Read `/home/timothy/.claude/projects/-home-timothy-Coding-GDC/memory/MEMORY.md`:
- Check line count (target: under 80 lines)
- Look for duplicate entries
- Look for stale/outdated information that contradicts current codebase
- Check that topic files referenced from MEMORY.md still exist
- Verify "Project State" section reflects reality

Read all files in the memory directory:
```bash
ls -la /home/timothy/.claude/projects/-home-timothy-Coding-GDC/memory/
```
- Check each file for staleness
- Remove files that are no longer relevant

**Fix**: Edit MEMORY.md to remove stale entries. Delete orphaned topic files.

### Section 2: Agent Memory Audit

Read all files in `.claude/agent-memory/*/`:
```bash
find .claude/agent-memory -name "*.md" -type f
```

For each agent memory file:
- Cross-reference "Known Issues" or "Not Yet Implemented" claims against the actual codebase
- Check for factually incorrect statements about what IS or IS NOT implemented
- Look for planning-phase context that has no operational value post-implementation
- Check line counts (agent memory files over 100 lines should be trimmed)

**Fix**: Update incorrect statements. Remove planning artifacts. Trim verbose files.

### Section 3: CLAUDE.md Size Audit

Read `.claude/CLAUDE.md`:
- Count lines (target: under 100 lines for core instructions)
- Check for information Claude can infer from reading code
- Check for redundancy with path-scoped rules
- Verify all referenced files/paths still exist
- Check version numbers match installed packages

**Fix**: Move specialized content to path-scoped rules. Remove self-evident instructions.

### Section 4: Rules Audit

Check `.claude/rules/` directory:
- Verify path-scoped rules have correct `paths` frontmatter
- Check that rules don't duplicate CLAUDE.md content
- Verify paths in frontmatter match actual project structure

### Section 5: .claudeignore Audit

Read `.claudeignore` (create if missing):
- Must exclude: `node_modules/`, `.nuxt/`, `.output/`, `dist/`, `OLD FILES/`, `*.log`, `.git/`
- Check for large directories that should be excluded (images, build artifacts)
- Verify excluded paths match actual project structure

```bash
# Check for large directories that might need excluding
du -sh --max-depth=2 . 2>/dev/null | sort -rh | head -20
```

**Fix**: Create or update `.claudeignore` with appropriate exclusions.

### Section 6: Agent Config Audit

Read all files in `.claude/agents/`:
- Check total line count across all configs (target: under 600 lines total)
- Look for boilerplate or generic instructions that waste tokens
- Verify agent descriptions are concise (one sentence)
- Check that model assignments are appropriate (haiku for read-only, sonnet for implementation)

### Section 7: Settings Audit

Read `.claude/settings.local.json`:
- Look for one-off commands that reference specific file paths (stale permissions)
- Look for redundant entries (specific commands covered by broader wildcards)
- Check for entries that are no longer needed

**Fix**: Remove stale and redundant permission entries.

## Output Format

After completing all sections, output a summary report:

```
## Optimization Report

### Token Impact Summary
| Area | Status | Action Taken |
|------|--------|-------------|
| MEMORY.md | OK/Fixed | [details] |
| Agent Memory | OK/Fixed | [details] |
| CLAUDE.md | OK/Fixed | [details] |
| Rules | OK/Fixed | [details] |
| .claudeignore | OK/Fixed | [details] |
| Agent Configs | OK/Fixed | [details] |
| Settings | OK/Fixed | [details] |

### Estimated Token Savings
[Approximate tokens saved per session from changes made]

### Recommendations
[Any manual actions the user should take]
```

## Rules

- Always read files before editing — never assume current contents
- Cross-reference claims in memory files against actual code before declaring them stale
- Be conservative: only remove content you can verify is outdated or redundant
- Preserve domain-specific knowledge that agents need (batch lifecycle, compliance, etc.)
- After edits, verify files are still well-structured and coherent
- Do NOT modify agent config files (.claude/agents/*.md) without user confirmation — those are carefully tuned
- Keep MEMORY.md under 80 lines; keep CLAUDE.md under 100 lines of core content
