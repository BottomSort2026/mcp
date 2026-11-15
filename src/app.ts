import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import Fastify, { type FastifyError, type FastifyInstance, type FastifyServerOptions } from 'fastify';
import { UpstreamError } from './errors.ts';
import { normalizeHistory } from './history.ts';
import { buildMcpServer } from './mcp.ts';
import { ask, MAX_MESSAGE_CHARS, type PipelineDeps } from './pipeline.ts';

/** What the routes need; each request supplies its own logger as `warn`. */
export type AppDeps = Omit<PipelineDeps, 'warn'>;

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
