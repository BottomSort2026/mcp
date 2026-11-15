import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import Fastify, { type FastifyError, type FastifyInstance, type FastifyServerOptions } from 'fastify';
import type { Engine, LabInputs } from './engine.ts';
import { InvalidInputsError, UpstreamError } from './errors.ts';
import { normalizeHistory } from './history.ts';
import { labModelInfo, labPredict } from './lab.ts';
import { buildMcpServer } from './mcp.ts';
import { ask, MAX_MESSAGE_CHARS, type PipelineDeps } from './pipeline.ts';

/** What the routes need; each request supplies its own logger as `warn`. */
export type AppDeps = Omit<PipelineDeps, 'warn'> & {
  /** The engine's FLEX endpoints for the Flame Lab. Without it, /lab/* is not served. */
  engine?: Engine;
};

export type AppOptions = { logger?: FastifyServerOptions['logger'] };

type ChatBody = { message: string; history?: unknown };

// Unknown fields are ignored, not rejected (no additionalProperties: false), and
// history is validated entry by entry in normalizeHistory, which drops bad entries.
const CHAT_BODY = {
  type: 'object',
  required: ['message'],
  properties: {
    message: { type: 'string', minLength: 1, maxLength: MAX_MESSAGE_CHARS },
  },
} as const;

type LabPredictBody = { inputs: LabInputs; language: string };

// The engine validates the inputs themselves (names, values, ranges): this only checks the shape, and
// never coerces the values, so they reach the engine exactly as the frontend sent them.
const LAB_PREDICT_BODY = {
  type: 'object',
  required: ['inputs', 'language'],
  properties: {
    inputs: { type: 'object', maxProperties: 32 },
    // The UI language, a BCP 47 tag such as "es" or "pt-BR".
    language: { type: 'string', minLength: 2, maxLength: 35, pattern: '^[A-Za-z]{2,3}(-[A-Za-z0-9]{1,8})*$' },
  },
} as const;

/** Errors use the gateway's shape: { error: <code>, detail: <text> }. */
const problem = (error: string, detail: string) => ({ error, detail });

export function buildApp(deps: AppDeps, options: AppOptions = {}): FastifyInstance {
  const app = Fastify({
    logger: options.logger ?? true,
    // The gateway's request id becomes ours, so log lines match across services.
    requestIdHeader: 'x-request-id',
  });

  app.setErrorHandler((error: FastifyError, request, reply) => {
    if (error instanceof UpstreamError) {
      request.log.error({ err: error }, error.code);
      return reply.code(502).send(problem(error.code, error.message));
    }
    if (error instanceof InvalidInputsError) {
      // The engine's own message, for the frontend to show next to the controls.
      request.log.info({ detail: error.message }, 'invalid lab inputs');
      return reply.code(422).send(problem('invalid_inputs', error.message));
    }
    const status = error.statusCode ?? 500;
    if (status >= 400 && status < 500) {
      // Schema validation, malformed JSON, unsupported content type, oversized body.
      return reply.code(status).send(problem('bad_request', error.message));
    }
    request.log.error({ err: error }, 'unexpected error');
    return reply.code(500).send(problem('internal_error', 'unexpected server error'));
  });

  app.setNotFoundHandler((request, reply) =>
    reply.code(404).send(problem('not_found', `${request.method} ${request.url} does not exist`)),
  );

  // Read from corpus_info, held in memory since boot: no network, no query.
  app.get('/health', async () => {
    const { built_at, embedding, counts } = deps.corpus.info;
    return {
      ok: true,
      corpus: {
        built_at,
        embedding_model: embedding.model_id,
        dimension: embedding.dimension,
        counts,
      },
    };
  });

  app.post<{ Body: ChatBody }>('/chat', { schema: { body: CHAT_BODY } }, async (request) => {
    const result = await ask(
      { message: request.body.message, history: normalizeHistory(request.body.history) },
      { ...deps, warn: (message) => request.log.warn(message) },
    );
    request.log.info(
      { intent: result.intent, retrieval: result.retrieval, citations: result.citations.length },
      'chat answered',
    );
    return result;
  });

  // Flame Lab: one press of Predict, one request. The prediction is the engine's response, unchanged.
  const engine = deps.engine;
  if (engine) {
    app.post<{ Body: LabPredictBody }>('/lab/predict', { schema: { body: LAB_PREDICT_BODY } }, async (request) => {
      const result = await labPredict(
        { inputs: request.body.inputs, language: request.body.language },
        { corpus: deps.corpus, engine, chat: deps.chat, warn: (message) => request.log.warn(message) },
      );
      request.log.info(
        { explained: result.explanation !== null, cited_tests: result.cited_tests.length },
        'lab predicted',
      );
      return result;
    });

    app.get('/lab/model-info', async () => labModelInfo(engine));
  }

  // Stateless MCP: a fresh server and transport per request, plain JSON responses.
  app.post('/mcp', async (request, reply) => {
    reply.hijack();

    const server = buildMcpServer({ ...deps, warn: (message) => request.log.warn(message) });
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });

    reply.raw.on('close', () => {
      void transport.close();
      void server.close();
    });

    try {
      await server.connect(transport);
      await transport.handleRequest(request.raw, reply.raw, request.body);
    } catch (error) {
      request.log.error(error);
      if (!reply.raw.headersSent) {
        reply.raw.writeHead(500, { 'content-type': 'application/json' });
      }
      reply.raw.end(JSON.stringify(problem('internal_error', 'mcp request failed')));
    }
  });

  return app;
}
