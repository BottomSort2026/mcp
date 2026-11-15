import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import type { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { buildApp, type AppDeps } from '../src/app.ts';
import { openCorpus, type Corpus } from '../src/db.ts';
import { createEngine, PredictionSchema, type Engine, type LabInputs } from '../src/engine.ts';
import { InvalidInputsError, UpstreamError } from '../src/errors.ts';
import { HttpError } from '../src/http.ts';
import {
  closestTests,
  engineDetail,
  LAB_SYSTEM,
  labModelInfo,
  labPredict,
  languageName,
} from '../src/lab.ts';
import { createChat, type Chat, type Message } from '../src/provider.ts';
import { findInvestigation, findTestSheets } from '../src/testsheets.ts';
import { readJson, withIndex } from './fixtures.ts';

// The fixture corpus (fixtures.ts) has one test sheet, "Droplet test sheet A" of PSI-2, folder
// Data/Tests, text "heptane droplet diameter shrank during burning". PSI-2 has no acronym.
const SHEET_A = 'Droplet test sheet A';
const SHEET_A_TEXT = 'heptane droplet diameter shrank during burning';
const PSI2_URL = 'https://psi.example/investigations/PSI-2';

const INPUTS: LabInputs = {
  fuel: 'heptane',
  pressure_atm: 1,
  o2: 0.21,
  suppressant: 'none',
  suppressant_fraction: 0,
  droplet_d0_mm: 3,
};

const nearest = (cir_id: string | null, testsheet_id: string | null, test_end: string, distance: number) => ({
  cir_id,
  testsheet_id,
  test_end,
  conditions: { fuel: 'heptane', pressure_atm: 1.0125, o2: 0.21, co2: 0, he: 0, d0_mm: 2.78 },
  distance,
});

/**
 * An engine POST /predict body in the shape of engine/app/main.py (PredictResponse). The outcome
 * model's tests: sheet A (disruption), FLEX-999 (no sheet in the corpus), and C3 without a sheet,
 * beyond the threshold. The extinction model's: FLEX-999 again, and FLEX-777.
 */
function engineBody(label: 'extinction' | 'no_extinction' = 'extinction') {
  const extinct = label === 'extinction';
  const model = (model_version: string, rows: number) => ({
    model_version,
    training_source: { dataset: 'flex_tests', accession: 'PSI-2', sha256: 'abc123', rows },
  });
  return {
    outcome: {
      prediction: {
        label,
        probabilities: extinct
          ? { extinction: 0.58712, no_extinction: 0.41288 }
          : { extinction: 0.0241, no_extinction: 0.9759 },
      },
      support: {
        in_tested_range: true,
        out_of_range_fields: [],
        support_n: 10,
        threshold: 0.83,
        confidence: 'medium',
        nearest_tests: [
          nearest('C1', SHEET_A, 'disruption', 0.361),
          nearest('C2', 'FLEX-999', 'extinction', 0.399),
          nearest('C3', null, 'extinction', 0.95),
        ],
      },
      model: model('flex-outcome-0.2', 251),
    },
    extinction: {
      prediction: { extinction_diameter_ratio: 0.44531, extinction_diameter_mm: 1.33593, fuel_burned_fraction: 0.91169 },
      support: {
        in_tested_range: true,
        out_of_range_fields: [],
        support_n: 11,
        threshold: 1.016,
        confidence: 'high',
        nearest_tests: [nearest('C2', 'FLEX-999', 'extinction', 0.398), nearest('C4', 'FLEX-777', 'extinction', 0.666)],
      },
      model: model('flex-extinction-0.2', 156),
    },
    // Not part of what this service reads: it must still reach the frontend.
    engine_note: 'forwarded unchanged',
  };
}

function stubEngine(body: unknown = engineBody(), seen: LabInputs[] = []): Engine {
  return {
    predict: async (inputs) => {
      seen.push(inputs);
      return body;
    },
    modelInfo: async () => ({ inputs: { fuel: { type: 'enum', values: ['heptane', 'methanol'] } } }),
  };
}

const failingEngine = (error: Error): Engine => ({
  predict: async () => {
    throw error;
  },
  modelInfo: async () => {
    throw error;
  },
});

function scriptedChat(reply: string, calls: Message[][] = []): Chat {
  return async (messages) => {
    calls.push(messages);
    return reply;
  };
}

const unusedChat: Chat = async () => assert.fail('the LLM must not be called');

async function withCorpus(run: (corpus: Corpus) => Promise<void>) {
  await withIndex(async (path) => {
    const corpus = openCorpus(path);
    try {
      await run(corpus);
    } finally {
      corpus.db.close();
    }
  });
}

const promptOf = (calls: Message[][]) => String(calls[0]?.at(-1)?.content);

// --- labPredict -------------------------------------------------------------------------------

test('labPredict sends only the inputs to the engine and returns its body unchanged', async () => {
  await withCorpus(async (corpus) => {
    const seen: LabInputs[] = [];
    const body = engineBody();
    const result = await labPredict(
      { inputs: INPUTS, language: 'es' },
      { corpus, engine: stubEngine(body, seen), chat: scriptedChat('  La llama se apaga sola.  ') },
    );

    assert.deepEqual(seen, [INPUTS], 'no language or other field reaches the engine');
    assert.deepEqual(Object.keys(result), ['prediction', 'explanation', 'cited_tests']);
    assert.deepEqual(result.prediction, body, 'verbatim, extra fields included');
    assert.equal(result.explanation, 'La llama se apaga sola.');
  });
});

test('the explanation call gets the rules, the pre-formatted numbers, the support and the TestSheets', async () => {
  await withCorpus(async (corpus) => {
    const calls: Message[][] = [];
    await labPredict(
      { inputs: INPUTS, language: 'es' },
      { corpus, engine: stubEngine(), chat: scriptedChat('ok', calls) },
    );

    assert.equal(calls.length, 1, 'one LLM call');
    assert.deepEqual(calls[0][0], { role: 'system', content: LAB_SYSTEM });
    const prompt = promptOf(calls);
    for (const expected of [
      'Language of the explanation: Spanish (es)',
      '- fuel: heptane',
      '- droplet_d0_mm: 3',
      'Outcome model (flex-outcome-0.2, trained on 251 real ISS tests, PSI-2):',
      '- predicted outcome: extinction, the flame goes out on its own',
      '- probability that the flame goes out on its own: 58.7 %',
      '- probability that it does not: 41.3 %',
      '- real tests within the near distance: 10',
      '- confidence: medium',
      '- 2 of its 3 closest real tests ended as predicted (disruption 1, extinction 2; disruption and completion count as no extinction)',
      'Droplet at extinction (flex-extinction-0.2, trained on 156 real ISS tests where the flame went out):',
      '- D_ext/D0: 0.445',
      '- diameter when the flame goes out (D_ext): 1.34 mm, from an initial diameter D0 of 3 mm',
      '- share of the fuel burned before the flame goes out: 91.2 %',
      '- confidence: high',
      `- ${SHEET_A} (CIR test C1): ended in disruption. Conditions: heptane, 1.01 atm, O2 0.21, CO2 0, He 0, D0 2.78 mm. Closest #1 for the outcome model, within the near distance.`,
      '- CIR test C3: ended in extinction.',
      'Closest #3 for the outcome model, beyond the near distance.',
      `--- ${SHEET_A} ---\n${SHEET_A_TEXT}`,
      '--- FLEX-999: TestSheet not available ---',
    ]) {
      assert.ok(prompt.includes(expected), `prompt is missing: ${expected}\n\n${prompt}`);
    }
    assert.ok(!prompt.includes('0.58712'), 'raw floats never reach the model');
  });
});

test('a test both models found appears once, with both ranks', async () => {
  await withCorpus(async (corpus) => {
    const calls: Message[][] = [];
    await labPredict({ inputs: INPUTS, language: 'en' }, { corpus, engine: stubEngine(), chat: scriptedChat('ok', calls) });

    const prompt = promptOf(calls);
    assert.equal(prompt.split('- FLEX-999 (CIR test C2)').length - 1, 1);
    assert.ok(
      prompt.includes('Closest #2 for the outcome model, within the near distance; #1 for the extinction model, within the near distance.'),
    );
    // Outcome model's tests first, then the extinction model's new one.
    const order = closestTests(PredictionSchema.parse(engineBody())).map(({ test }) => test.cir_id);
    assert.deepEqual(order, ['C1', 'C2', 'C3', 'C4']);
  });
});

test('no extinction: no droplet block, and the extinction model tests are left out', async () => {
  await withCorpus(async (corpus) => {
    const calls: Message[][] = [];
    const result = await labPredict(
      { inputs: INPUTS, language: 'en' },
      { corpus, engine: stubEngine(engineBody('no_extinction')), chat: scriptedChat('It burns out.', calls) },
    );

    const prompt = promptOf(calls);
    assert.ok(prompt.includes('- predicted outcome: no extinction, the droplet burns out or breaks apart'));
    assert.ok(prompt.includes('Droplet at extinction: not applicable'));
    assert.ok(prompt.includes('- 1 of its 3 closest real tests ended as predicted'));
    for (const absent of ['0.445', '1.34 mm', '91.2 %', 'FLEX-777']) {
      assert.ok(!prompt.includes(absent), `prompt must not mention ${absent}`);
    }
    assert.deepEqual(result.cited_tests.map((cited) => cited.cir_id), ['C1', 'C2', 'C3']);
  });
});

test('cited_tests: the tests the explanation names, with their citation and PSI page', async () => {
  await withCorpus(async (corpus) => {
    const result = await labPredict(
      { inputs: INPUTS, language: 'es' },
      {
        corpus,
        engine: stubEngine(),
        chat: scriptedChat(`El test más cercano, ${SHEET_A}, terminó en disrupción; FLEX-999 y C3 se apagaron.`),
      },
    );

    assert.deepEqual(result.cited_tests, [
      {
        testsheet_id: SHEET_A,
        cir_id: 'C1',
        test_end: 'disruption',
        label: `"${SHEET_A}". PSI-2, folder Data/Tests.`,
        investigation_url: PSI2_URL,
      },
      {
        testsheet_id: 'FLEX-999',
        cir_id: 'C2',
        test_end: 'extinction',
        label: '"FLEX-999". PSI-2.',
        investigation_url: PSI2_URL,
      },
      {
        testsheet_id: null,
        cir_id: 'C3',
        test_end: 'extinction',
        label: '"CIR test C3". PSI-2.',
        investigation_url: PSI2_URL,
      },
    ]);
  });
});

test('cited_tests: every test when the explanation names none; ids match whole tokens only', async () => {
  await withCorpus(async (corpus) => {
    const result = await labPredict(
      { inputs: INPUTS, language: 'es' },
      // FLEX-9990 and C40 are not FLEX-999 or C4.
      { corpus, engine: stubEngine(), chat: scriptedChat('Sin pruebas citadas: FLEX-9990, C40.') },
    );
    assert.deepEqual(result.cited_tests.map((cited) => cited.cir_id), ['C1', 'C2', 'C3', 'C4']);
  });
});

test('an engine 422 becomes invalid inputs with the engine message, and the LLM is not called', async () => {
  await withCorpus(async (corpus) => {
    const detail = "fuel must be one of ['heptane', 'methanol'], got 'ethanol'";
    const rejected = new HttpError('engine /predict', 422, JSON.stringify({ detail }));
    await assert.rejects(
      labPredict({ inputs: { ...INPUTS, fuel: 'ethanol' }, language: 'es' }, { corpus, engine: failingEngine(rejected), chat: unusedChat }),
      (error) => error instanceof InvalidInputsError && error.message === detail,
    );
  });
});

test('engineDetail lists the fields of a schema 422 and keeps plain text', () => {
  const schemaError = JSON.stringify({
    detail: [
      { type: 'float_type', loc: ['body', 'o2'], msg: 'Input should be a valid number', input: '0.21' },
      { type: 'extra_forbidden', loc: ['body', 'fiber'], msg: 'Extra inputs are not permitted', input: true },
    ],
  });
  assert.equal(engineDetail(schemaError), 'o2: Input should be a valid number; fiber: Extra inputs are not permitted');
  assert.equal(engineDetail(JSON.stringify({ detail: 'o2 + co2 + he must be <= 1.0, got 1.1' })), 'o2 + co2 + he must be <= 1.0, got 1.1');
  assert.equal(engineDetail('not json'), 'not json');
  assert.equal(engineDetail(''), 'invalid inputs');
});

test('engine failures and unexpected bodies become predict_unavailable', async () => {
  await withCorpus(async (corpus) => {
    const isPredictUnavailable = (pattern: RegExp) => (error: unknown) =>
      error instanceof UpstreamError && error.code === 'predict_unavailable' && pattern.test(error.message);

    const cases: Array<[Engine, RegExp]> = [
      [failingEngine(new Error('fetch failed', { cause: { code: 'ECONNREFUSED' } })), /fetch failed \(ECONNREFUSED\)/],
      [failingEngine(new HttpError('engine /predict', 500, 'Internal Server Error')), /returned 500/],
      [stubEngine({ prediction: 'x' }), /unexpected body: outcome/],
      [stubEngine({ ...engineBody(), outcome: { ...engineBody().outcome, prediction: { label: 'maybe' } } }), /unexpected body/],
    ];
    for (const [engine, pattern] of cases) {
      await assert.rejects(labPredict({ inputs: INPUTS, language: 'es' }, { corpus, engine, chat: unusedChat }), isPredictUnavailable(pattern));
    }
  });
});

test('an LLM failure still returns the prediction, with explanation null and every test cited', async () => {
  await withCorpus(async (corpus) => {
    const warnings: string[] = [];
    const result = await labPredict(
      { inputs: INPUTS, language: 'es' },
      {
        corpus,
        engine: stubEngine(),
        chat: async () => {
          throw new Error('llm provider returned 503: overloaded');
        },
        warn: (message) => warnings.push(message),
      },
    );

    assert.deepEqual(result.prediction, engineBody());
    assert.equal(result.explanation, null);
    assert.equal(result.cited_tests.length, 4);
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /LLM explanation failed.*503: overloaded/);
  });
});

