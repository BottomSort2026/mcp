# mcp-rag

Read-only query layer over a vector index built by another service, plus a small
routing pipeline that answers in the user's language.

```
prompt (any language)
  → router LLM call: { sensible, english, intent, params? }
      ├─ not sensible ────────────────► "no entiendo lo que estas diciendo."
      ├─ investigate: embed(english) → vec0 KNN → LLM answer from passages
      └─ simulate:    POST /predict  → LLM answer from the prediction data
```

Chunking and document inserts belong to the training service; this server never
writes to the index. The only embedding it does is the query vector.

## Requirements

- Node >= 22.5 (`node:sqlite` is still flagged experimental, so boot prints one `ExperimentalWarning`)
- pnpm (`packageManager: pnpm@12.14.0`; `pnpm-workspace.yaml` holds `allowBuilds: esbuild: true`)
- An index file built by the training service
- An embedding engine and a chat provider with matching models, both OpenAI-compatible

## Quickstart

```bash
pnpm install
cp .env.example .env   # point DB_PATH at the index, set models and URLs
pnpm dev
```

```bash
curl -s localhost:3000/health
curl -s -X POST localhost:3000/ask -H 'content-type: application/json' \
  -d '{"prompt":"¿qué comen los gatos?"}'
```

```json
{
  "answer": "Los gatos comen carne.",
  "intent": "investigate",
  "hits": [{ "documentId": "pdf-1", "seq": 4, "content": "…", "score": 0.83 }]
}
```

## API

| Route | Purpose |
|---|---|
| `POST /ask` | `{ prompt }` → `{ answer, intent, hits?, prediction? }`. Rejections return `200` with the fixed message. Provider/predict failures return `502`. |
| `GET /health` | `{ ok, chunks }` |
| `POST /mcp` | Streamable HTTP, stateless |

MCP tool: `ask_question({ prompt })` — the same pipeline, answers in the prompt's language.

## Index contract

The training service must have created exactly this table:

```sql
CREATE VIRTUAL TABLE chunks USING vec0(
  id TEXT PRIMARY KEY,
  embedding FLOAT[1536] distance_metric=cosine,
  +document_id TEXT,
  +seq INTEGER,
  +content TEXT
);
```

Both sides must use the same model and normalization. `EMBED_DIM` is checked at boot
against the dimension actually stored, so a mismatch fails immediately. If the writer used
WAL, checkpoint the file before handoff so no `-wal`/`-shm` sidecar is required.

## Provider contract

OpenAI-compatible chat completions, one call for routing and one for the answer:

```json
{ "model": "llama3.1", "messages": [{ "role": "user", "content": "…" }],
  "response_format": { "type": "json_object" } }
```

The router asks for `{"sensible":bool,"english":string,"intent":"investigate"|"simulate","params":{}}`.
Unparseable output, `sensible: false`, or a simulate request without concrete values is
handled conservatively: rejection, or fall back to retrieval.

## Predict contract

`POST $PREDICT_URL` with the routed parameters as a flat JSON object of numbers, strings and
booleans. Any other body shape is the simulation engine's business; the response is returned
to the LLM verbatim inside the answer prompt. Without `PREDICT_URL`, simulate falls back to
retrieval.

## Layout

```
src/config.ts      DB_PATH, PORT, EMBED_*, LLM_*, PREDICT_URL
src/http.ts        POST JSON with a 20s timeout
src/db.ts          read-only open, sqlite-vec load, table + dimension check
src/embeddings.ts  query embedding, dimension check
src/rag.ts         vec0 KNN over the query vector
src/provider.ts    chat completions helper
src/router.ts      translation + sense check + intent classification
src/predict.ts     simulation call
src/pipeline.ts    ask(): guard, route, branch, answer
src/mcp.ts         MCP server and tools
src/server.ts      Fastify routes
test/              fixtures, retrieval, pipeline, provider/predict and end-to-end flow tests
```

## Deliberately not included

- Ingest, chunking, re-embedding — the training service owns the index
- Query or answer caching
- Auth on REST and MCP — put it behind a gateway before exposing it
- Hybrid search, reranking, pagination (`k` capped at 50)
- Streaming answers

## Known limits

- `node:sqlite` is synchronous: a KNN query blocks the event loop. Fine at template scale.
- SQLite is a single-writer store; this process opens the file read-only. Do not run two writers.
- The index is fixed at boot: replacing the file requires a restart.
- The router's "sensible" judgment is a model guess, so borderline prompts are sometimes
  rejected or accepted. The fixed Spanish rejection message is the only feedback.
- Each `/ask` costs two LLM calls plus one embedding call (and one predict call when simulating).
