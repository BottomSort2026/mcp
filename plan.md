# Plan: Translate → route → RAG/predict → LLM answer

Branch: `plan/ask-pipeline`
Created: 2026-11-14

## Goal

Extend the current read-only MCP + RAG query layer into a small agent on the server side:

1. Translate/validate the incoming prompt with the provider.
2. Embed the English text and search the prebuilt sqlite-vec index, or call `/predict` when the
   user wants a simulation.
3. Send the prompt plus retrieved context or prediction data to the LLM and return its answer.
4. Reject prompts that cannot be translated or make no sense with the literal message
   "no entiendo lo que estas diciendo."

## Context

- Current service: MCP tool `search_knowledge` and REST `POST /search` over an index file built by
  the training service. The server opens it read-only; embeddings come from an external engine.
- Index contract (already implemented): `chunks` is a `vec0` table with `FLOAT[N] distance_metric=cosine`
  and aux columns `document_id`, `seq`, `content`. `EMBED_DIM` is checked at boot.
- The embedding engine already has the model loaded; this service only embeds one query per request.
- SQL injection is inert: every query uses bound parameters and the prompt never reaches SQL.
  The real injection surface is `/predict` parameters, which must be validated/whitelisted.
- Document chunking and insertion belong to the training service; not part of this plan.
- Reject message is a fixed Spanish string; the answer language is still undecided (see below).

## Approach

1. `src/provider.ts` — OpenAI-compatible chat helper: `chat(messages, { json?: boolean })` against
   `LLM_URL`/`LLM_MODEL`/`LLM_API_KEY`, with a 20s timeout.
2. `src/router.ts` — one structured provider call returning
   `{ sensible, english, intent: 'investigate' | 'simulate', params? }`.
   Strict parse; invalid JSON or `sensible: false` falls back to the reject message.
   One call handles translation, sense check, intent, and parameter extraction.
3. `src/predict.ts` — `POST $PREDICT_URL`, validates parameters against a fixed schema, returns data.
4. `src/pipeline.ts` — `ask(prompt)`:
   - guard: trim, reject empty or over 4000 chars without any HTTP call;
   - route;
   - investigate: `embed(english)` → vec0 KNN → answer prompt with hits;
   - simulate: `/predict(params)` → answer prompt with returned data (optional RAG deferred);
   - return `{ answer, intent, hits }`.
5. Wire it up: MCP tool `ask_question`, REST `POST /ask`, `/health`.
6. Add config: `LLM_URL`, `LLM_MODEL`, `LLM_API_KEY?`, `PREDICT_URL`.
7. Tests against stub HTTP servers: translation used for embedding, rejection without embedding,
   malformed router JSON, simulate path with predict data, predict failure, empty-prompt guard.

## Files / Areas

- `src/provider.ts` (new)
- `src/router.ts` (new)
- `src/predict.ts` (new)
- `src/pipeline.ts` (new)
- `src/mcp.ts` (tool `ask_question`)
- `src/server.ts` (add `POST /ask`)
- `src/config.ts` (provider and predict settings)
- `src/embeddings.ts`, `src/rag.ts` (reused unchanged; embed receives English text)
- `test/rag.test.ts` or a new `test/pipeline.test.ts`
- `.env.example`, `README.md`

## Verification

- `pnpm test` — all stub-based cases above, no network.
- `pnpm build` — `dist` imports stay `.js` after the `.ts` source rewrite.
- Live smoke with stub provider + engine + predict:
  - Spanish prompt reaches embed as English; answer returned over MCP and REST.
  - gibberish returns the reject message and never calls embed.
  - simulate prompt hits `/predict` and returns an answer.
  - provider or predict down returns `502` on REST and `isError` on MCP.

## Decisions

1. `/predict` is called with the routed parameters as a flat JSON object; the body shape is the
   simulation engine's contract, isolated in `src/predict.ts`.
2. MCP exposes only `ask_question`; the chatbox path is the only user-facing surface.
3. Answers are written in the language of the original prompt; the query is embedded in English.
4. No third mode: every sensible non-simulate prompt goes through retrieval, and a simulate
   request without concrete values falls back to retrieval.