test('a failed TestSheet lookup still explains, without TestSheets', async () => {
  await withCorpus(async (corpus) => {
    const brokenDb = {
      prepare: () => {
        throw new Error('disk I/O error');
      },
    } as unknown as DatabaseSync;
    const warnings: string[] = [];
    const calls: Message[][] = [];
    const result = await labPredict(
      { inputs: INPUTS, language: 'es' },
      { corpus: { ...corpus, db: brokenDb }, engine: stubEngine(), chat: scriptedChat('ok', calls), warn: (m) => warnings.push(m) },
    );

    assert.match(warnings[0], /TestSheet lookup failed.*disk I\/O error/);
    assert.ok(promptOf(calls).includes(`--- ${SHEET_A}: TestSheet not available ---`));
    assert.equal(result.cited_tests[0].label, `"${SHEET_A}". PSI-2.`);
    assert.equal(result.cited_tests[0].investigation_url, null);
  });
});

test('labModelInfo forwards the engine body; a failure is model_info_unavailable', async () => {
  assert.deepEqual(await labModelInfo(stubEngine()), {
    inputs: { fuel: { type: 'enum', values: ['heptane', 'methanol'] } },
  });
  await assert.rejects(
    labModelInfo(failingEngine(new HttpError('engine /model-info', 503, 'down'))),
    (error) => error instanceof UpstreamError && error.code === 'model_info_unavailable' && /returned 503/.test(error.message),
  );
});

