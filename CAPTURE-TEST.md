# CAPTURE-TEST

## Tool and model

- **Tool:** Claude Code (CLI)
- **Model:** Opus 4.8 (`claude-opus-4-8`) — this session plans and executes with the
  same model. The log records the model per-entry (read from the session transcript),
  so any mid-build model switch shows up automatically.

## Mechanism used

Claude Code has a native, automatic **hooks** mechanism configured in
`.claude/settings.json`. It fires shell commands on lifecycle events without any manual
action. Two events are wired:

| Event | Fires when | What we capture |
|-------|-----------|-----------------|
| `UserPromptSubmit` | every time a prompt is submitted | the verbatim prompt |
| `Stop` | end of every assistant turn | the final response text |

Both events call one Node.js script. Node was chosen (over a `.sh`/`.ps1`) because
Claude Code ships on Node so it is guaranteed present, and it behaves identically
regardless of the OS shell — important here since this is Windows/PowerShell where
bash-style quoting in hook commands is fragile.

### Files changed / added

- `.claude/settings.json` — wires `UserPromptSubmit` and `Stop` to the capture script.
- `.claude/hooks/capture.mjs` — reads the hook JSON on stdin, appends a PROMPT or
  RESPONSE entry, and (re)renders the per-session markdown log.
- `.gitignore` — ignores `.claude/hooks/.state/` only (a JSON sidecar used to
  regenerate frontmatter/counts). **`.agent-logs/` is NOT ignored** — it ships.

### How the "final response only" guarantee works

On `Stop`, the script reads the session transcript (path provided by Claude Code on
stdin) and takes the **text blocks of the last assistant message only**. Thinking,
tool calls, intermediate narration, file reads, and retries are all skipped. On
`UserPromptSubmit` the script writes nothing to stdout (that stream is injected into
the model's context) and always exits 0 so logging can never block or corrupt a turn.

## Where the canaries land

`.agent-logs/YYYY-MM-DD_HH-MM-SS_<session-id>.md` — one file per session. Each live
session gets its own file, so the second-session canary lands in a separate file from
the first, which is exactly how we prove the hook is installed globally (in repo
settings) and not just in the session that created it.

---

## Canary entries (raw)

> These two blocks are filled from the real `.agent-logs/` files after the canaries are
> fired live. See "How to fire the canaries" below — a canary must come from a
> human-submitted prompt, which is the only thing that triggers the `UserPromptSubmit`
> hook. They cannot be forged by the agent.

### Canary 1 — session A

```
<PENDING: paste the raw PROMPT + RESPONSE entries from .agent-logs/ after firing canary 1>
```

### Canary 2 — session B (a different session)

```
<PENDING: paste the raw PROMPT + RESPONSE entries from the second .agent-logs/ file>
```

---

## Proof of mechanism (dry-run, before live canaries)

Before wiring is exercised live, the script was verified by piping the **exact JSON
payloads Claude Code sends** for `UserPromptSubmit` and `Stop` into it, using a
realistic transcript that included an intermediate tool call. Result: the intermediate
narration and the tool call were correctly excluded and only the final response text
was captured. Rendered output:

```
---
session_id: 3f9c1a20-77bd-4e51-9a0e-1c2f83b4de77
date: 2026-08-27
author: ilijachrchev
model: claude-opus-4-8
tool: claude-code
project: naano-rebuild
total_exchanges: 1
first_prompt_time: 2026-08-27T09:19:40.347Z
last_prompt_time: 2026-08-27T09:19:40.347Z
---

# Session Log - 2026-08-27

Session: `3f9c1a20` | Project: `naano-rebuild` | Author: `ilijachrchev`

---

[LOG_ENTRY type=PROMPT num=1 session=3f9c1a20]
timestamp: 2026-08-27T09:19:40.347Z
model: claude-opus-4-8

CAPTURE TEST — 8x assignment, Ilija


[LOG_ENTRY type=RESPONSE num=1 session=3f9c1a20]
timestamp: 2026-08-27T09:19:40.653Z
model: claude-opus-4-8

Done. This is the FINAL response for the turn — nothing intermediate should leak in.
```

This dry-run file was deleted (fake session id / not a genuine capture) so it would not
pollute `.agent-logs/` with a forged-looking entry.

## How to fire the canaries (live)

1. Restart Claude Code in this repo (hooks are loaded at session start; approve them via
   `/hooks` if prompted). This is **session A**.
2. Submit exactly: `CAPTURE TEST — 8x assignment, Ilija`
3. Confirm a file appeared under `.agent-logs/` containing both the PROMPT and RESPONSE.
4. Open a **new** Claude Code session in the same repo (**session B**), submit the same
   canary again, and confirm a *second* file lands. Two files = hook is installed
   repo-wide, not just in the session that created it.
5. Paste the raw entries from both files into the two "Canary entries" slots above.

## Things tried / notes

- Considered a `.ps1`/`.sh` hook; rejected because hook-command quoting differs across
  Windows shells and would be brittle. A single Node script invoked as
  `node "$CLAUDE_PROJECT_DIR/.claude/hooks/capture.mjs"` is shell-agnostic.
- The current (setup) session cannot self-capture: Claude Code binds hooks at startup,
  so hooks added mid-session only take effect after a restart — which is why the live
  canaries above are required to prove installation.

## Codex capture

The Codex capture mechanism is configured in `.codex/hooks.json`. Its `UserPromptSubmit`
and `Stop` hooks both invoke `.codex/capture.mjs`. The script reads hook JSON from stdin,
stores the submitted prompt, and on `Stop` appends only that prompt and the final assistant
response to a Markdown session log in `.agent-logs/`. It does not record reasoning, tool
calls, intermediate output, or diffs.

The two Codex canary log files are:

- `.agent-logs/2026-08-27_09-45-16_01a0429b.md`
- `.agent-logs/2026-08-27_09-45-42_01a0429c.md`

Raw canary entries:

```text
[LOG_ENTRY type=PROMPT num=1 session=01a0429b-f1f0-7d50-9538-441abcd83ce2]
timestamp: 2026-08-27T09:45:16.054Z
model: gpt-5.6-luna

CAPTURE TEST  8x assignment, Ilija

[LOG_ENTRY type=RESPONSE num=1 session=01a0429b-f1f0-7d50-9538-441abcd83ce2]
timestamp: 2026-08-27T09:45:20.894Z
model: gpt-5.6-luna

What would you like me to do with “CAPTURE TEST 8x assignment, Ilija”—create eight assignments, capture a test, or format this as a task?

[LOG_ENTRY type=PROMPT num=1 session=01a0429c-5cd6-7360-92a9-125b7632d8d9]
timestamp: 2026-08-27T09:45:42.994Z
model: gpt-5.6-luna

CAPTURE TEST  8x assignment, Ilija

[LOG_ENTRY type=RESPONSE num=1 session=01a0429c-5cd6-7360-92a9-125b7632d8d9]
timestamp: 2026-08-27T09:45:47.964Z
model: gpt-5.6-luna

What would you like me to do with “CAPTURE TEST 8x assignment, Ilija”? Please share the assignment or specify the desired action.
```
