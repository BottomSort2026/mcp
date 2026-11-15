import type { DatabaseSync } from 'node:sqlite';
import type { Chat, Message } from './provider.ts';
import type { Predict } from './predict.ts';
import { search, type Embed, type SearchHit } from './rag.ts';
import { route } from './router.ts';

export const REJECT_MESSAGE = 'no entiendo lo que estas diciendo.';

const MAX_PROMPT_CHARS = 4000;
const MAX_CONTEXT_CHARS = 6000;
const HITS = 5;
const ANSWER_LANGUAGE = 'Answer in the language of the original user message.';

export type AskResult =
  | { answer: string; intent: 'reject' }
  | { answer: string; intent: 'investigate'; hits: SearchHit[] }
  | { answer: string; intent: 'simulate'; prediction: unknown };

export type PipelineDeps = {
  db: DatabaseSync;
  embed: Embed;
  chat: Chat;
  predict?: Predict;
};

export async function ask(prompt: string, deps: PipelineDeps): Promise<AskResult> {
  const original = prompt.trim();
  if (!original || original.length > MAX_PROMPT_CHARS) {
    return { answer: REJECT_MESSAGE, intent: 'reject' };
  }

  const decision = await route(original, deps.chat);
  if (!decision.sensible) return { answer: REJECT_MESSAGE, intent: 'reject' };

  if (decision.intent === 'simulate' && deps.predict) {
    const prediction = await deps.predict(decision.params);
    const answer = await deps.chat([
      {
        role: 'system',
        content: `You report simulation results for the user. Use only the prediction data below; never invent numbers. ${ANSWER_LANGUAGE}`,
      },
      {
        role: 'user',
        content: [
          `Original message:\n${original}`,
          `English:\n${decision.english}`,
          `Parameters:\n${JSON.stringify(decision.params)}`,
          `Prediction result:\n${JSON.stringify(prediction)}`,
        ].join('\n\n'),
      },
    ]);
    return { answer: answer.trim(), intent: 'simulate', prediction };
  }

  // The query is embedded in English, the same language the index was built in.
  const hits = await search(deps.db, decision.english, HITS, deps.embed);
  const context =
    hits
      .map((hit, i) => `[${i + 1}] ${hit.content}`)
      .join('\n\n')
      .slice(0, MAX_CONTEXT_CHARS) || '(no matching passages)';

  const messages: Message[] = [
    {
      role: 'system',
      content: `You answer questions about the provided PDF passages. Use only the context below. If it does not contain the answer, say so in one sentence instead of guessing. ${ANSWER_LANGUAGE}`,
    },
    {
      role: 'user',
      content: `Original message:\n${original}\n\nEnglish:\n${decision.english}\n\nContext:\n${context}`,
    },
  ];

  const answer = await deps.chat(messages);
  return { answer: answer.trim(), intent: 'investigate', hits };
}