test('languageName names known codes and keeps unknown ones', () => {
  assert.equal(languageName('es'), 'Spanish (es)');
  assert.equal(languageName('pt-BR'), 'Brazilian Portuguese (pt-BR)');
  assert.equal(languageName('zz'), 'zz');
});

// --- HTTP: /lab/predict and /lab/model-info -----------------------------------------------------

type Call = { method: string; url: string; body: any };
type MockReplies = {
  predict?: { status: number; body: unknown };
  modelInfo?: { status: number; body: unknown };
  explanation?: string;
};

// One server standing in for the engine (/predict, /model-info) and the chat provider.
async function withMock(replies: MockReplies, run: (base: string, calls: Call[]) => Promise<void>) {
  const calls: Call[] = [];
  const server = createServer(async (req, res) => {
    const body = req.method === 'POST' ? await readJson(req) : undefined;
    calls.push({ method: String(req.method), url: String(req.url), body });
    const send = (status: number, value: unknown) => {
      res.writeHead(status, { 'content-type': 'application/json' });
      res.end(JSON.stringify(value));
    };
    if (req.method === 'POST' && req.url === '/predict') {
      const reply = replies.predict ?? { status: 200, body: engineBody() };
      return send(reply.status, reply.body);
    }
    if (req.method === 'GET' && req.url === '/model-info') {
      const reply = replies.modelInfo ?? { status: 200, body: { inputs: {} } };
      return send(reply.status, reply.body);
    }
    if (req.method === 'POST' && req.url === '/v1/chat/completions') {
      return send(200, { choices: [{ message: { content: replies.explanation ?? 'Se apaga sola.' } }] });
    }
    res.writeHead(404).end();
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;
  try {
    await run(`http://127.0.0.1:${port}`, calls);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

async function closedUrl(): Promise<string> {
  const server = createServer();
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;
  await new Promise<void>((resolve) => server.close(() => resolve()));
  return `http://127.0.0.1:${port}`;
}

// Wired the way server.ts does it.
const depsFor = (corpus: Corpus, engineUrl: string, llmUrl: string): AppDeps => ({
  corpus,
  chat: createChat({ url: `${llmUrl}/v1/chat/completions`, model: 'llm' }),
  embed: async () => assert.fail('the Lab never embeds'),
  engine: createEngine(engineUrl),
});

async function withLab(
  replies: MockReplies,
  run: (ctx: { app: ReturnType<typeof buildApp>; calls: Call[] }) => Promise<void>,
  urls: { engine?: string; llm?: string } = {},
) {
  await withCorpus(async (corpus) => {
    await withMock(replies, async (base, calls) => {
      const app = buildApp(depsFor(corpus, urls.engine ?? base, urls.llm ?? base), { logger: false });
      try {
        await run({ app, calls });
      } finally {
        await app.close();
      }
    });
  });
}

const labPost = (app: ReturnType<typeof buildApp>, payload: unknown) =>
  app.inject({ method: 'POST', url: '/lab/predict', payload: payload as object });

test('POST /lab/predict answers { prediction, explanation, cited_tests }', async () => {
  await withLab({ explanation: `Se apaga sola, como FLEX-999.` }, async ({ app, calls }) => {
    const response = await labPost(app, { inputs: INPUTS, language: 'es', extra: 'ignored' });

    assert.equal(response.statusCode, 200);
    const body = response.json();
    assert.deepEqual(Object.keys(body), ['prediction', 'explanation', 'cited_tests']);
    assert.deepEqual(body.prediction, engineBody());
    assert.equal(body.explanation, 'Se apaga sola, como FLEX-999.');
    assert.deepEqual(body.cited_tests.map((cited: any) => cited.testsheet_id), ['FLEX-999']);

    assert.deepEqual(calls.map((call) => `${call.method} ${call.url}`), ['POST /predict', 'POST /v1/chat/completions']);
    assert.deepEqual(calls[0].body, INPUTS, 'the inputs reach the engine exactly as sent');
    assert.equal(calls[1].body.response_format, undefined, 'the explanation is prose, not JSON mode');
  });
});

test('POST /lab/predict: an engine 422 is a 422 invalid_inputs with the engine detail; no LLM call', async () => {
  const detail = "suppressant_fraction must be 0 when suppressant is 'none'";
  await withLab({ predict: { status: 422, body: { detail } } }, async ({ app, calls }) => {
    const response = await labPost(app, { inputs: { ...INPUTS, suppressant_fraction: 0.2 }, language: 'es' });
    assert.equal(response.statusCode, 422);
    assert.deepEqual(response.json(), { error: 'invalid_inputs', detail });
    assert.deepEqual(calls.map((call) => call.url), ['/predict']);
  });
});

test('POST /lab/predict: a malformed body is a 400 and reaches nothing', async () => {
  await withLab({}, async ({ app, calls }) => {
    for (const payload of [
      { inputs: INPUTS },
      { language: 'es' },
      { inputs: 'fuel=heptane', language: 'es' },
      { inputs: INPUTS, language: 'español!' },
    ]) {
      const response = await labPost(app, payload);
      assert.equal(response.statusCode, 400, JSON.stringify(payload));
      assert.equal(response.json().error, 'bad_request');
    }
    assert.equal(calls.length, 0);
  });
});

test('POST /lab/predict never coerces the input values', async () => {
  await withLab({}, async ({ app, calls }) => {
    const inputs = { ...INPUTS, o2: '0.21', pressure_atm: true };
    await labPost(app, { inputs, language: 'es' });
    assert.deepEqual(calls[0].body, inputs, 'the engine decides; here a string and a boolean stay as sent');
  });
});

test('POST /lab/predict: engine down is a 502 predict_unavailable', async () => {
  const down = await closedUrl();
  await withLab(
    {},
    async ({ app }) => {
      const response = await labPost(app, { inputs: INPUTS, language: 'es' });
      assert.equal(response.statusCode, 502);
      assert.equal(response.json().error, 'predict_unavailable');
      assert.match(response.json().detail, /fetch failed \(.*ECONNREFUSED/);
    },
    { engine: down },
  );
});

test('POST /lab/predict: LLM down is still a 200, with explanation null', async () => {
  const down = await closedUrl();
  await withLab(
    {},
    async ({ app }) => {
      const response = await labPost(app, { inputs: INPUTS, language: 'es' });
      assert.equal(response.statusCode, 200);
      assert.equal(response.json().explanation, null);
      assert.deepEqual(response.json().prediction, engineBody());
    },
    { llm: down },
  );
});

test('GET /lab/model-info forwards the engine body; engine down is a 502 model_info_unavailable', async () => {
  const info = { inputs: { o2: { type: 'float', min: 0.12, max: 0.34 } }, outcome: { model_version: 'flex-outcome-0.2' } };
  await withLab({ modelInfo: { status: 200, body: info } }, async ({ app, calls }) => {
    const response = await app.inject({ method: 'GET', url: '/lab/model-info' });
    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), info);
    assert.deepEqual(calls.map((call) => `${call.method} ${call.url}`), ['GET /model-info']);
  });

  const down = await closedUrl();
  await withLab(
    {},
    async ({ app }) => {
      const response = await app.inject({ method: 'GET', url: '/lab/model-info' });
      assert.equal(response.statusCode, 502);
      assert.equal(response.json().error, 'model_info_unavailable');
    },
    { engine: down },
  );
});

test('without an engine, /lab/* is not served', async () => {
  await withCorpus(async (corpus) => {
    const { engine: _engine, ...deps } = depsFor(corpus, 'http://127.0.0.1:9', 'http://127.0.0.1:9');
    const app = buildApp(deps, { logger: false });
    try {
      const response = await labPost(app, { inputs: INPUTS, language: 'es' });
      assert.equal(response.statusCode, 404);
      assert.equal(response.json().error, 'not_found');
    } finally {
      await app.close();
    }
  });
});

// --- The real corpus.db -----------------------------------------------------------------------

const CORPUS = fileURLToPath(new URL('../storage/corpus.db', import.meta.url));

test('real corpus.db: the engine test ids find their FLEX TestSheets and the PSI-69 page', () => {
  const corpus = openCorpus(CORPUS, { warn: () => {} });
  try {
    const sheets = findTestSheets(corpus.db, 'PSI-69', ['FLEX-046', 'FLEX-204', 'FLEX-046', 'FLEX-NOPE']);
    assert.deepEqual([...sheets.keys()].sort(), ['FLEX-046', 'FLEX-204']);

    const sheet = sheets.get('FLEX-046')!;
    assert.equal(sheet.title, 'FLEX-046_TestSheet');
    assert.equal(sheet.psiFolder, 'Raw Data');
    assert.match(sheet.text, /CIR Test Number: 205R001/);
    assert.match(sheet.text, /Fuel: Methanol/);

    assert.deepEqual(findInvestigation(corpus.db, 'PSI-69'), {
      acronym: 'FLEX',
      investigationUrl: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-69',
    });
    assert.equal(findInvestigation(corpus.db, 'PSI-0'), null);
    assert.equal(findTestSheets(corpus.db, 'PSI-25', ['FLEX-046']).size, 0, 'only the accession the models used');
  } finally {
    corpus.db.close();
  }
});
