import Anthropic from '@anthropic-ai/sdk';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { buildApp } from '../src/app.ts';
import { DEFAULT_ANTHROPIC_MODEL, loadConfig } from '../src/config.ts';
import { openCorpus } from '../src/db.ts';
import { createAnthropicChat, toAnthropicRequest } from '../src/provider-anthropic.ts';
import { axis, withIndex } from './fixtures.ts';

const KEY = 'sk-ant-test-not-a-real-key';

type Seen = { url: string; body: Record<string, any>; headers: Headers };

/**
 * A real SDK client whose transport is faked: no network, but the request is serialized
 * and the response parsed exactly as in production. `reply` answers each attempt.
 */
function fakeClient(reply: (attempt: number) => Response, seen: Seen[] = []): Anthropic {
  return new Anthropic({
    apiKey: KEY,
    fetch: async (input, init) => {
      seen.push({
        url: String(input),
        body: JSON.parse(String(init?.body)),
        headers: new Headers(init?.headers),
      });
      return reply(seen.length);
    },
  });
}

const json = (status: number, value: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(value), {
    status,
    headers: { 'content-type': 'application/json', 'request-id': 'req_test', ...headers },
  });

const message = (content: unknown[], stop_reason = 'end_turn') =>
  json(200, {
    id: 'msg_test',
    type: 'message',
    role: 'assistant',
    model: DEFAULT_ANTHROPIC_MODEL,
    content,
    stop_reason,
    stop_sequence: null,
    usage: { input_tokens: 10, output_tokens: 5 },
  });

// Retries wait for retry-after-ms (0 means the default backoff), so 1 keeps the retry test fast.
const overloaded = () =>
  json(529, { type: 'error', error: { type: 'overloaded_error', message: 'Overloaded' } }, {
    'retry-after-ms': '1',
  });

const chatWith = (client: Anthropic) =>
  createAnthropicChat({ apiKey: KEY, model: DEFAULT_ANTHROPIC_MODEL, maxTokens: 4096, client });

test('system messages go to the top-level system, joined in order', () => {
  const request = toAnthropicRequest([
    { role: 'system', content: 'first rule' },
    { role: 'user', content: 'hola' },
    { role: 'system', content: 'second rule' },
  ]);
  assert.equal(request.system, 'first rule\n\nsecond rule');
  assert.deepEqual(request.messages, [{ role: 'user', content: 'hola' }]);
});

test('consecutive same-role turns merge and a leading assistant turn is dropped', () => {
  const request = toAnthropicRequest([
    { role: 'assistant', content: 'greeting from a previous session' },
    { role: 'system', content: 'rules' },
    { role: 'user', content: 'a' },
    { role: 'user', content: 'b' },
    { role: 'assistant', content: 'c' },
    { role: 'assistant', content: 'd' },
    { role: 'user', content: 'e' },
  ]);
  assert.deepEqual(request.messages, [
    { role: 'user', content: 'a\n\nb' },
    { role: 'assistant', content: 'c\n\nd' },
    { role: 'user', content: 'e' },
  ]);
});

test('no system message: no system field', () => {
  assert.equal('system' in toAnthropicRequest([{ role: 'user', content: 'hola' }]), false);
});

test('request: model, max_tokens, system and turns; json mode adds nothing', async () => {
  const seen: Seen[] = [];
  const chat = chatWith(fakeClient(() => message([{ type: 'text', text: '{"ok":true}' }]), seen));

  const text = await chat(
    [
      { role: 'system', content: 'Answer with JSON.' },
      { role: 'user', content: '¿qué es una llama?' },
    ],
    { json: true },
  );

  assert.equal(text, '{"ok":true}');
  assert.equal(seen.length, 1);
  assert.match(seen[0].url, /\/v1\/messages(\?|$)/);
  assert.equal(seen[0].headers.get('authorization'), `Bearer ${KEY}`);
  const { body } = seen[0];
  assert.equal(body.model, DEFAULT_ANTHROPIC_MODEL);
  assert.equal(body.max_tokens, 4096);
  assert.equal(body.system, 'Answer with JSON.');
  assert.deepEqual(body.messages, [{ role: 'user', content: '¿qué es una llama?' }]);
  // Server-side refusal fallback, the only addition to every call.
  assert.equal(body.fallbacks, 'default');
  assert.match(seen[0].headers.get('anthropic-beta') ?? '', /server-side-fallback-2026-07-01/);
  for (const key of ['output_config', 'tools', 'tool_choice', 'response_format']) {
    assert.equal(key in body, false, `${key} must not be sent`);
  }
});

test('thinking blocks are ignored; text blocks are concatenated', async () => {
  const chat = chatWith(
    fakeClient(() =>
      message([
        { type: 'thinking', thinking: 'internal reasoning', signature: 'sig' },
        { type: 'text', text: 'Las llamas son esféricas ' },
        { type: 'thinking', thinking: '', signature: 'sig2' },
        { type: 'text', text: 'en microgravedad [1].' },
      ]),
    ),
  );
  assert.equal(
    await chat([{ role: 'user', content: 'x' }]),
    'Las llamas son esféricas en microgravedad [1].',
  );
});

