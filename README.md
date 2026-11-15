# Flame in Freefall · MCP service

The chatbot backend of Flame in Freefall (NASA Space Apps 2026). It answers questions about NASA
microgravity combustion research and spacecraft fire safety, for researchers and students, from a
read-only corpus of NASA PSI investigations and NASA resources. Every claim in an answer carries a
`[n]` marker, and the server attaches the matching citations.

```
frontend → gateway → POST /chat ─┐
MCP clients ──────→ POST /mcp ───┤
                                 ▼
  { message, history } → router LLM call: { sensible, english, intent, params? }
      ├─ not sensible ──► "no entiendo lo que estas diciendo."         (intent: reject)
      ├─ investigate: BM25 + engine /embed → vec0 KNN → RRF → answer LLM call → citations
      └─ simulate:    engine /predict → answer LLM call   (only with PREDICT_ENABLED=true)
```

The pipeline is fixed (route and translate, search, answer); it is not a tool-calling agent. The
corpus is built by the `train` repo; this service never writes to it.

## Routes

| Route | Purpose |
|---|---|
| `POST /chat` | The chat contract below. The gateway forwards it unchanged. |
| `POST /mcp` | MCP over Streamable HTTP, stateless. Tool `ask_question({ prompt })`: the same pipeline, with a "Sources" list after the answer. |
| `GET /health` | `{ ok, corpus: { built_at, embedding_model, dimension, counts } }`, from `corpus_info`. No network call. |

