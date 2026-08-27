import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const logDir = path.join(root, '.agent-logs');
const statePath = path.join(root, '.codex', '.capture-state.json');
const raw = fs.readFileSync(0, 'utf8');
let event = {};
try { event = JSON.parse(raw || '{}'); } catch { process.exit(0); }

const eventName = String(event.hook_event_name ?? event.event ?? event.type ?? '').toLowerCase();
const isPrompt = eventName.includes('userprompt') || eventName === 'prompt';
const isStop = eventName === 'stop' || eventName.includes('turnend') || eventName.includes('response');
if (!isPrompt && !isStop) process.exit(0);

const sessionId = String(event.thread_id ?? event.session_id ?? event.conversation_id ?? 'unknown-session');
const model = String(event.model ?? 'gpt-5.6-luna');
const now = new Date().toISOString();
const prompt = firstString(event, ['prompt', 'user_prompt', 'input', 'text']);
const response = firstString(event, ['last_assistant_message', 'assistant_message', 'final_response', 'response', 'output']);

fs.mkdirSync(logDir, { recursive: true });
fs.mkdirSync(path.dirname(statePath), { recursive: true });
const state = readJson(statePath, { sessions: {} });
const session = state.sessions[sessionId] ??= { prompts: [], responses: [] };

if (isPrompt && prompt) {
  session.prompts.push({ timestamp: now, model, text: prompt });
  save(statePath, state);
  process.exit(0);
}

if (isStop && response) {
  const pending = session.prompts.shift();
  const entry = {
    timestamp: pending?.timestamp ?? now,
    model,
    prompt: pending?.text ?? prompt ?? '[prompt unavailable in Stop payload]',
    response,
    responseTimestamp: now
  };
  const shortId = sessionId.slice(0, 8);
  const filename = `${stamp(new Date(entry.timestamp))}_${shortId}.md`;
  const file = path.join(logDir, filename);
  const existing = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : header(sessionId, model, entry.timestamp);
  const n = (existing.match(/\[LOG_ENTRY type=PROMPT/g) ?? []).length + 1;
  const block = `\n[LOG_ENTRY type=PROMPT num=${n} session=${sessionId}]\ntimestamp: ${entry.timestamp}\nmodel: ${model}\n\n${entry.prompt}\n\n[LOG_ENTRY type=RESPONSE num=${n} session=${sessionId}]\ntimestamp: ${entry.responseTimestamp}\nmodel: ${model}\n\n${entry.response}\n`;
  fs.writeFileSync(file, existing + block, 'utf8');
  save(statePath, state);
}

function firstString(value, names) {
  for (const name of names) {
    if (typeof value?.[name] === 'string' && value[name]) return value[name];
  }
  return '';
}
function readJson(file, fallback) { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; } }
function save(file, value) { fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n', 'utf8'); }
function stamp(date) { return date.toISOString().replace('T', '_').replace(/:/g, '-').replace(/\.\d{3}Z$/, ''); }
function header(id, model, date) {
  const d = date.slice(0, 10);
  return `---\nsession_id: ${id}\ndate: ${d}\nauthor: ilijachrchev\nmodel: ${model}\ntool: codex-cli\nproject: naano-rebuild\ntotal_exchanges: 1\nfirst_prompt_time: ${date}\nlast_prompt_time: ${date}\n---\n\n# Session Log - ${d}\n\nSession: \`${id.slice(0, 8)}\` | Project: \`naano-rebuild\` | Author: \`ilijachrchev\`\n\n---\n`;
}
