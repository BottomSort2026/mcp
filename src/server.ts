import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import Fastify from 'fastify';
import { config } from './config.ts';
import { countChunks, openDb } from './db.ts';
import { embed } from './embeddings.ts';
import { buildMcpServer, type McpDeps } from './mcp.ts';
import { ask } from './pipeline.ts';
import { createPredict } from './predict.ts';
import { createChat } from './provider.ts';
import type { Embed } from './rag.ts';

const embedQuery: Embed = (text) =>
  embed(text, {
    url: config.embedUrl,
    model: config.embedModel || "",
    dim: config.dim,
  });

const deps: McpDeps = {
  db: openDb(config.dbPath, config.dim),
  embed: embedQuery,
  chat: createChat({ url: config.llmUrl, model: config.llmModel, apiKey: config.llmApiKey }),
  predict: config.predictUrl ? createPredict(config.predictUrl) : undefined,
};

const app = Fastify({ logger: true });

app.get('/health', async () => ({ ok: true, chunks: countChunks(deps.db) }));

app.post<{ Body: { prompt: string } }>(
  '/ask',
  {
    schema: {
      body: {
        type: 'object',
        required: ['prompt'],
        additionalProperties: false,
        properties: {
          prompt: { type: 'string', minLength: 1, maxLength: 4000 },
        },
      },
    },
  },
  async (request, reply) => {
    try {
      return await ask(request.body.prompt, deps);
    } catch (error) {
      request.log.error(error);
      return reply.code(502).send({ error: (error as Error).message });
    }
  },
);

// Stateless MCP: a fresh server and transport per request, plain JSON responses.
app.post('/mcp', async (request, reply) => {
  reply.hijack();

  const server = buildMcpServer(deps);
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
    reply.raw.end(JSON.stringify({ error: 'mcp request failed' }));
  }
});

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    void app.close().then(() => {
      deps.db.close();
      process.exit(0);
    });
  });
}

await app.listen({ port: config.port });
