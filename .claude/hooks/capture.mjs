#!/usr/bin/env node
// Agent prompt/response capture hook for Claude Code.
//
// Wired to two events in .claude/settings.json:
//   - UserPromptSubmit -> records the verbatim prompt
//   - Stop             -> records the final assistant response for that turn
//
// Writes one markdown file per session to .agent-logs/, matching the format
// required by the 8x assignment. A small JSON sidecar under
// .claude/hooks/.state/ tracks structured entries so the markdown + frontmatter
// can be regenerated cleanly on every event (counts, timestamps, numbering).
//
// Design rules that must not be broken:
//   - NEVER write to stdout on UserPromptSubmit: that output is injected into
//     the model's context. We only touch the filesystem and exit 0.
//   - ALWAYS exit 0. A failing/blocking hook must never interrupt the session.
//   - Capture prompt + FINAL response only. No thinking, no tool calls, no
//     intermediate narration — just the last assistant message of the turn.

import fs from "node:fs";
import path from "node:path";

const AUTHOR = "ilijachrchev";
const PROJECT = "naano-rebuild";
const TOOL = "claude-code";

function projectDir() {
  return process.env.CLAUDE_PROJECT_DIR || process.cwd();
}

function readStdin() {
  try {
    return fs.readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function short(id) {
  return String(id || "unknown").slice(0, 8);
}

// Turn an ISO timestamp into the YYYY-MM-DD_HH-MM-SS filename stem (UTC).
function fileStamp(iso) {
  return iso.slice(0, 19).replace("T", "_").replace(/:/g, "-");
}

function readTranscript(p) {
  if (!p || !fs.existsSync(p)) return [];
  const out = [];
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t) continue;
    try {
      out.push(JSON.parse(t));
    } catch {
      /* skip malformed lines */
    }
  }
  return out;
}

// Latest model id seen on any assistant message in the transcript.
function latestModel(entries) {
  for (let i = entries.length - 1; i >= 0; i--) {
    const m = entries[i]?.message;
    if (entries[i]?.type === "assistant" && m?.model) return m.model;
  }
  return "unknown";
}

// Text of the final assistant message of the turn (the one that ends it).
// Join only "text" blocks; ignore tool_use / thinking / anything intermediate.
function finalResponseText(entries) {
  for (let i = entries.length - 1; i >= 0; i--) {
    const e = entries[i];
    if (e?.type !== "assistant") continue;
    const content = e.message?.content;
    if (typeof content === "string") return content.trim();
    if (Array.isArray(content)) {
      const text = content
        .filter((b) => b?.type === "text" && typeof b.text === "string")
        .map((b) => b.text)
        .join("\n")
        .trim();
      if (text) return text;
      // Assistant message with no text (ended on a tool_use): keep scanning
      // backward for the last message that actually said something.
    }
  }
  return "";
}

function statePath(sessionId) {
  const dir = path.join(projectDir(), ".claude", "hooks", ".state");
  fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, `${sessionId}.json`);
}

function loadState(sessionId) {
  const p = statePath(sessionId);
  if (fs.existsSync(p)) {
    try {
      return JSON.parse(fs.readFileSync(p, "utf8"));
    } catch {
      /* fall through to fresh state */
    }
  }
  return { sessionId, firstPromptTime: null, entries: [] };
}

function saveState(state) {
  fs.writeFileSync(statePath(state.sessionId), JSON.stringify(state, null, 2));
}

function render(state) {
  const sid = state.sessionId;
  const sh = short(sid);
  const prompts = state.entries.filter((e) => e.type === "PROMPT");
  const first = state.firstPromptTime || state.entries[0]?.timestamp || new Date().toISOString();
  const last = prompts.length
    ? prompts[prompts.length - 1].timestamp
    : state.entries[state.entries.length - 1]?.timestamp || first;
  const model = latestNonUnknown(state.entries) || "unknown";
  const date = first.slice(0, 10);

  const fm = [
    "---",
    `session_id: ${sid}`,
    `date: ${date}`,
    `author: ${AUTHOR}`,
    `model: ${model}`,
    `tool: ${TOOL}`,
    `project: ${PROJECT}`,
    `total_exchanges: ${prompts.length}`,
    `first_prompt_time: ${first}`,
    `last_prompt_time: ${last}`,
    "---",
    "",
    `# Session Log - ${date}`,
    "",
    `Session: \`${sh}\` | Project: \`${PROJECT}\` | Author: \`${AUTHOR}\``,
    "",
    "---",
    "",
    "",
  ].join("\n");

  const body = state.entries
    .map((e) => {
      return (
        `[LOG_ENTRY type=${e.type} num=${e.num} session=${sh}]\n` +
        `timestamp: ${e.timestamp}\n` +
        `model: ${e.model}\n` +
        "\n" +
        `${e.text}\n`
      );
    })
    .join("\n\n");

  return fm + body + "\n";
}

function latestNonUnknown(entries) {
  for (let i = entries.length - 1; i >= 0; i--) {
    if (entries[i].model && entries[i].model !== "unknown") return entries[i].model;
  }
  return null;
}

function logFileFor(state) {
  const dir = path.join(projectDir(), ".agent-logs");
  fs.mkdirSync(dir, { recursive: true });
  const stem = fileStamp(state.firstPromptTime);
  return path.join(dir, `${stem}_${state.sessionId}.md`);
}

function writeOut(state) {
  fs.writeFileSync(logFileFor(state), render(state));
}

function nextNum(state, type) {
  return state.entries.filter((e) => e.type === type).length + 1;
}

function main() {
  const raw = readStdin();
  let data = {};
  try {
    data = JSON.parse(raw || "{}");
  } catch {
    data = {};
  }

  const event = data.hook_event_name || "";
  const sessionId = data.session_id || "unknown-session";
  const now = new Date().toISOString();
  const transcript = readTranscript(data.transcript_path);
  const model = latestModel(transcript);

  const state = loadState(sessionId);
  state.sessionId = sessionId;

  if (event === "UserPromptSubmit") {
    if (!state.firstPromptTime) state.firstPromptTime = now;
    const prompt = typeof data.prompt === "string" ? data.prompt : "";
    state.entries.push({
      type: "PROMPT",
      num: nextNum(state, "PROMPT"),
      timestamp: now,
      model,
      text: prompt,
    });
    saveState(state);
    writeOut(state);
    // No stdout on purpose.
    return;
  }

  if (event === "Stop") {
    if (!state.firstPromptTime) state.firstPromptTime = now;
    const text = finalResponseText(transcript);
    // Backfill model on the most recent prompt entry if it was unknown.
    if (model !== "unknown") {
      for (let i = state.entries.length - 1; i >= 0; i--) {
        if (state.entries[i].type === "PROMPT" && state.entries[i].model === "unknown") {
          state.entries[i].model = model;
          break;
        }
      }
    }
    state.entries.push({
      type: "RESPONSE",
      num: nextNum(state, "RESPONSE"),
      timestamp: now,
      model,
      text: text || "(no final text response captured for this turn)",
    });
    saveState(state);
    writeOut(state);
    return;
  }
}

try {
  main();
} catch {
  // Never break the session because of logging.
}
process.exit(0);