The service binds `0.0.0.0:8001`, uses the incoming `X-Request-ID` as its request id (so its logs
match the gateway's), and sends no CORS headers: the gateway owns them.

## Chat contract

```
POST /chat
{ "message": "¿Cómo afecta el CO2 a la extinción de una gota de heptano?",
  "history": [ { "role": "user" | "assistant", "content": "..." } ] }        // optional
```

- `message`: 1 to 4000 characters. Unknown fields are ignored.
- `history`: only the last 6 well-formed entries are used, each cut to 2000 characters. Malformed
  entries (other roles, missing or non-string content) are dropped silently.

A response from the real corpus (the answer text is shortened; this one ran with the engine
down, hence `bm25`):

```json
{
  "answer": "El CO2 diluye el oxígeno alrededor de la gota de heptano … [1]. … [2].",
  "intent": "investigate",
  "retrieval": "bm25",
  "citations": [
    { "n": 1,
      "label": "Gokoglu, Dietrich, Stocker, Ferkul, Olson, Hicks (2015), \"A Researcher's Guide to: Combustion Science (Combustion in Reduced Gravity), NP-2015-10-034-JSC\", p. 16.",
      "doc_title": "A Researcher's Guide to: Combustion Science (Combustion in Reduced Gravity), NP-2015-10-034-JSC",
      "doc_authors": "Gokoglu, Dietrich, Stocker, Ferkul, Olson, Hicks", "year": 2015,
      "doc_type": "book", "page": 16, "page_end": 16,
      "accession": null, "acronym": null, "related_accessions": [],
      "file_name": null, "psi_folder": null,
      "investigation_url": null,
      "public_url": "https://www.nasa.gov/wp-content/uploads/2016/05/np-2015-10-034-jsc_combustion_in_reduced_gravity-iss-mini-book-011116-508.pdf" },
    { "n": 2,
      "label": "\"Advanced Combustion via Microgravity Experiments / Coflow Laminar Diffusion Flame — investigation summary\". ACME CLD Flame (PSI-21).",
      "doc_title": "Advanced Combustion via Microgravity Experiments / Coflow Laminar Diffusion Flame — investigation summary",
      "doc_authors": null, "year": null,
      "doc_type": "metadata", "page": null, "page_end": null,
      "accession": "PSI-21", "acronym": "ACME CLD Flame", "related_accessions": [],
      "file_name": null, "psi_folder": null,
      "investigation_url": "https://psi.nasa.gov/physci/repo/data/investigations/PSI-21",
      "public_url": null }
  ]
}
```

- `intent`: `investigate`, `simulate` or `reject`. A rejected message is a 200 with
  `intent: "reject"`, `retrieval: "none"` and no citations.
- `retrieval`: `hybrid`, `bm25` (the engine failed, see Search) or `none`.
- `citations`: the passages whose `[n]` appears in the answer, in marker order; if the answer has
  no marker, every passage the model was given. Markers that point at no passage are removed
  from the answer.
- A citation comes from the search hit, never from the model. PSI documents carry
  `investigation_url` and external resources `public_url`; no other URL appears.
- `label` follows the team format, leaving out what is missing (same rules as the frontend's
  `formatCitation`): `Authors (year), "Title", p. 7. BASS-II (PSI-25), folder Raw Data.`
  Investigation summaries and test sheets have no page.

Errors are JSON, `{ "error": "<code>", "detail": "<text>" }`:

| Status | `error` | When |
|---|---|---|
| 400 | `bad_request` | Validation failed (missing or empty `message`, over 4000 characters) or the body is not JSON |
| 404 | `not_found` | Unknown route |
| 502 | `llm_unavailable` | The LLM is down, timed out or answered an error |
| 502 | `predict_unavailable` | `/predict` failed (only with `PREDICT_ENABLED=true`) |

No streaming: one JSON response per request.

## How an answer is built

1. **Router** (one LLM call, JSON mode): decides whether the message is sensible, rewrites it as
   one standalone English search query (resolving follow-ups such as "¿y con helio?" against the
   history) and picks the intent. Basic conceptual questions about fire, flames or combustion are
   sensible.
2. **Search** in English over the corpus (below).
3. **Answer** (one LLM call) with the history and the numbered passages. Each passage starts with
   a header line, `[2] Title | type: testsheet | page 7 | investigation: BASS-II (PSI-25)`, then
   its text. Up to 16,000 characters of passages, enough for `k` whole chunks; when over budget,
   whole passages are dropped from the end, never cut. The model answers in the user's language,
   keeps technical terms, units, acronyms and titles exact, cites with `[n]`, writes no URLs and
   does not present results as certification or engineering approval.
4. **Citations** are built from the hits whose markers appear in the answer.

## Search

A translation of `train/src/flame/corpus/search.py`, with every number from `corpus_info.search`:

- **BM25** over `chunks_fts`: the query is cut into terms (letters and digits, keeping inner
  `-+.`, so `SAFFIRE-III` stays whole), lowercased, deduplicated, each quoted and joined with `OR`.
  It finds exact technical terms that vectors miss.
- **Vectors**: KNN over `chunks_vec`; `similarity = 1 - distance² / 2` (L2-normalized vectors).
- Each method fetches `max(candidates_per_method, k)` chunks. Reciprocal rank fusion scores a chunk
  `Σ 1 / (rrf_k + rank)` over the methods that found it; ties keep BM25's order. The top `k` are
  loaded with their document metadata in one query.
- If the engine fails (down, timeout, HTTP error, wrong model or dimension), one warning is logged
  and the search runs on BM25 alone (`retrieval: "bm25"`). Only the LLM fails a request.

## Index contract

`corpus.db` follows `train/src/flame/corpus/schema.sql`: `investigations`, `documents`, `chunks`,
`chunks_fts` (FTS5) and `chunks_vec` (`vec0`, L2 distance), all sharing `chunks.id` as rowid, plus
`corpus_info` (key/value, every value JSON-encoded).

Boot fails if a table is missing, if `corpus_info` does not match the contract (including
`search.fusion` other than `rrf`), or if the dimension stored in `chunks_vec` differs from
`corpus_info.embedding.dimension`. A different `vec_version()` than
`corpus_info.sqlite_vec_version` only logs a warning. The file uses the `delete` journal mode,
so it opens from a read-only volume.

## Engine contract

```
POST ${ENGINE_URL}/embed   { "text": "<1 to 2000 chars>" }
→ { "embedding": [384 floats], "dimension": 384, "model_id": "BAAI/bge-small-en-v1.5", "revision": … }
```

The engine adds the query prefix. The text is cut to 2000 characters before sending. A vector of
the wrong length or a `model_id` other than `corpus_info.embedding.model_id` counts as an engine
failure.

## LLM contract

OpenAI-compatible chat completions; the router call asks for `response_format: json_object`:

```json
{ "model": "llama3.1", "messages": [{ "role": "system", "content": "…" }, { "role": "user", "content": "…" }],
  "response_format": { "type": "json_object" } }
```

Unparseable router output or `sensible: false` is a rejection. A simulate request without
concrete values, or with prediction disabled, falls back to retrieval.

## Environment

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `8001` | Listen port (on `0.0.0.0`) |
| `CORPUS_PATH` | `storage/corpus.db` (image: `/app/storage/corpus.db`) | The index, opened read-only |
| `ENGINE_URL` | required | Engine base URL, e.g. `http://engine:8000`; a trailing slash is fine |
| `LLM_URL` | required | Chat completions URL, e.g. `http://ollama:11434/v1/chat/completions` |
| `LLM_MODEL` | required | Model name sent to the LLM |
| `LLM_API_KEY` | none | Sent as `Authorization: Bearer …` when set |
| `LLM_TIMEOUT_MS` | `60000` | Timeout per LLM call. Engine calls use 20 s |
| `PREDICT_ENABLED` | `false` | Calls `${ENGINE_URL}/predict` for the simulate intent. Keep off: the engine's `/predict` is a placeholder |

## Run locally

Node ≥ 22.13 (`node:sqlite` without a flag; it still prints one `ExperimentalWarning`) and pnpm
12.14.0. Node 22's bundled corepack cannot start pnpm 12, so install it with
`npm install -g pnpm@12.14.0`.

```bash
pnpm install
cp .env.example .env     # set ENGINE_URL, LLM_URL and LLM_MODEL
pnpm dev                 # or: pnpm build && pnpm start
curl -s localhost:8001/health
curl -s -X POST localhost:8001/chat -H 'content-type: application/json' \
  -d '{"message":"¿Cómo afecta el CO2 a la extinción de una gota de heptano?","history":[]}'
```

`pnpm test` runs everything offline: fixtures with the real schema, mock engine and LLM servers,
and two tests against the real `storage/corpus.db`.

## Docker

```bash
docker build -t flame-mcp .
docker run --rm -p 8001:8001 \
  -e ENGINE_URL=http://engine:8000 \
  -e LLM_URL=http://ollama:11434/v1/chat/completions -e LLM_MODEL=llama3.1 \
  flame-mcp
```

The image (Debian `node:22.21.0-bookworm-slim`; not Alpine, since sqlite-vec ships glibc binaries)
installs with the frozen lockfile, builds, and runs `node dist/server.js` as the `node` user. It
contains `storage/corpus.db`; to use another corpus, mount it read-only over that path:

```yaml
# compose.yaml (excerpt). Only the gateway publishes a port.
mcp:
  build: ./mcp
  environment:
    ENGINE_URL: http://engine:8000
    LLM_URL: http://ollama:11434/v1/chat/completions
    LLM_MODEL: llama3.1
  volumes:
    - ./data/corpus.db:/app/storage/corpus.db:ro
```

## Layout

```
src/server.ts      entry: config, open the corpus, listen on 0.0.0.0
src/app.ts         Fastify app: /chat, /mcp, /health, error shape, request id
src/config.ts      environment variables
src/db.ts          read-only open, sqlite-vec load, schema/corpus_info/dimension checks
src/pipeline.ts    ask(): guard, route, search, answer, citations; prompts and context budget
src/router.ts      the routing call: sense check, standalone English query, intent
src/rag.ts         hybrid search: BM25 + vec0 KNN, RRF, metadata, BM25-only fallback
src/citations.ts   citation objects, labels, [n] markers
src/history.ts     history clean-up for /chat
src/embeddings.ts  engine /embed call, model and dimension check
src/provider.ts    chat completions helper
src/predict.ts     engine /predict call (off by default)
src/mcp.ts         MCP server, ask_question tool
src/errors.ts      upstream error codes
src/http.ts        POST JSON with a timeout
src/text.ts        code-point truncation
test/              unit, search, citation, HTTP flow and real-corpus tests
```

## Known limits

- `node:sqlite` is synchronous: BM25 and KNN queries block the event loop. Fine at this corpus
  size (455 chunks).
- The index is fixed at boot: replacing the file requires a restart.
- The router's "sensible" judgment is a model guess, so borderline messages are sometimes rejected
  or accepted. The fixed Spanish rejection message is the only feedback.
- Each `/chat` costs two LLM calls and one embedding call.
- Whether a claim really comes from the passage it cites depends on the model; the server only
  checks that each marker points at a passage it was given.

## Not included

Streaming, authentication (put the service behind the gateway), query caching, reranking,
filters by accession or document type, and ingest (the `train` repo owns the corpus).
