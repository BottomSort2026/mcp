# Investigations report

_Rendered by code from `investigations.json` (`pnpm report investigations`). Do not edit by hand: rerun the command._

## Provenance

| | |
|---|---|
| Generated | 2026-11-15T12:00:00.000Z |
| Model | claude-opus-5-5 |
| Prompt version | 2026-11-15.1 |
| Rubric version | 2026-11-15.1 |
| Corpus built at | 2026-11-15T00:00:00+00:00 |
| Challenge text | sha256 d169eb9eb636 |
| Investigations | 2 ranked, 0 from cache, 0 failed, 0 skipped |
| Tokens, investigations | 2 call(s); in 2000 (cache write 0, cache read 0); out 200 |
| Tokens, synthesis | 1 call(s); in 1000 (cache write 0, cache read 0); out 100 |
| Tokens, total | 3 call(s); in 3000 (cache write 0, cache read 0); out 300 |

## How to read this report

- Claude read each investigation's own passages (its PSI card, a PSI record built from the card's metadata, linked fact sheets, mini-book passages and its own other documents) and scored every criterion from 0 to 3 with reasons and sources. The code computed the totals, the ranking, the top lists and the coverage matrix.
- Total = weighted sum of the criterion scores, normalized to 0–100. Ties: corpus `fire_relevance` (1 first), then accession.
- Evidence was never a reason for a lower score: a thin evidence set only limits the profile, findings and data fields. `card_only` marks the rows that rest on the least text.
- `[n]` markers point to the numbered sources listed under each investigation.
- These are research results, not material certification or engineering approval.

| Criterion | Weight | 3 means |
|---|---|---|
| fire_safety_directness | 3 | The investigation is about spacecraft fire safety itself |
| habitat_relevance | 2 | Mean of the four habitat scores |
| predictive_modeling_data | 2 | Its data can feed flammability or fire-scenario models now |
| controls_and_equipment | 2 | It informs detection, suppression or material-selection equipment |
| earth_applications | 1 | The corpus states a concrete use on Earth |

## Review flags

- `dropped_statement`: A synthesis statement named no ranked investigation and was removed.
- `tier_mismatch`: The rank disagrees with the corpus fire_relevance tier (1 in the bottom third, or 3 in the top third).
- `unknown_accession`: The synthesis named an accession that is not a ranked investigation; it was removed.

| Where | Flag | Detail |
|---|---|---|
| SAFFIRE-T (PSI-1) | tier_mismatch | Corpus fire_relevance 3 but ranked 1 of 2 (top third) |
| Synthesis | unknown_accession | groups[0] (Others): dropped PSI-999, not a ranked investigation |
| Synthesis | unknown_accession | groups[0] (Others).differences[0]: dropped PSI-999, not a ranked investigation |
| Synthesis | dropped_statement | groups[0] (Others).differences[0] was dropped: it names no ranked investigation |

## Ranking

