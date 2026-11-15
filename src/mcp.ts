import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { DatabaseSync } from 'node:sqlite';
import { z } from 'zod';
import { ask } from './pipeline.ts';
import type { Chat } from './provider.ts';
import type { Predict } from './predict.ts';
import type { Embed } from './rag.ts';

export type McpDeps = {
  db: DatabaseSync;
  embed: Embed;
  chat: Chat;
  predict?: Predict;
};

export function buildMcpServer(deps: McpDeps): McpServer {
  const server = new McpServer({ name: 'mcp-rag', version: '0.1.0' });

  server.registerTool(
    'ask_question',
    {
      title: 'Ask a question',
      description:
        'Ask in any language. The question is translated and routed: it either searches the PDF index and answers from the matching passages, or runs a simulation when concrete values are given.',
      inputSchema: {
        prompt: z.string().min(1).describe('The user message, in any language'),
      },
    },
    async ({ prompt }) => {
      try {
        const result = await ask(prompt, deps);
        return { content: [{ type: 'text', text: result.answer }] };
      } catch (error) {
        return { isError: true, content: [{ type: 'text', text: (error as Error).message }] };
      }
    },
  );

  return server;
}