test('only thinking, no text: an error', async () => {
  const chat = chatWith(
    fakeClient(() => message([{ type: 'thinking', thinking: 'hmm', signature: 'sig' }], 'max_tokens')),
  );
  await assert.rejects(chat([{ role: 'user', content: 'x' }]), /returned no content/);
});

test('a refusal is an error', async () => {
  const chat = chatWith(fakeClient(() => message([], 'refusal')));
  await assert.rejects(chat([{ role: 'user', content: 'x' }]), /refused/);
});

test('429/5xx: retried twice by the SDK, then a plain Error without the key', async () => {
  const seen: Seen[] = [];
  const chat = chatWith(fakeClient(overloaded, seen));
  await assert.rejects(chat([{ role: 'user', content: 'x' }]), (error: Error) => {
    assert.equal(error.constructor, Error);
    assert.match(error.message, /llm provider failed: 529 overloaded_error: Overloaded \(request req_test\)/);
    assert.doesNotMatch(error.message, new RegExp(KEY));
    return true;
  });
  assert.equal(seen.length, 3);
});

test('a retry that succeeds returns the answer', async () => {
  const chat = chatWith(
    fakeClient((attempt) => (attempt === 1 ? overloaded() : message([{ type: 'text', text: 'ok' }]))),
  );
  assert.equal(await chat([{ role: 'user', content: 'x' }]), 'ok');
});

test('SDK failure through /chat: 502 llm_unavailable', async () => {
  await withIndex(async (path) => {
    const corpus = openCorpus(path);
    const app = buildApp(
      { corpus, embed: async () => axis(0), chat: chatWith(fakeClient(overloaded)) },
      { logger: false },
    );
    try {
      const response = await app.inject({
        method: 'POST',
        url: '/chat',
        payload: { message: '¿Por qué las llamas son esféricas en microgravedad?', history: [] },
      });
      assert.equal(response.statusCode, 502);
      assert.equal(response.json().error, 'llm_unavailable');
      assert.match(response.json().detail, /529 overloaded_error: Overloaded/);
    } finally {
      await app.close();
      corpus.db.close();
    }
  });
});

const ENGINE = { ENGINE_URL: 'http://engine:8000' };

test('config: openai stays the default and still requires LLM_URL and LLM_MODEL', () => {
  const config = loadConfig({ ...ENGINE, LLM_URL: 'http://llm/v1/chat/completions', LLM_MODEL: 'llama3.1' });
  assert.deepEqual(config.llm, {
    provider: 'openai',
    url: 'http://llm/v1/chat/completions',
    model: 'llama3.1',
    apiKey: undefined,
    timeoutMs: 60_000,
  });
  assert.throws(() => loadConfig({ ...ENGINE, LLM_MODEL: 'llama3.1' }), /LLM_URL is required/);
});

test('config: anthropic needs no LLM_URL and defaults the model and max tokens', () => {
  const config = loadConfig({ ...ENGINE, LLM_PROVIDER: 'anthropic', ANTHROPIC_API_KEY: KEY });
  assert.deepEqual(config.llm, {
    provider: 'anthropic',
    apiKey: KEY,
    model: DEFAULT_ANTHROPIC_MODEL,
    maxTokens: 4096,
    timeoutMs: 60_000,
  });
  const custom = loadConfig({
    ...ENGINE,
    LLM_PROVIDER: 'anthropic',
    ANTHROPIC_API_KEY: KEY,
    LLM_MODEL: 'claude-opus-5-5',
    LLM_MAX_TOKENS: '8000',
    LLM_TIMEOUT_MS: '30000',
  });
  assert.equal(custom.llm.model, 'claude-opus-5-5');
  assert.equal(custom.llm.provider === 'anthropic' && custom.llm.maxTokens, 8000);
  assert.equal(custom.llm.timeoutMs, 30_000);
});

test('config: anthropic without ANTHROPIC_API_KEY, or an unknown provider, fails', () => {
  assert.throws(
    () => loadConfig({ ...ENGINE, LLM_PROVIDER: 'anthropic' }),
    /ANTHROPIC_API_KEY is required, set it when LLM_PROVIDER=anthropic/,
  );
  assert.throws(() => loadConfig({ ...ENGINE, LLM_PROVIDER: 'claude' }), /LLM_PROVIDER must be openai or anthropic/);
});

test('boot: the server exits with a clear message when ANTHROPIC_API_KEY is missing', () => {
  const { ANTHROPIC_API_KEY: _drop, ...inherited } = process.env;
  const result = spawnSync(process.execPath, ['--import', 'tsx', 'src/server.ts'], {
    env: { ...inherited, ...ENGINE, LLM_PROVIDER: 'anthropic', CORPUS_PATH: '/nonexistent/corpus.db' },
    encoding: 'utf8',
    timeout: 30_000,
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /ANTHROPIC_API_KEY is required/);
});