| Rank | Investigation | Tier | Total | fire_safety_directness | habitat_relevance | predictive_modeling_data | controls_and_equipment | earth_applications | Flags |
|---|---|---|---|---|---|---|---|---|---|
| 1 | [SAFFIRE-T (PSI-1)](#rank-1-psi-1) | 3 | 100.0 | 3 | 3 | 3 | 3 | 3 | tier_mismatch |
| 2 | [PSI-2](#rank-2-psi-2) | 2 | 33.3 | 1 | 1 | 1 | 1 | 1 |  |

### Top per habitat

| Habitat | Investigations (habitat score, total) |
|---|---|
| Spacecraft | SAFFIRE-T (PSI-1) (3, 100.0); PSI-2 (1, 33.3) |
| Space station | SAFFIRE-T (PSI-1) (3, 100.0); PSI-2 (1, 33.3) |
| Moon base | SAFFIRE-T (PSI-1) (3, 100.0); PSI-2 (1, 33.3) |
| Pressurized rover | SAFFIRE-T (PSI-1) (3, 100.0); PSI-2 (1, 33.3) |

### Coverage: pillar × habitat (habitat score ≥ 2)

| Pillar | Spacecraft | Space station | Moon base | Pressurized rover |
|---|---|---|---|---|
| Prevention | PSI-1 | PSI-1 | PSI-1 | PSI-1 |
| Detection | — | — | — | — |
| Suppression | PSI-1 | PSI-1 | PSI-1 | PSI-1 |

## Investigations

<a id="rank-1-psi-1"></a>
### 1. SAFFIRE-T (PSI-1): Spacecraft Fire Test

[PSI investigation page](https://psi.example/investigations/PSI-1) · Tier 3 · Total 100.0

Evidence: own metadata 1 doc / 2 chunks; linked factsheet 1 doc / 2 chunks; pages no; retrieval bm25.

**For students.** Stated in the passages. [1]

**For researchers.** Stated in the passages. [1]

| Criterion | Score | Reason |
|---|---|---|
| fire_safety_directness | 3 | From the objectives. [1] |
| habitat_relevance | 3 | Mean of the four habitat scores (3, 3, 3, 3) |
| predictive_modeling_data | 3 | From the objectives. [1] |
| controls_and_equipment | 3 | From the objectives. [1] |
| earth_applications | 3 | From the objectives. [1] |

| Habitat | Score | Reason |
|---|---|---|
| Spacecraft | 3 | From the objectives. [1] |
| Space station | 3 | From the objectives. [1] |
| Moon base | 3 | From the objectives. [1] |
| Pressurized rover | 3 | From the objectives. [1] |

**Contributions to the challenge objectives**

- Identify relevant: Stated in the passages. [1]
- Predictive modeling: Stated in the passages. [1]
- Controls equipment: Stated in the passages. [1]
- Earth applications: Stated in the passages. [1]

**Fire safety pillars**

- Prevention: Stated in the passages. [1]
- Suppression: Stated in the passages. [1]

**Profile**

| Field | Value |
|---|---|
| Fuel type | solid [1] |
| Hardware | Stated in the passages. [1] |
| Flight platform | Stated in the passages. [1] |
| Dates | Stated in the passages. [1] |
| Fuels | Stated in the passages. [1] |
| Sample shape size | Stated in the passages. [1] |
| Oxygen | Stated in the passages. [1] |
| Pressure | _Not stated in the corpus._ |
| Airflow | Stated in the passages. [1] |
| Variables | Stated in the passages. [1] |
| Constants | _Not stated in the corpus._ |
| Sensors | Stated in the passages. [1] |
| Measurements | _Not stated in the corpus._ |

**Data for modeling** (needs extraction): Flame spread rates. [1]

**Key findings**

- Stated in the passages. [1]

**Limitations**

- Stated in the passages. [1]

**Review flags**

- `tier_mismatch`: Corpus fire_relevance 3 but ranked 1 of 2 (top third)

**Sources**

1. "Spacecraft Fire Test". SAFFIRE-T (PSI-1). <https://psi.example/investigations/PSI-1>

<a id="rank-2-psi-2"></a>
### 2. PSI-2: Droplet Burning Test

[PSI investigation page](https://psi.example/investigations/PSI-2) · Tier 2 · Total 33.3

Evidence: own testsheet 1 doc / 1 chunks; linked factsheet 1 doc / 2 chunks; pages no; retrieval bm25.

**For students.** Stated in the passages. [1]

**For researchers.** Stated in the passages. [1]

| Criterion | Score | Reason |
|---|---|---|
| fire_safety_directness | 1 | From the objectives. [1] |
| habitat_relevance | 1 | Mean of the four habitat scores (1, 1, 1, 1) |
| predictive_modeling_data | 1 | From the objectives. [1] |
| controls_and_equipment | 1 | From the objectives. [1] |
| earth_applications | 1 | From the objectives. [1] |

| Habitat | Score | Reason |
|---|---|---|
| Spacecraft | 1 | From the objectives. [1] |
| Space station | 1 | From the objectives. [1] |
| Moon base | 1 | From the objectives. [1] |
| Pressurized rover | 1 | From the objectives. [1] |

**Contributions to the challenge objectives**

- Identify relevant: Stated in the passages. [1]
- Predictive modeling: Stated in the passages. [1]
- Controls equipment: Stated in the passages. [1]
- Earth applications: Stated in the passages. [1]

**Fire safety pillars**

- Prevention: Stated in the passages. [1]
- Suppression: Stated in the passages. [1]

**Profile**

| Field | Value |
|---|---|
| Fuel type | solid [1] |
| Hardware | Stated in the passages. [1] |
| Flight platform | Stated in the passages. [1] |
| Dates | Stated in the passages. [1] |
| Fuels | Stated in the passages. [1] |
| Sample shape size | Stated in the passages. [1] |
| Oxygen | Stated in the passages. [1] |
| Pressure | _Not stated in the corpus._ |
| Airflow | Stated in the passages. [1] |
| Variables | Stated in the passages. [1] |
| Constants | _Not stated in the corpus._ |
| Sensors | Stated in the passages. [1] |
| Measurements | _Not stated in the corpus._ |

**Data for modeling** (needs extraction): Flame spread rates. [1]

**Key findings**

- Stated in the passages. [1]

**Limitations**

- Stated in the passages. [1]

**Sources**

1. "Droplet Burning Test — PSI record". PSI-2. <https://psi.example/investigations/PSI-2>

## Comparison by hardware

Two fixture investigations. (PSI-1, PSI-2)

### Others

Hardware: Fixture rigs. Investigations: PSI-1, PSI-2.

Similarities:

- Both burn in microgravity. (PSI-1, PSI-2)

## Gaps

- No partial-gravity data. (PSI-1, PSI-2)
