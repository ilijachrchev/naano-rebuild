# CAPTURE-TEST

## Tool and model

- Tool: Codex CLI (`@openai/codex` 0.150.1)
- Model: `gpt-5.6-luna` (the configured model plans and executes; no separate planner model is selected)
- Automatic lifecycle mechanism: yes — Codex repository hooks fire commands on prompt submission and turn completion.

## Mechanism used

Configured `.codex/hooks.json` with `UserPromptSubmit` and `Stop` hooks. Both invoke
`.codex/capture.mjs`. The script reads the hook JSON from stdin, stores the submitted
prompt, and on `Stop` appends only that prompt and the final assistant response to a
Markdown session log. It does not record reasoning, tool calls, intermediate output,
or diffs. `.agent-logs/` is not ignored.

## Canary log files

- Session A: `.agent-logs/2026-08-27_09-45-16_01a0429b.md`
- Session B: `.agent-logs/2026-08-27_09-45-42_01a0429c.md`

Both were created by separate `codex exec` processes in this repository, and both
showed `UserPromptSubmit` and `Stop` completing successfully.

## Canary 1 — raw entries

```text
[LOG_ENTRY type=PROMPT num=1 session=01a0429b-f1f0-7d50-9538-441abcd83ce2]
timestamp: 2026-08-27T09:45:16.054Z
model: gpt-5.6-luna

CAPTURE TEST  8x assignment, Ilija

[LOG_ENTRY type=RESPONSE num=1 session=01a0429b-f1f0-7d50-9538-441abcd83ce2]
timestamp: 2026-08-27T09:45:20.894Z
model: gpt-5.6-luna

What would you like me to do with “CAPTURE TEST 8x assignment, Ilija”—create eight assignments, capture a test, or format this as a task?
```

## Canary 2 — raw entries

```text
[LOG_ENTRY type=PROMPT num=1 session=01a0429c-5cd6-7360-92a9-125b7632d8d9]
timestamp: 2026-08-27T09:45:42.994Z
model: gpt-5.6-luna

CAPTURE TEST  8x assignment, Ilija

[LOG_ENTRY type=RESPONSE num=1 session=01a0429c-5cd6-7360-92a9-125b7632d8d9]
timestamp: 2026-08-27T09:45:47.964Z
model: gpt-5.6-luna

What would you like me to do with “CAPTURE TEST 8x assignment, Ilija”? Please share the assignment or specify the desired action.
```

## Things tried first that did not work

- The pre-existing `CAPTURE-TEST.md` described a Claude Code `.claude/settings.json`
  setup, which is not the mechanism used by this Codex session; it was replaced with
  the Codex hook setup above.
- The first canary command included unsupported `-a` and `--no-alt-screen` options for
  `codex exec`; those invocation errors did not run a session. The corrected commands
  ran successfully and produced the two logs above.
