import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { ask, type AskResult, type PipelineDeps } from './pipeline.ts';

export type McpDeps = PipelineDeps;

export function buildMcpServer(deps: McpDeps): McpServer {
  const server = new McpServer({ name: 'mcp-rag', version: '0.1.0' });

  server.registerTool(
    'ask_question',
    {
      title: 'Ask a question',
      description:
        'Ask about NASA microgravity combustion research and spacecraft fire safety, in any language. The answer comes from the PSI investigations and NASA resources in the corpus, marks each claim with [n], and ends with the numbered Sources.',
      inputSchema: {
        prompt: z.string().min(1).describe('The user message, in any language'),
      },
    },
    async ({ prompt }) => {
      try {
        const result = await ask({ message: prompt }, deps);
        return { content: [{ type: 'text', text: withSources(result) }] };
      } catch (error) {
        return { isError: true, content: [{ type: 'text', text: (error as Error).message }] };
      }
    },
  );

  return server;
}

/** The answer, then a "Sources" list: one line per citation with its label and link. */
export function withSources(result: Pick<AskResult, 'answer' | 'citations'>): string {
  if (result.citations.length === 0) return result.answer;
  const lines = result.citations.map((citation) => {
    const url = citation.investigation_url ?? citation.public_url;
    return [`[${citation.n}]`, citation.label, url].filter(Boolean).join(' ');
  });
  return `${result.answer}\n\nSources:\n${lines.join('\n')}`;
}
