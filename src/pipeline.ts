import { cite, investigationName, type Citation } from './citations.ts';
import type { Corpus } from './db.ts';
import { upstream } from './errors.ts';
import type { Turn } from './history.ts';
import type { Chat, Message } from './provider.ts';
import type { Predict } from './predict.ts';
import { search, type Embed, type SearchHit, type Warn } from './rag.ts';
import { route } from './router.ts';

export const REJECT_MESSAGE = 'no entiendo lo que estas diciendo.';

export const MAX_MESSAGE_CHARS = 4000;
/** Fits k = 5 whole passages: chunks reach about 2300 characters, plus their header lines. */
export const MAX_CONTEXT_CHARS = 16_000;
const NO_PASSAGES = '(no matching passages)';

export type Retrieval = 'hybrid' | 'bm25' | 'none';

export type AskInput = { message: string; history?: Turn[] };

/** Exactly the /chat response body. */
export type AskResult = {
  answer: string;
  intent: 'investigate' | 'simulate' | 'reject';
  retrieval: Retrieval;
  citations: Citation[];
};

export type PipelineDeps = {
  corpus: Corpus;
  embed: Embed;
  chat: Chat;
  predict?: Predict;
  /** Receives the warning logged when search falls back to BM25. Defaults to console.warn. */
  warn?: Warn;
};

export const ANSWER_SYSTEM = `You are Flame in Freefall, an assistant on NASA microgravity combustion research and
spacecraft fire safety, for researchers and for students.

Rules:
- Answer only from the numbered passages in the last message. If they do not answer the question,
  say so in one sentence and do not guess.
- Put the passage number in brackets after each claim you take from it, like [2] or [1, 3]. Use only
  the numbers of the passages you were given.
- Do not write URLs, a reference list or a sources section: the sources are shown to the user
  separately.
- Answer in the language of the user's latest message. Keep technical terms, units, acronyms and
  document titles exactly as written in the passages (SAFFIRE-III, PMMA, LOI, CO2, mm2/s); you may
  explain them in the user's language.
- Explain basic concepts plainly for students and be precise for researchers.
- These are research results. Never present them as material certification, flight qualification
  or engineering approval.`;

const SIMULATE_SYSTEM = `You report simulation results for Flame in Freefall, an assistant on NASA microgravity
combustion research and spacecraft fire safety. Use only the prediction data below and never
invent numbers. Answer in the language of the user's latest message. A prediction is not a
material certification or an engineering approval.`;

const reject = (): AskResult => ({
  answer: REJECT_MESSAGE,
  intent: 'reject',
  retrieval: 'none',
  citations: [],
});

/**
 * Route and translate, search, answer. Only the LLM (and predict, when
 * enabled) can fail a request; an engine failure degrades search to BM25.
 */
export async function ask(input: AskInput, deps: PipelineDeps): Promise<AskResult> {
  const message = input.message.trim();
  if (!message || Array.from(message).length > MAX_MESSAGE_CHARS) return reject();
  const history = input.history ?? [];

  const decision = await upstream('llm_unavailable', () => route(message, history, deps.chat));
  if (!decision.sensible) return reject();

  const predict = deps.predict;
  if (decision.intent === 'simulate' && predict) {
    const prediction = await upstream('predict_unavailable', () => predict(decision.params));
    const answer = await upstream('llm_unavailable', () =>
      deps.chat([
        { role: 'system', content: SIMULATE_SYSTEM },
        ...history,
        {
          role: 'user',
          content: [
            `Message:\n${message}`,
            `Parameters:\n${JSON.stringify(decision.params)}`,
            `Prediction result:\n${JSON.stringify(prediction)}`,
          ].join('\n\n'),
        },
      ]),
    );
    return { answer: answer.trim(), intent: 'simulate', retrieval: 'none', citations: [] };
  }

  // The corpus is searched in English with the router's standalone query.
  const { mode, hits } = await search(
    deps.corpus,
    decision.english,
    deps.embed,
    deps.warn ?? console.warn,
  );
  const passages = fitPassages(hits, MAX_CONTEXT_CHARS);

  const messages: Message[] = [
    { role: 'system', content: ANSWER_SYSTEM },
    ...history,
    { role: 'user', content: answerPrompt(message, decision.english, passages) },
  ];
  const raw = await upstream('llm_unavailable', () => deps.chat(messages));

  const { answer, citations } = cite(raw.trim(), passages);
  return { answer, intent: 'investigate', retrieval: mode, citations };
}

/** "[2] Title | type: testsheet | page 7 | investigation: BASS-II (PSI-25)", then the text. */
export function passageBlock(hit: SearchHit, n: number): string {
  const header = [`[${n}] ${hit.title}`, `type: ${hit.docType}`];
  if (hit.page !== null) {
    header.push(
      hit.pageEnd !== null && hit.pageEnd !== hit.page
        ? `pages ${hit.page}-${hit.pageEnd}`
        : `page ${hit.page}`,
    );
  }
  const investigation = investigationName(hit.acronym, hit.accession);
  if (investigation) header.push(`investigation: ${investigation}`);
  return `${header.join(' | ')}\n${hit.text}`;
}

/**
 * The best-ranked passages that fit in `budget` characters. Whole passages are
 * dropped from the end; none is ever cut. The first one is always kept.
 */
export function fitPassages(hits: SearchHit[], budget: number): SearchHit[] {
  const kept: SearchHit[] = [];
  let used = 0;
  for (const hit of hits) {
    const size = passageBlock(hit, kept.length + 1).length + 2;
    if (kept.length > 0 && used + size > budget) break;
    kept.push(hit);
    used += size;
  }
  return kept;
}

function answerPrompt(message: string, english: string, passages: SearchHit[]): string {
  const context =
    passages.map((hit, index) => passageBlock(hit, index + 1)).join('\n\n') || NO_PASSAGES;
  return `Question:\n${message}\n\nEnglish search query:\n${english}\n\nPassages:\n${context}`;
}
