---
name: grounded-python
description: >-
  Enforces a docs-first protocol when writing Python code — Claude must verify
  every library function, method, and API before using it, never writing from
  memory alone. Trigger this skill whenever: the user asks to write Python code
  using any third-party library (pandas, numpy, FastAPI, SQLAlchemy, httpx,
  pydantic, etc.); the user says "use X to do Y" where X is a module or class;
  the code needs to call methods on objects from an external package; or the user
  wants to use a custom class/function from their own codebase. Never guess API
  shapes, argument names, or return types — always look them up first.
---

# Grounded Python

Before writing Python code that calls any library function, method, or API —
verify exactly how it works first. Don't write from memory. Don't infer from
the function name. Look it up.

## Why

Function signatures change across versions. Methods have non-obvious defaults.
Custom code has internal conventions only readable from source. Code written
from a half-remembered API looks plausible but silently misuses the interface.

## Scope

- **Skip**: Python builtins (`print`, `len`, `range`, `enumerate`, `zip`) and
  stdlib modules (`os`, `sys`, `pathlib`, `json`, `re`, `datetime`, etc.)
- **Always verify**: every third-party package and every custom/project-local
  symbol

## Workflow

### 1. List symbols before touching the keyboard

Before writing any code, enumerate every external symbol you'll use — function
names, class names, method calls. For example:

> Using: `pd.read_csv`, `DataFrame.groupby`, `GroupBy.agg`

### 2. Classify: library or custom?

- **Library** (installed package, e.g. `pandas`, `httpx`, `fastapi`): verify
  via Context7
- **Custom/local** (defined in this project): verify via source search

### 3a. Verifying library symbols via Context7

Use the Context7 MCP tools (prefer these over CLI):

```
resolve-library-id(libraryName="pandas", query="DataFrame groupby agg method signature")
→ gets the library ID

query-docs(libraryId="...", query="DataFrame.groupby().agg() — method signature, accepted aggregation functions, return type")
```

Write specific queries. "pandas" is a bad query. "DataFrame.merge on parameter behavior when keys don't match" is a good query.

If Context7 finds nothing useful after one retry with a refined query, fall back
to inspecting the installed package directly. This project uses `uv`, so run
Python through it to ensure the right virtualenv is active:

```bash
uv run python -c "import inspect, pandas; print(inspect.getsource(pandas.DataFrame.merge))"
```

If `uv` is not available or the command fails, fall back to `python` directly.
If that also fails, ask the user rather than guessing.

### 3b. Verifying custom/local symbols via source search

1. Search for the definition:
   ```bash
   grep -rn "def <symbol_name>\|class <symbol_name>" .
   ```
2. Read the full function/class definition — signature, docstring, and a few
   lines of the body to understand behavior and return type
3. If not found anywhere in the codebase: **stop immediately and ask the user**
   to point to the file or paste the signature. Do not proceed, do not guess.

### 4. Write code grounded in what you found

Briefly note what you verified (one line is enough), then write the code:

> "pandas `merge(right, on=..., how='inner')` returns a new DataFrame — not in-place"
> — then write the merge call

## Hard Rules

- Never write a function call using argument names you didn't verify
- Never use `**kwargs` as a workaround for not knowing the real signature
- Never infer method arguments from what "makes sense" or from similar functions
- When a symbol is not found: say so explicitly and ask — never silently fill
  in plausible-looking code
- When multiple libraries are needed: batch all lookups upfront before writing
  any code, to avoid write-pause-write churn
