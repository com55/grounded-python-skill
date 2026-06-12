# grounded-python-skill

A [Claude Code](https://claude.ai/code) skill that forces Claude to verify every Python library API before writing code — no more hallucinated function signatures.

## The problem

Claude writes plausible-looking Python code from memory. The method names look right. The arguments look right. But `DataFrame.merge(how='left', on='id')` has subtly different behavior than what Claude remembered, and the bug only surfaces at runtime.

## What this skill does

Before writing any code that calls a third-party library or a custom project function, Claude must:

1. **List every external symbol** it's about to use (`pd.read_csv`, `DataFrame.groupby`, etc.)
2. **Look up the actual signature** — via [Context7 MCP](https://context7.com) for libraries, via `grep` for local code
3. **Write code grounded in what it found**, briefly noting what it verified

Builtins and stdlib (`os`, `sys`, `pathlib`, `json`, etc.) are skipped — only third-party packages and project-local symbols require verification.

## Requirements

- [Claude Code](https://claude.ai/code)
- [Context7 MCP](https://context7.com) configured in Claude Code (used for library doc lookups)

## Install

```bash
npx skills add com55/grounded-python-skill
```

Or manually:

```bash
git clone https://github.com/com55/grounded-python-skill ~/.claude/skills/grounded-python
```

Then start a new Claude Code session — the skill is active automatically.

## Usage

Invoke it with `/grounded-python` before asking Claude to write Python code:

```
/grounded-python write a pandas pipeline that reads sales.csv, groups by region, and computes mean revenue
```

Or just use it — Claude Code will trigger the skill automatically when you ask it to write Python code using any third-party library.

## What gets verified

| Symbol type | Verification method |
|-------------|-------------------|
| Third-party library (`pandas`, `httpx`, `fastapi`, …) | Context7 MCP docs lookup |
| Custom/local class or function | `grep` + read source |
| Python builtins + stdlib | Skipped (no lookup needed) |

## Hard rules Claude follows

- Never write a function call with argument names that weren't verified
- Never use `**kwargs` to avoid looking up the real signature
- Never infer arguments from what "makes sense" — look them up
- If a local symbol isn't found in the codebase: stop and ask, never guess

## License

MIT
