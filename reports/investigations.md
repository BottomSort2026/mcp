# Investigations report

_Rendered by code from `investigations.json` (`pnpm report investigations`). Do not edit by hand: rerun the command._

## Provenance

| | |
|---|---|
| Generated | 2026-11-15T10:53:55.671Z |
| Model | claude-opus-5-5 |
| Prompt version | 165b41b29105 |
| Rubric version | 2026-11-15.1 |
| Corpus built at | 2026-11-15T10:26:15+00:00 |
| Challenge text | sha256 e81e72f93858 |
| Investigations | 24 ranked, 3 from cache, 0 failed, 0 skipped |
| Tokens, investigations | 21 call(s); in 223442 (cache write 0, cache read 284550); out 147515 |
| Tokens, synthesis | 1 call(s); in 32224 (cache write 4557, cache read 0); out 13741 |
| Tokens, total | 22 call(s); in 255666 (cache write 4557, cache read 284550); out 161256 |

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

- `card_only`: The evidence is only the PSI card and the PSI record; this row rests on the least text.
- `over_word_limit`: A summary or the overview is longer than the word limit in the prompt; it is kept as written.

| Where | Flag | Detail |
|---|---|---|
| FLEX (PSI-69) | over_word_limit | summary.plain has 63 words; the prompt asks for at most 60 |
| FLEX (PSI-69) | over_word_limit | summary.technical has 124 words; the prompt asks for at most 120 |
| BASS-II (PSI-25) | over_word_limit | summary.plain has 61 words; the prompt asks for at most 60 |
| BASS (PSI-26) | over_word_limit | summary.technical has 132 words; the prompt asks for at most 120 |
| SAFFIRE-II (PSI-99) | over_word_limit | summary.plain has 62 words; the prompt asks for at most 60 |
| SAFFIRE-II (PSI-99) | over_word_limit | summary.technical has 125 words; the prompt asks for at most 120 |
| SAFFIRE-III (PSI-100) | over_word_limit | summary.plain has 62 words; the prompt asks for at most 60 |
| SAME (PSI-102) | over_word_limit | summary.technical has 127 words; the prompt asks for at most 120 |
| PSI-62 | card_only | The evidence is only the PSI card and the PSI record: no other document in the corpus |
| PSI-115 | card_only | The evidence is only the PSI card and the PSI record: no other document in the corpus |
| PSI-117 | card_only | The evidence is only the PSI card and the PSI record: no other document in the corpus |
| FLEX-2 (PSI-68) | over_word_limit | summary.plain has 64 words; the prompt asks for at most 60 |
| FLEX-2 (PSI-68) | over_word_limit | summary.technical has 129 words; the prompt asks for at most 120 |
| ACME CLD Flame (PSI-21) | over_word_limit | summary.plain has 62 words; the prompt asks for at most 60 |
| SLICE (PSI-106) | over_word_limit | summary.technical has 123 words; the prompt asks for at most 120 |
| PSI-142 | card_only | The evidence is only the PSI card and the PSI record: no other document in the corpus |
| ACME CFI-G (PSI-159) | over_word_limit | summary.plain has 61 words; the prompt asks for at most 60 |
| CFI (PSI-39) | card_only | The evidence is only the PSI card and the PSI record: no other document in the corpus |

## Ranking

| Rank | Investigation | Tier | Total | fire_safety_directness | habitat_relevance | predictive_modeling_data | controls_and_equipment | earth_applications | Flags |
|---|---|---|---|---|---|---|---|---|---|
| 1 | [FLEX (PSI-69)](#rank-1-psi-69) | 1 | 96.7 | 3 | 3 | 3 | 3 | 2 | over_word_limit |
| 2 | [ACME-BRE (PSI-20)](#rank-2-psi-20) | 1 | 86.7 | 3 | 3 | 2 | 3 | 1 |  |
| 3 | [BASS-II (PSI-25)](#rank-3-psi-25) | 1 | 86.7 | 3 | 2.50 | 2 | 3 | 2 | over_word_limit |
| 4 | [BASS (PSI-26)](#rank-4-psi-26) | 1 | 86.7 | 3 | 2.50 | 2 | 3 | 2 | over_word_limit |
| 5 | [SAFFIRE-I (PSI-98)](#rank-5-psi-98) | 1 | 86.7 | 3 | 2.50 | 2 | 3 | 2 |  |
| 6 | [SAFFIRE-II (PSI-99)](#rank-6-psi-99) | 1 | 86.7 | 3 | 2.50 | 2 | 3 | 2 | over_word_limit |
| 7 | [SAFFIRE-III (PSI-100)](#rank-7-psi-100) | 1 | 86.7 | 3 | 2.50 | 2 | 3 | 2 | over_word_limit |
| 8 | [SAME-R (PSI-101)](#rank-8-psi-101) | 1 | 86.7 | 3 | 2.50 | 2 | 3 | 2 |  |
| 9 | [SAME (PSI-102)](#rank-9-psi-102) | 1 | 86.7 | 3 | 2.50 | 2 | 3 | 2 | over_word_limit |
| 10 | [PSI-62](#rank-10-psi-62) | 1 | 76.7 | 3 | 2.50 | 2 | 2 | 1 | card_only |
| 11 | [DAFT (PSI-47)](#rank-11-psi-47) | 1 | 75.0 | 3 | 1.75 | 1 | 3 | 2 |  |
| 12 | [PSI-115](#rank-12-psi-115) | 2 | 73.3 | 3 | 1.50 | 2 | 2 | 2 | card_only |
| 13 | [SPICE (PSI-107)](#rank-13-psi-107) | 2 | 70.0 | 2 | 2.50 | 2 | 2 | 2 |  |
| 14 | [PSI-60](#rank-14-psi-60) | 2 | 63.3 | 2 | 1.50 | 2 | 2 | 2 |  |
| 15 | [PSI-117](#rank-15-psi-117) | 3 | 63.3 | 2 | 1.50 | 2 | 2 | 2 | card_only |
| 16 | [FLEX-2 (PSI-68)](#rank-16-psi-68) | 1 | 60.0 | 2 | 2 | 2 | 1 | 2 | over_word_limit |
| 17 | [ACME Flame Design (PSI-10)](#rank-17-psi-10) | 3 | 56.7 | 2 | 1.50 | 2 | 1 | 2 |  |
| 18 | [ACME CLD Flame (PSI-21)](#rank-18-psi-21) | 3 | 56.7 | 2 | 1.50 | 2 | 1 | 2 | over_word_limit |
| 19 | [SLICE (PSI-106)](#rank-19-psi-106) | 3 | 56.7 | 2 | 1.50 | 2 | 1 | 2 | over_word_limit |
| 20 | [PSI-142](#rank-20-psi-142) | 3 | 53.3 | 2 | 1 | 2 | 1 | 2 | card_only |
| 21 | [ACME E-FIELD Flames (PSI-22)](#rank-21-psi-22) | 2 | 43.3 | 1 | 1 | 2 | 1 | 2 |  |
| 22 | [ACME CFI-G (PSI-159)](#rank-22-psi-159) | 2 | 43.3 | 1 | 1 | 2 | 1 | 2 | over_word_limit |
| 23 | [ACME s-Flame (PSI-23)](#rank-23-psi-23) | 3 | 43.3 | 1 | 1 | 2 | 1 | 2 |  |
| 24 | [CFI (PSI-39)](#rank-24-psi-39) | 3 | 43.3 | 1 | 1 | 2 | 1 | 2 | card_only |

### Top per habitat

| Habitat | Investigations (habitat score, total) |
|---|---|
| Spacecraft | FLEX (PSI-69) (3, 96.7); ACME-BRE (PSI-20) (3, 86.7); BASS-II (PSI-25) (3, 86.7) |
| Space station | FLEX (PSI-69) (3, 96.7); ACME-BRE (PSI-20) (3, 86.7); BASS-II (PSI-25) (3, 86.7) |
| Moon base | FLEX (PSI-69) (3, 96.7); ACME-BRE (PSI-20) (3, 86.7); BASS-II (PSI-25) (2, 86.7) |
| Pressurized rover | FLEX (PSI-69) (3, 96.7); ACME-BRE (PSI-20) (3, 86.7); BASS-II (PSI-25) (2, 86.7) |

### Coverage: pillar × habitat (habitat score ≥ 2)

| Pillar | Spacecraft | Space station | Moon base | Pressurized rover |
|---|---|---|---|---|
| Prevention | PSI-69, PSI-20, PSI-25, PSI-26, PSI-98, PSI-99, PSI-100, PSI-62, PSI-107, PSI-117, PSI-68, PSI-10 | PSI-69, PSI-20, PSI-25, PSI-26, PSI-98, PSI-99, PSI-100, PSI-62, PSI-107, PSI-117, PSI-68, PSI-10 | PSI-69, PSI-20, PSI-25, PSI-26, PSI-98, PSI-99, PSI-100, PSI-62, PSI-107, PSI-68 | PSI-69, PSI-20, PSI-25, PSI-26, PSI-98, PSI-99, PSI-100, PSI-62, PSI-107, PSI-68 |
| Detection | PSI-25, PSI-26, PSI-101, PSI-102, PSI-47, PSI-115, PSI-60 | PSI-25, PSI-26, PSI-101, PSI-102, PSI-47, PSI-115, PSI-60 | PSI-25, PSI-26, PSI-101, PSI-102 | PSI-25, PSI-26, PSI-101, PSI-102 |
| Suppression | PSI-69, PSI-20, PSI-25, PSI-26, PSI-60, PSI-21 | PSI-69, PSI-20, PSI-25, PSI-26, PSI-60, PSI-21 | PSI-69, PSI-20, PSI-25, PSI-26 | PSI-69, PSI-20, PSI-25, PSI-26 |

## Investigations

<a id="rank-1-psi-69"></a>
### 1. FLEX (PSI-69): Flame Extinguishment Experiment

[PSI investigation page](https://psi.nasa.gov/physci/repo/data/investigations/PSI-69) · Tier 1 · Total 96.7

Evidence: own metadata 1 doc / 4 chunks, testsheet 272 doc / 272 chunks; linked factsheet 1 doc / 8 chunks; pages no; retrieval hybrid.

**For students.** FLEX burned small fuel droplets (methanol and heptane) aboard the International Space Station. It looked for the lowest oxygen level at which a flame can survive in weightlessness, and for how well gases such as carbon dioxide and helium put flames out. Hundreds of logged tests record each droplet's starting size, how fast it burned, and its size when the flame went out. [1, 6, 7, 8, 9]

**For researchers.** Methanol (CH3OH) and heptane (C7H16) droplets, mostly free-floating, with initial diameters of 2 to 5 mm, were ignited in the MDCA within the CIR on the ISS. The ambients were O2/N2 with CO2 or He suppressants. The aim was to map flammability boundaries and determine the Limiting Oxygen Index (LOI) as a function of pressure and suppressant. Planned ranges were O2 mole fraction 0.10 to 0.50, suppressant 0.00 to the no-flame limit (0.70 expected) and pressure 0.5 to 1.0 atm; the approach states 0.5 − 1.5 atm. Test sheets span 0.70 to 3.05 atm. Some tests imposed a sub-buoyant flow by translating the droplet. Per-test outputs are D0, kavg (mm2/s) and Dext (mm), from HiBMS backlit imaging, LLUV and color cameras and a radiometer. [1, 2, 3, 7, 8, 9, 14, 18]

| Criterion | Score | Reason |
|---|---|---|
| fire_safety_directness | 3 | FLEX belongs to the Spacecraft Fire Safety sub-research area. Its stated purpose is to assess and quantify the effectiveness of inert-gas suppressants in microgravity and to map flammability limits. [1, 6] |
| habitat_relevance | 3 | Mean of the four habitat scores (3, 3, 3, 3) |
| predictive_modeling_data | 3 | Each test sheet pairs pressure, O2/N2/CO2/He mole fractions, temperature, fuel and D0 with the measured outcomes kavg (mm2/s) and Dext (mm). The data is explicitly intended to develop and validate detailed and reduced-order models. [6, 9, 13, 14] |
| controls_and_equipment | 3 | The passages state that FLEX quantifies suppressant efficacy and that its findings can lead to more efficient and less harmful fire suppression systems. It also provides suppressant data at low pressures relevant to venting a cabin to extinguish a fire. [4, 6, 7, 8] |
| earth_applications | 2 | The passages name specific areas of benefit, namely fire safety in submarines and high-altitude aircraft and advanced combustion engines, without a concrete product or standard. [3, 4] |

| Habitat | Score | Reason |
|---|---|---|
| Spacecraft | 3 | FLEX ran in microgravity on the ISS in cabin-air and suppressant-diluted ambients. Its quiescent tests inform ventilation-failure fires, and a subset imposed sub-buoyant flow. [1, 3, 11] |
| Space station | 3 | The tests were conducted aboard the ISS, including cabin-air calibration tests at 1.0 atm. Suppressant efficacy and extinction were measured under quiescent and slow-flow microgravity conditions. [1, 3, 11] |
| Moon base | 3 | Tests were reported at elevated oxygen (0.30 O2 mole fraction) and at reduced pressure (0.70 atm), with LOI determined as a function of pressure. Because the data is microgravity-only, it can only bound partial-gravity behavior. [2, 10, 14, 17] |
| Pressurized rover | 3 | Tests were reported at 0.30 O2 and at 0.70 atm, and suppressant efficacy and LOI were studied versus pressure, all of which bear on an oxygen-enriched, reduced-pressure cabin. Partial gravity was not tested. [2, 10, 14, 17] |

**Contributions to the challenge objectives**

- Identify relevant: FLEX is a Spacecraft Fire Safety investigation that maps flammability limits of liquid fuels and quantifies gaseous suppressant efficacy (CO2, He) in microgravity. [1, 6, 7]
- Predictive modeling: Test sheets give per-test ambient composition, pressure, D0, kavg and Dext. FLEX developed and is validating detailed and reduced-order transport and chemistry models and sub-models for simulations of large-scale, realistic fires. [6, 9, 14]
- Controls equipment: Its suppressant-efficacy findings can inform more efficient and less harmful suppression systems. Its low-pressure suppressant data supports the strategy of isolating and venting a cabin to extinguish a fire. [4, 7, 8]
- Earth applications: The insights may advance fire safety in submarines and high-altitude aircraft. Its cool-flame studies may inform more efficient, lower-emission combustion engines. [3, 4]

**Fire safety pillars**

- Prevention: FLEX maps flammability boundaries and the Limiting Oxygen Index of liquid fuels over candidate atmospheric pressures and oxygen concentrations. [1, 2, 6]
- Suppression: FLEX quantifies the effectiveness of inert-gas suppressants (carbon dioxide and helium) in microgravity, including at low pressures. [6, 7, 8]

**Profile**

| Field | Value |
|---|---|
| Fuel type | liquid [1, 8] |
| Hardware | Combustion Integrated Rack (CIR)-Fluids and Combustion Facility (FCF) with the Multi-user Droplet Combustion Apparatus (MDCA). Droplets were deployed by needles and ignited by igniters, and most tests used free droplets rather than fiber-supported droplets. [1, 3, 11] |
| Flight platform | International Space Station (ISS) [1] |
| Dates | The investigation ran from 08-01-2007 to 07-31-2016, and the data was released on 31-Jul-2016. Test sheets in the passages range from March 31, 2009 to November 30, 2011. [1, 5, 11, 14] |
| Fuels | Methanol (CH3OH), an alcohol, and heptane (C7H16), an alkane. [8, 9, 10] |
| Sample shape size | Spherical liquid droplets, mostly free-floating, with a planned initial diameter between 2 and 5 mm; the approach starts LOI tests at a smaller droplet size (≈ 3 mm). Test sheets show D0 from 1.86 mm to 4.42 mm with Fiber: No. [2, 3, 8, 14, 15] |
| Oxygen | The planned O2 mole fraction range is 0.10 to 0.50, extending down to the LOI. Test sheets show 0.15 to 0.30. [7, 10, 19] |
| Pressure | The approach states 0.5 − 1.5 atm, and the fact sheet states 0.5 to 1.0 atm. Test sheets show 0.70 atm to 3.05 atm (e.g., 0.70, 0.99, 1.00, 1.01, 2.72, 3.05 atm). [2, 8, 14, 15, 18] |
| Airflow | Tests were mostly quiescent. In slow-flow tests a small sub-buoyant convective flow was imparted by translating the droplet at a slow, uniform speed; no speed value is stated. Free droplets also drifted, for example at approx 7 - 8 mm/sec in FLEX-071. [3, 19] |
| Variables | Ambient oxygen mole fraction (0.10 to 0.50 planned). [7]; Suppressant type (carbon dioxide, helium) and concentration, from 0.00 mole fraction to the no-flame limit (0.70 expected); the objectives also list SF6. [1, 7]; Diluent gas, primarily nitrogen, with a small number of helium-diluent tests. [7]; Ambient pressure. [2, 8]; Fuel (methanol or heptane). [8]; Initial droplet diameter (2 to 5 mm). [8]; Free versus fiber-supported droplets, and quiescent versus slow translated flow. [3] |
| Constants | Microgravity aboard the ISS. [1]; A chamber large enough that the ambient oxygen mole fraction and pressure stay essentially constant during a test. [7, 8]; Ambient temperature of roughly 297 to 301 K in the test sheets (e.g., 297.01 K, 300.92 K). [16, 18] |
| Sensors | HiBMS droplet imaging with backlight. [9, 18]; LLUV camera. [9, 13]; Color camera. [9, 15]; Radiometer. [9] |
| Measurements | Initial droplet diameter D0 (mm). [9]; Average burning rate constant kavg (mm2/s). [9]; Extinction droplet diameter Dext (mm). [9]; Flame size from the LLUV view. [13]; Flame radiation and extinction timing from the radiometer. [9]; Goals: flame extinction, heat radiation, soot levels and temperature profiles. [1, 6] |

**Data for modeling** (ready): The corpus holds 272 test sheets. Each lists pressure, O2/N2/CO2/He mole fractions, temperature, fuel, D0, fiber use, kavg (mm2/s) and Dext (mm), with comments on drift, extinction mode and data quality. These are test-level condition/outcome pairs for fitting LOI and extinction models. Some entries are nan where the droplet left the HiBMS field of view. [6, 9, 14, 15]

**Key findings**

- A heptane droplet in 0.18/0.42/0.40 O2/N2/He at 0.70 atm (D0 1.86 mm) burned with kavg 0.77 mm2/s to Dext 0.84 mm. The test sheet describes this as likely diffusive extinction very close to the flammability limit, with no evidence of a cool flame. [14]
- A heptane droplet in air at 1.0 atm with D0 3.56 mm showed flame oscillations. These suggest the initial size was at the edge of the radiative limit, but the flame stabilized and burned to disruption. [16]
- Methanol droplets in air at 1.00 atm (D0 2.54 mm) burned with kavg 0.48 mm2/s and Dext 1.53 mm. In 0.18/0.67/0.15 O2/N2/CO2 at 1.00 atm (D0 3.77 mm), the values were kavg 0.42 mm2/s and Dext 1.79 mm. [11, 13]
- A methanol droplet in 0.24/0.56/0.20 O2/N2/CO2 at 0.70 atm (D0 4.25 mm) had kavg 0.45 mm2/s and Dext 2.60 mm. [17]
- A methanol droplet in 0.30/0.70 O2/N2 at 1.01 atm (D0 3.26 mm) burned with kavg 0.59 mm2/s and extinguished at Dext 1.32 mm, becoming 'football'-shaped at extinction. [10]

**Limitations**

- Droplet drift frequently carried the droplet out of the HiBMS field of view, so kavg or Dext is missing (nan) or only estimated for some tests. [12, 13, 15, 18, 19]
- Methanol and heptane droplets are simple, well-characterized fuels, but they do not represent the practical solid fuels of fire safety studies such as PMMA or paper. [8]
- The corpus holds only publication titles, not the papers' results. No partial-gravity tests or imposed flow speeds are reported, and one test sheet carries an implausible date (year 0002). [3, 5, 13]

**Review flags**

- `over_word_limit`: summary.plain has 63 words; the prompt asks for at most 60
- `over_word_limit`: summary.technical has 124 words; the prompt asks for at most 120

**Sources**

1. "Flame Extinguishment Experiment — investigation summary". FLEX (PSI-69). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-69>
2. "Flame Extinguishment Experiment — investigation summary". FLEX (PSI-69). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-69>
3. "Flame Extinguishment Experiment — investigation summary". FLEX (PSI-69). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-69>
4. "Flame Extinguishment Experiment — investigation summary". FLEX (PSI-69). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-69>
5. "Flame Extinguishment Experiment — PSI record". FLEX (PSI-69). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-69>
6. "Flame Extinguishment Experiment (FLEX)", p. 1. <https://www.nasa.gov/wp-content/uploads/2025/07/flame-extinguishment-experiment-flex.pdf>
7. "Flame Extinguishment Experiment (FLEX)", p. 1. <https://www.nasa.gov/wp-content/uploads/2025/07/flame-extinguishment-experiment-flex.pdf>
8. "Flame Extinguishment Experiment (FLEX)", p. 2. <https://www.nasa.gov/wp-content/uploads/2025/07/flame-extinguishment-experiment-flex.pdf>
9. "FLEX-047_TestSheet". FLEX (PSI-69), folder Raw Data. <https://psi.nasa.gov/physci/repo/data/investigations/PSI-69>
10. "FLEX-030_TestSheet". FLEX (PSI-69), folder Raw Data. <https://psi.nasa.gov/physci/repo/data/investigations/PSI-69>
11. "FLEX-006_TestSheet". FLEX (PSI-69), folder Raw Data. <https://psi.nasa.gov/physci/repo/data/investigations/PSI-69>
12. "FLEX-245_TestSheet". FLEX (PSI-69), folder Raw Data. <https://psi.nasa.gov/physci/repo/data/investigations/PSI-69>
13. "FLEX-190_TestSheet". FLEX (PSI-69), folder Raw Data. <https://psi.nasa.gov/physci/repo/data/investigations/PSI-69>
14. "FLEX-274_TestSheet". FLEX (PSI-69), folder Raw Data. <https://psi.nasa.gov/physci/repo/data/investigations/PSI-69>
15. "FLEX-015_TestSheet". FLEX (PSI-69), folder Raw Data. <https://psi.nasa.gov/physci/repo/data/investigations/PSI-69>
16. "FLEX-206_TestSheet". FLEX (PSI-69), folder Raw Data. <https://psi.nasa.gov/physci/repo/data/investigations/PSI-69>
17. "FLEX-097_TestSheet". FLEX (PSI-69), folder Raw Data. <https://psi.nasa.gov/physci/repo/data/investigations/PSI-69>
18. "FLEX-010_TestSheet". FLEX (PSI-69), folder Raw Data. <https://psi.nasa.gov/physci/repo/data/investigations/PSI-69>
19. "FLEX-071_TestSheet". FLEX (PSI-69), folder Raw Data. <https://psi.nasa.gov/physci/repo/data/investigations/PSI-69>

<a id="rank-2-psi-20"></a>
### 2. ACME-BRE (PSI-20): Advanced Combustion via Microgravity Experiments - Burning Rate Emulator

[PSI investigation page](https://psi.nasa.gov/physci/repo/data/investigations/PSI-20) · Tier 1 · Total 86.7

Evidence: own metadata 1 doc / 4 chunks; linked factsheet 1 doc / 20 chunks; pages no; retrieval hybrid.

**For students.** BRE used a flat gas burner on the International Space Station to imitate how solid materials such as plastics burn when there is no airflow. Flames representing materials like PMMA and Nylon kept burning steadily in still air, especially in oxygen-rich atmospheres considered for future spacecraft. In normal air (21% oxygen), such flames went out quickly. [1, 3, 4, 6]

**For researchers.** ACME-BRE ran in the ACME hardware of the CIR on the ISS. It fed CH4/N2 and C2H4/N2 mixtures through flat porous circular burners of 25 and 50 mm diameter to emulate condensed-phase burning in a quiescent microgravity ambient. Fuel mixtures were chosen to represent real solids through heat of combustion, smoke point and heat of gasification. Each BRE burner carries two heat flux transducers and a surface thermocouple. The O2/N2 ambients were 14.7 psia, 21 % oxygen; 10.2 psia, 26.5 %; and 8.2 psia, 34 % oxygen, with O2/CO2 ambients desired. Flames first burned at fixed fuel flow while burner temperature and heat flux evolved. Flow was then reduced in increments until extinction, producing flammability-map data. [1, 2, 3, 6, 7]

| Criterion | Score | Reason |
|---|---|---|
| fire_safety_directness | 3 | The fact sheet states that, unlike the other ACME experiments, BRE is focused on fire prevention, especially in spacecraft, through materials flammability and the relevance of existing flammability test methods. The card states that it yielded data relevant to spacecraft fire safety. [3, 6] |
| habitat_relevance | 3 | Mean of the four habitat scores (3, 3, 3, 3) |
| predictive_modeling_data | 2 | Tests produce a continuous set of heat flux, surface temperature and extinction data for flammability maps, and a CFD model is pursued as a predictive methodology. The corpus does not include a test-level matrix of conditions and outcomes; results sit in the listed papers. [2, 3, 5, 7] |
| controls_and_equipment | 3 | The card states that BRE's results suggest NASA may want to increase use of its alternative flammability Test 2 with the cone calorimeter, a material-screening test. The fact sheet states that BRE assesses the relevance of existing flammability test methods. [4, 6] |
| earth_applications | 1 | The passages only state that normal-gravity testing will validate the BRE for 1-g applications and help establish 1-g ignition and extinction limits. No specific area of benefit or concrete use is named. [3] |

| Habitat | Score | Reason |
|---|---|---|
| Spacecraft | 3 | Quasi-steady burning was observed in quiescent microgravity, which matches a ventilation shutdown, an established step in putting out spacecraft fires. It was notably seen in elevated-oxygen atmospheres being considered for future spacecraft. [3, 4] |
| Space station | 3 | The tests were in quiescent microgravity aboard the ISS and included the 14.7 psia, 21 % oxygen atmosphere. They inform fire behavior after ventilation is shut off. [1, 3, 4] |
| Moon base | 3 | The tested atmospheres included reduced pressure (10.2 psia, 26.5 %; 8.2 psia, 34 % oxygen), and sustained burning was reported in elevated-oxygen atmospheres. Gravity was microgravity, not lunar, so partial-gravity behavior must be bounded. [1, 4] |
| Pressurized rover | 3 | The tested reduced-pressure, elevated-oxygen atmospheres (8.2 psia, 34 % oxygen) overlap the expected rover atmosphere, and burning persisted without airflow at elevated oxygen. All tests were in microgravity rather than partial gravity. [1, 4] |

**Contributions to the challenge objectives**

- Identify relevant: BRE is explicitly focused on spacecraft fire prevention. It studies materials flammability in a quiescent microgravity ambient at NASA-considered atmospheres for human space missions. [1, 6]
- Predictive modeling: BRE seeks burning conditions as a function of heat of gasification, reradiation heat flux, applied radiant heat flux, heat of combustion and smoke point to build flammability maps. It also pursues a CFD model as a potential predictive methodology. [2, 3]
- Controls equipment: Preliminary results suggest NASA may want to increase use of its alternative flammability Test 2 with the cone calorimeter. That test can measure material properties corresponding to the microgravity flames observed with the BRE burner. [4]
- Earth applications: Normal-gravity tests with gaseous, liquid and solid fuels aim to validate the BRE for 1-g applications. They also aim to establish 1-g ignition and extinction limits. [3]

**Fire safety pillars**

- Prevention: BRE addresses fire prevention by improving understanding of materials flammability and assessing flammability test methods used to screen spacecraft materials. [4, 6]
- Suppression: BRE observed quasi-steady burning without airflow, which bears on ventilation shutdown as an established step in putting out spacecraft fires, especially at elevated oxygen. [3, 4]

**Profile**

| Field | Value |
|---|---|
| Fuel type | gas [1, 6] |
| Hardware | ACME hardware in the Combustion Integrated Rack (CIR). BRE uses a flat porous burner fed with gaseous fuel; each BRE burner has two heat flux transducers and a surface thermocouple. Fuel flow is controlled based on the measured heat flux and surface temperature. [1, 6, 7] |
| Flight platform | International Space Station (ISS). Normal-gravity ground tests and drop facility testing supplement the flight experiments. [1, 3] |
| Dates | Investigation start date 01-01-2010; end date 02-08-2025; PSI data release 15-Sep-2022. [1, 5] |
| Fuels | CH4/N2 and C2H4/N2 mixtures, chosen to emulate condensed-phase materials such as PMMA and Nylon. The fact sheet describes simulating fuels such as paper, plastic and alcohol. Ground tests also involve gaseous, liquid and solid fuels. [1, 3, 6] |
| Sample shape size | Flat porous circular burners of 25 and 50 mm diameter. [1, 6] |
| Oxygen | O2/N2 ambients at 21 % oxygen (14.7 psia), 26.5 % (10.2 psia) and 34 % oxygen (8.2 psia); O2/CO2 ambients were desired. Sustained burning was reported in elevated-oxygen atmospheres. [1, 4] |
| Pressure | 14.7 psia, 10.2 psia and 8.2 psia. ACME tests are constant-volume, in a free volume of about 90 liters. [1, 11] |
| Airflow | Quiescent microgravity ambient with no air flow. [1, 3, 4] |
| Variables | Choice of diluent, oxygen concentration and pressure of the chamber contents [2]; Fuel mixture (CH4/N2 or C2H4/N2) and burner diameter (25 or 50 mm) [1]; Ambient type: O2/N2, or O2/CO2 (desired) [1]; Fuel flow rate, reduced in small increments to find extinction [3] |
| Constants | Quiescent microgravity ambient [1]; Fuel flow initially held constant during a test while burner surface temperature and heat flux vary [2]; Constant-volume ACME chamber, free volume about 90 liters [11] |
| Sensors | Two heat flux transducers per BRE burner and a burner surface thermocouple [7]; Internal burner pressure measurement [7]; ACME imaging suite: high-definition color camera, analog camera, CIR cameras [8]; Thermopile radiometers and photomultiplier tubes for OH* and CH* emission [9, 10]; CIR gas chromatograph for pre- and post-test chamber atmosphere; SAMS-II for acceleration [10] |
| Measurements | Heat flux to the burner and burner surface temperature [2, 6, 7]; Flame burning behavior and extinction (flow rate at extinction) [1, 3]; Chamber pressure and chamber atmosphere composition (oxygen, nitrogen, carbon dioxide, carbon monoxide, fuel gases) [10] |

**Data for modeling** (needs extraction): Each test yields time-resolved burner heat flux and surface temperature with the flame state, and incremental flow reduction gives extinction limits for flammability maps. The corpus does not include a test-level table of these outcomes; they must be extracted from the data or the listed publications. [2, 3, 5, 7]

**Key findings**

- Quasi-steady burning corresponding to condensed-phase materials such as PMMA and Nylon was observed in microgravity despite the absence of air flow. [3, 4]
- Ongoing combustion without air flow was notably seen in elevated-oxygen atmospheres, whereas such flames in a normal atmosphere of 21% oxygen self-extinguished in a short time. [4]
- Preliminary results suggest NASA may want to increase use of its alternative flammability Test 2 with the cone calorimeter, which can measure material properties corresponding to the observed microgravity flames. [4]

**Limitations**

- BRE's results are described as still preliminary. [4]
- The corpus holds only the summary card, the PSI record and the ACME family fact sheet. The listed publications and the test-level data are not in the corpus. [5]
- Real solids are emulated with gaseous fuels, and all flight tests were in microgravity with no partial-gravity tests. Ignition limit tests were not proposed for microgravity. [2, 3, 6]

**Sources**

1. "Advanced Combustion via Microgravity Experiments - Burning Rate Emulator — investigation summary". ACME-BRE (PSI-20). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-20>
2. "Advanced Combustion via Microgravity Experiments - Burning Rate Emulator — investigation summary". ACME-BRE (PSI-20). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-20>
3. "Advanced Combustion via Microgravity Experiments - Burning Rate Emulator — investigation summary". ACME-BRE (PSI-20). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-20>
4. "Advanced Combustion via Microgravity Experiments - Burning Rate Emulator — investigation summary". ACME-BRE (PSI-20). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-20>
5. "Advanced Combustion via Microgravity Experiments - Burning Rate Emulator — PSI record". ACME-BRE (PSI-20). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-20>
6. "Advanced Combustion via Microgravity Experiments (ACME)", p. 1. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>
7. "Advanced Combustion via Microgravity Experiments (ACME)", p. 10. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>
8. "Advanced Combustion via Microgravity Experiments (ACME)", p. 11. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>
9. "Advanced Combustion via Microgravity Experiments (ACME)", p. 16. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>
10. "Advanced Combustion via Microgravity Experiments (ACME)", p. 18. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>
11. "Advanced Combustion via Microgravity Experiments (ACME)", p. 18. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>

<a id="rank-3-psi-25"></a>
### 3. BASS-II (PSI-25): Burning and Suppression of Solids - II

[PSI investigation page](https://psi.nasa.gov/physci/repo/data/investigations/PSI-25) · Tier 1 · Total 86.7

Evidence: own metadata 1 doc / 2 chunks; linked factsheet 1 doc / 15 chunks; pages no; retrieval hybrid.

**For students.** BASS-II burned small samples of acrylic plastic and a cotton-fiberglass fabric inside a tiny wind tunnel on the International Space Station. The crew varied the airflow and lowered the oxygen level to find when flames spread, grow or go out in weightlessness. The aim was to help NASA judge whether Earth-based flammability tests are a safe guide for choosing spacecraft materials. [1, 2, 4, 6]

**For researchers.** Microgravity flame spread and extinction tests on solid fuels in a small fan-driven wind tunnel (modified SPICE hardware) in the MSG aboard the ISS. Fuels: thin flat samples (10 cm long by 1 and 2 cm wide) of acrylic films and sheets of different thicknesses and SIBAL cotton-fiberglass fabric, black or clear acrylic rods, and a large acrylic spherical section. Variables: forced flow speed and direction (opposed and concurrent; up to 40 cm/s per the summary card, 5 to 50 cm/s per the fact sheet) and ambient O2 below 21% via nitrogen vitiation. Measured: ignition, flame appearance, growth, spread and regression rates, limiting flame length and extinction limits, using video and still imaging, an anemometer and a radiometer. [1, 2, 4, 5, 8]

| Criterion | Score | Reason |
|---|---|---|
| fire_safety_directness | 3 | Its sub-research area is Spacecraft Fire Safety. It studies ignition, flame spread and extinction limits of solid materials, with the stated goal of improving materials flammability screening for spacecraft. [1, 5, 7] |
| habitat_relevance | 2.50 | Mean of the four habitat scores (3, 3, 2, 2) |
| predictive_modeling_data | 2 | The passages state that the tests produced quantitative spread rates, extinction and quenching data, heat release rates and equivalence ratios, and that the results feed computational models. No test-level matrix pairing conditions with outcomes is given: the results sit in video, imagery, sensor data and papers. [1, 5, 6, 8] |
| controls_and_equipment | 3 | It aims to bridge the gap between the NASA-STD-6001 Test #1 material screening method and actual flammability in microgravity. It is stated to guide strategies for materials flammability screening and to help engineers select the safest materials. [1, 5, 6, 7] |
| earth_applications | 2 | The passages name wildfires, building fires and energy recapture from waste recycling as areas where the validated models apply, but they name no concrete product or method. [2, 7] |

| Habitat | Score | Reason |
|---|---|---|
| Spacecraft | 3 | The tests were run in microgravity on the ISS with low-velocity forced flows in opposed and concurrent directions, which overlaps cabin ventilation conditions. Flame growth results are stated to bear on spacecraft firefighting strategies. [1, 2, 6] |
| Space station | 3 | The tests were conducted aboard the ISS in low-speed ventilation flows. The stated aim is to identify the worst case for material flammability in spacecraft environments. [1, 2, 6] |
| Moon base | 2 | The flammability limits measured against oxygen and flow are relevant, but oxygen was only varied below 21%. No reduced-pressure or partial-gravity tests are reported, so lunar conditions require extrapolation. [2, 6] |
| Pressurized rover | 2 | Material flammability limits are relevant to a rover cabin, but the tests were at oxygen below 21% in microgravity, with no elevated-oxygen, reduced-pressure or partial-gravity conditions reported. [2, 6] |

**Contributions to the challenge objectives**

- Identify relevant: BASS-II is a spacecraft fire safety investigation of solid-material ignition, flame spread and extinction in ventilated microgravity. It seeks the worst case for material flammability in spacecraft compared with the terrestrial upward burning test. [1, 6]
- Predictive modeling: It produced thin and thick fuel spread rates, a thin-to-thick transition formula, heat release rates, combustion completeness and data supporting quenching boundary models. It also showed that models over-predict spread rates. [6]
- Controls equipment: It informs material selection by comparing microgravity flammability with the NASA-STD-6001 Test #1 screening method and by guiding materials flammability screening strategies for spacecraft. [1, 5, 7]
- Earth applications: Combustion models validated with its microgravity data are stated to help study flames on Earth such as wildfires, building fires and energy recapture from waste recycling. [2, 7]

**Fire safety pillars**

- Prevention: Its results are stated to guide the choice of materials for future spacecraft and strategies for materials flammability screening. [5, 6, 7]
- Detection: Its results are stated to contribute to the combustion computational models used in the design of fire detection systems in microgravity and on Earth. [1, 5]
- Suppression: Flame growth and extinction data are stated to have implications for firefighting strategies and to help improve firefighting methods on future space missions. [6, 7]

**Profile**

| Field | Value |
|---|---|
| Fuel type | solid [1, 4] |
| Hardware | Microgravity Science Glovebox (MSG) housing slightly modified Smoke Point In Co-flow Experiment (SPICE) hardware: a small flow duct (wind tunnel) with a fan, an igniter, a small nozzle and exchangeable fuel samples with igniter wires. The MSG supplied power, imaging and containment. [1, 2, 4, 8] |
| Flight platform | International Space Station (ISS), with active crew support for real-time lab partner operations. [1, 2] |
| Dates | Investigation start date 01-01-2010, end date 12-31-2022. PSI release date 31-Dec-2022. [1, 3] |
| Fuels | Acrylic films and sheets of different thicknesses; cotton-fiberglass fabric blend Solid Inflammability Boundary at Low-Speeds (SIBAL), previously tested in BASS; black or clear acrylic rods; a large acrylic solid spherical section. Publication titles refer to PMMA rods, intermediate thickness PMMA sheets and composite fabric samples. [3, 4, 5] |
| Sample shape size | 100 fuel samples in three categories. Flat samples: thin, 10 cm long by 1 and 2 cm wide. Rod samples. A section of a large solid sphere. The summary card lists geometries as rods, spherical section, slabs, films and fabric sheets. Rod and sphere dimensions are not stated in the corpus. [1, 4, 5] |
| Oxygen | Ambient oxygen varied below 21% by adding nitrogen (nitrogen vitiation of the working volume using station GN2 at up to 500 cc/min for a prescribed time). Tests were run at constant O2 mole fractions. [1, 2, 8] |
| Pressure | _Not stated in the corpus._ |
| Airflow | Low-velocity forced flow in opposed and concurrent directions: up to 40 cm/s per the summary card; the fact sheet states the crew adjusts airflow from 5 to 50 cm/s. [1, 2, 8] |
| Variables | Forced flow velocity (speed and direction: opposed and concurrent) [1, 2]; Ambient oxygen concentration via nitrogen vitiation of the working volume [1, 2]; Sample geometry (rods, spherical section, slabs, films and fabric sheets) and fuel type and thickness [1, 6] |
| Constants | Microgravity aboard the ISS, inside the sealed MSG work volume [2, 7]; Constant O2 mole fraction within a test, allowing flame spread and extinction to be studied at low and high flow speed [2] |
| Sensors | Video and digital still imaging (MSG-supplied imaging) [2, 7, 8]; Anemometer measuring the actual duct flow rate [8]; Radiometer measuring flame output [8]; On-board CSA-CP and CDM sensor readings (per a publication title) [3] |
| Measurements | Flame appearance, flame growth and spread rates in opposed and concurrent flow [2, 5]; Limiting flame lengths and extinction limits from flat samples [4]; Solid fuel regression rates and extinction limits from rod samples [5]; Time to extinction as a function of fuel geometry, flow and ambient oxygen concentration [5]; Minimum oxygen concentration or flow velocity for burning in space [6] |

**Data for modeling** (needs extraction): The tests yielded spread rates, regression rates, extinction limits and quenching boundary data versus flow and oxygen. They also allowed calculation of heat release rates and global equivalence ratios. The data was returned as video, images and sensor data, and results appear in publications not held in the corpus, so outcomes must be extracted before use. [3, 5, 6, 8]

**Key findings**

- Microgravity data allowed scientists to determine thin and thick fuel spread rates and a formula for the transition from thin to thick fuels. [6]
- Models predict higher spread rates than observed, so they need improvement. [6]
- The data allowed calculation of combustion completeness, heat release rates and fuel-to-oxygen global equivalence ratios. [6]
- The data supported theoretical models for quenching boundaries. [6]

**Limitations**

- The corpus holds only the summary card and a fact sheet for BASS-II. The listed papers and the BASS-II Summary Report are not included, so test-level results are not available here. [1, 3]
- Oxygen was only reduced below 21%, and no pressure values or partial-gravity tests are reported, so lunar habitat conditions (30 % O2 or more at 10.2 psi or less) need extrapolation. [2]
- The passages are inconsistent: the BASS-II fact sheet section gives 100 fuel samples but also 41 test samples and 89 test points, and the airflow range is up to 40 cm/s in the summary card versus 5 to 50 cm/s in the fact sheet. [2, 4, 7, 8]

**Review flags**

- `over_word_limit`: summary.plain has 61 words; the prompt asks for at most 60

**Sources**

1. "Burning and Suppression of Solids - II — investigation summary". BASS-II (PSI-25). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-25>
2. "Burning and Suppression of Solids - II — investigation summary". BASS-II (PSI-25). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-25>
3. "Burning and Suppression of Solids - II — PSI record". BASS-II (PSI-25). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-25>
4. "Burning and Suppression of Solids (BASS)", p. 4. <https://www.nasa.gov/wp-content/uploads/2025/07/burning-and-suppression-of-solids-bass.pdf>
5. "Burning and Suppression of Solids (BASS)", p. 5. <https://www.nasa.gov/wp-content/uploads/2025/07/burning-and-suppression-of-solids-bass.pdf>
6. "Burning and Suppression of Solids (BASS)", p. 6. <https://www.nasa.gov/wp-content/uploads/2025/07/burning-and-suppression-of-solids-bass.pdf>
7. "Burning and Suppression of Solids (BASS)", p. 6. <https://www.nasa.gov/wp-content/uploads/2025/07/burning-and-suppression-of-solids-bass.pdf>
8. "Burning and Suppression of Solids (BASS)", p. 7. <https://www.nasa.gov/wp-content/uploads/2025/07/burning-and-suppression-of-solids-bass.pdf>

<a id="rank-4-psi-26"></a>
### 4. BASS (PSI-26): Burning and Suppression of Solids

[PSI investigation page](https://psi.nasa.gov/physci/repo/data/investigations/PSI-26) · Tier 1 · Total 86.7

Evidence: own metadata 1 doc / 3 chunks; linked factsheet 1 doc / 15 chunks; pages no; retrieval hybrid.

**For students.** BASS burned small samples of fabrics, plastics and candle wax aboard the International Space Station, with a fan blowing air past them at different speeds. In many tests the crew then applied nitrogen gas, a non-reactive extinguishing agent, until the flame went out. The goal was to learn how materials burn in weightlessness and whether ground flammability tests capture that. [1, 2, 5, 6, 7]

**For researchers.** Solid fuels were burned in the MSG on the ISS using modified SPICE hardware. The setup was a 76 mm x 76 mm flow duct with fan-driven concurrent or opposed airflow: 5 to 50 cm/s in the fact sheet, up to 40 cm/s in the summary card. A 29-gage Kanthal wire igniter started each burn, and a nozzle delivered nitrogen suppressant at 0 to 500 cc/min. There were 41 samples and 89 test points: thin SIBAL cotton-fiberglass fabric, Nomex and Ultem (12 cm by 1 and 2 cm); thick PMMA and wax-saturated fiberglass (5 cm by 1 cm by 1 and 2 mm); PMMA spheres (1 and 2 cm); and paraffin and Japan wax candles. Measurements: spread rate, flame shape and dynamics, time to extinction, by video, still camera, radiometer and anemometer. [2, 4, 5, 7]

| Criterion | Score | Reason |
|---|---|---|
| fire_safety_directness | 3 | BASS sits in the Spacecraft Fire Safety sub-area. Its objectives are material flammability in microgravity relative to NASA-STD-6001 Test 1 and the effectiveness of an inert gaseous extinguishing agent similar to that used on ISS. [1, 4] |
| habitat_relevance | 2.50 | Mean of the four habitat scores (3, 3, 2, 2) |
| predictive_modeling_data | 2 | The 89 test points record spread rate, flame shape and time to extinction against flow speed, fuel geometry and nitrogen flow rate. These outcomes come as downlinked video, photos and radiometer/anemometer data that must be analyzed, and the data are described as intended for model validation. [2, 5, 6, 7, 8] |
| controls_and_equipment | 3 | The passages state that BASS will improve 1-g material fire safety rating tests and help extend NASA-STD-6001 Test 2 heat release data to performance-based material selection. They also state that its nitrogen suppressant provides a direct link to current and planned extinguishment techniques. [2, 4, 11] |
| earth_applications | 2 | The passages name the design of fire detection and suppression systems on Earth and terrestrial combustion problems as areas of benefit. They give no concrete product, standard or method. [4, 9, 11] |

| Habitat | Score | Reason |
|---|---|---|
| Spacecraft | 3 | Solid materials burned in microgravity on the ISS under forced airflow of 5 to 50 cm/s, a range that overlaps cabin ventilation. Nitrogen suppression was also tested. [1, 2, 7] |
| Space station | 3 | The tests were conducted aboard the ISS in the MSG, under forced ventilation flows from 5 to 50 cm/s. They address flammability and suppression of practical materials, including wake flames behind objects. [1, 2, 7] |
| Moon base | 2 | Material flammability and suppression matter for a Moon Base. However, the passages report no tests at elevated oxygen, reduced pressure or simulated partial gravity, so microgravity results must be extrapolated. [1, 5, 7] |
| Pressurized rover | 2 | Flammability of fabrics and plastics and inert-gas suppression in confined spaces are relevant to pressurized rovers. The passages report no elevated-oxygen, reduced-pressure or partial-gravity tests. [1, 5, 7] |

**Contributions to the challenge objectives**

- Identify relevant: BASS directly addresses spacecraft fire safety. It examines the microgravity flammability of practical, thicker fuels, including wake flames, against the NASA-STD-6001 Test 1 method, and the extinguishment of those flames by nitrogen. [1, 4]
- Predictive modeling: BASS measured flame spread rate, flame shape and dynamics, and time to extinction as functions of flow speed, fuel geometry and nitrogen flow rate. These results feed first-order models of heat release in spacecraft fires and validation of 3D steady, transient, nitrogen-injection and PMMA-sphere models. [2, 5, 6]
- Controls equipment: BASS informs material selection by aiming to improve 1-g fire safety rating tests and to extend cone calorimeter (NASA-STD-6001 Test 2) data to performance-based selection. It informs suppression through nitrogen agent tests and models used in designing fire detection and suppression systems. [2, 4, 11]
- Earth applications: Combustion models validated with BASS microgravity data are stated to contribute to the design of fire detection and suppression systems on Earth and to terrestrial combustion problems. [4, 8, 9]

**Fire safety pillars**

- Prevention: BASS studies material flammability in microgravity to bridge NASA-STD-6001 Test 1 screening and actual flight behavior, and to support performance-based material selection. [1, 2, 11]
- Detection: BASS results are stated to contribute to the combustion computational models used in the design of fire detection and suppression systems. [4]
- Suppression: BASS assessed how effectively an inert gaseous agent, nitrogen, extinguishes flames over different materials, geometries, preheating and flows, increasing its flow until extinction. [1, 5, 6]

**Profile**

| Field | Value |
|---|---|
| Fuel type | solid [1, 4, 5] |
| Hardware | Microgravity Science Glovebox (MSG) with slightly modified Smoke Point In Co-flow Experiment (SPICE) hardware. Components: a small flow duct (76 mm x 76 mm cross section), a variable speed fan, a Kanthal wire (29-gage) igniter, a small nozzle supplying nitrogen suppressant through a mass flow controller, an anemometer, a radiometer, and video and still cameras. [1, 2, 4, 7] |
| Flight platform | International Space Station (ISS); managed by Glenn Research Center (GRC). [1] |
| Dates | Investigation start date 10-01-2009; end date 06-30-2013; PSI release date 30-Jun-2013. [1, 3] |
| Fuels | Solid Inflammability Boundary at Low-Speeds (SIBAL) fabric, 75% cotton and 25% fiberglass by mass, as the principal thin material. Also: Nomex fabric, Ultem, Polymethylmethacrylate (PMMA), wax-saturated fiberglass fabric, and candles of common paraffin and "Japan wax". [1, 2, 5] |
| Sample shape size | 41 fuel samples in three categories. Thin flat samples: 12 cm long by 1 and 2 cm wide. Thick flat samples of PMMA and wax-saturated fiberglass: 5 cm long by 1 cm wide by 1 and 2 mm thick. Solid PMMA spheres: 1 and 2 cm in diameter. Candles within a thin ceramic tube: 6 mm in diameter by 25 mm long. The summary card also mentions cylinders. [2, 5] |
| Oxygen | The oxygen concentration of the flight tests is not stated in the corpus. A ground drop-tower precursor test of a 2-cm-diameter PMMA sphere used 17% oxygen. [6] |
| Pressure | The pressure of the flight tests is not stated in the corpus. The ground drop-tower precursor test used 1 atm. pressure. [6] |
| Airflow | Fan-driven airflow along the fuel surface in the concurrent or opposed direction. The fact sheet gives 5 to 50 cm/s; the summary card gives airflow speeds as high as 40 cm/s. Nitrogen suppressant flowed at 0 to 500 cc/min. Drop-tower precursor tests used 30 cm/s and 2 cm/s. [2, 6, 7] |
| Variables | Airflow speed, the main variable. [7, 11]; Flow direction: concurrent-flow or opposed-flow. [2]; Fuel material, thickness (thin vs 1 and 2 mm thick) and geometry (flat, sphere, candle). [5]; Nitrogen suppressant flow rate and flame distance from the nozzle. [5]; Ignition location (front or back of spheres) and preheating. [1, 5] |
| Constants | All tests were run in microgravity inside the sealed MSG work volume on the ISS. [1, 7]; The same small flow duct (76 mm x 76 mm cross section) and Kanthal wire (29-gage) igniter were used. [2]; Each flame burned for about a minute before nitrogen suppressant was applied. [7] |
| Sensors | Video and still cameras, giving top and edge views of the flame. [2, 7]; Anemometer measuring the actual flow rate. [7]; Radiometer measuring flame output. [7]; Mass flow controller metering nitrogen suppressant. [7] |
| Measurements | Flame size, shape, color, spread rate and potential flame quenching. [2]; Concurrent-flow spread rate and limiting flame length on thin flat samples. [5]; Flame dynamics such as pulsations and oscillations. [5]; Time to extinction as a function of fuel geometry, nitrogen flow rate and flame distance from the nozzle. [5]; Radiative flame output. [7] |

**Data for modeling** (needs extraction): BASS ran 41 samples over 89 test points under varied flow and nitrogen conditions. Data were returned as video, digital photos, and radiometer and anemometer sensor data overlaid on video. Spread rates and extinction times must be extracted from these records; the corpus contains no tabulated test matrix. The data are intended to validate 3D steady and transient flame spread models, nitrogen-injection models and PMMA-sphere models. [6, 7, 8]

**Key findings**

- In pre-flight drop-tower tests of a 2-cm-diameter PMMA sphere at 17% oxygen, 1 atm. pressure and 2 cm/s forced flow, computer simulations captured the flame response as it transitioned from 1-g to 0-g. [6]

**Limitations**

- The corpus holds only BASS's summary card, PSI record and fact sheet. Publications are listed by title only, and no flight results or test-level data appear in the passages. [1, 3]
- The passages state no oxygen concentration or pressure for the flight tests and report no elevated-oxygen, reduced-pressure or partial-gravity conditions, so Moon Base and rover relevance requires extrapolation. [6, 7]
- The airflow range differs between sources: up to 40 cm/s in the summary card and 5 to 50 cm/s in the fact sheet. Results reported in the same fact sheet for BASS-II and BASS-M are not attributable to BASS. [2, 7, 10]

**Review flags**

- `over_word_limit`: summary.technical has 132 words; the prompt asks for at most 120

**Sources**

1. "Burning and Suppression of Solids — investigation summary". BASS (PSI-26). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-26>
2. "Burning and Suppression of Solids — investigation summary". BASS (PSI-26). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-26>
3. "Burning and Suppression of Solids — PSI record". BASS (PSI-26). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-26>
4. "Burning and Suppression of Solids (BASS)", p. 1. <https://www.nasa.gov/wp-content/uploads/2025/07/burning-and-suppression-of-solids-bass.pdf>
5. "Burning and Suppression of Solids (BASS)", p. 1. <https://www.nasa.gov/wp-content/uploads/2025/07/burning-and-suppression-of-solids-bass.pdf>
6. "Burning and Suppression of Solids (BASS)", p. 2. <https://www.nasa.gov/wp-content/uploads/2025/07/burning-and-suppression-of-solids-bass.pdf>
7. "Burning and Suppression of Solids (BASS)", p. 2. <https://www.nasa.gov/wp-content/uploads/2025/07/burning-and-suppression-of-solids-bass.pdf>
8. "Burning and Suppression of Solids (BASS)", p. 3. <https://www.nasa.gov/wp-content/uploads/2025/07/burning-and-suppression-of-solids-bass.pdf>
9. "Burning and Suppression of Solids (BASS)", p. 3. <https://www.nasa.gov/wp-content/uploads/2025/07/burning-and-suppression-of-solids-bass.pdf>
10. "Burning and Suppression of Solids (BASS)", p. 6. <https://www.nasa.gov/wp-content/uploads/2025/07/burning-and-suppression-of-solids-bass.pdf>
11. Gokoglu, Dietrich, Stocker, Ferkul, Olson, Hicks (2015), "A Researcher's Guide to: Combustion Science (Combustion in Reduced Gravity), NP-2015-10-034-JSC", p. 21. <https://www.nasa.gov/wp-content/uploads/2016/05/np-2015-10-034-jsc_combustion_in_reduced_gravity-iss-mini-book-011116-508.pdf>

<a id="rank-5-psi-98"></a>
### 5. SAFFIRE-I (PSI-98): Spacecraft Fire Safety Experiment-I

[PSI investigation page](https://psi.nasa.gov/physci/repo/data/investigations/PSI-98) · Tier 1 · Total 86.7

Evidence: own metadata 1 doc / 2 chunks; linked factsheet 1 doc / 4 chunks; pages no; retrieval hybrid.

**For students.** Saffire-I set a large piece of cotton-fiberglass fabric on fire inside an uncrewed Cygnus cargo spacecraft after it left the International Space Station, so no crew was at risk. Cameras and sensors tracked how quickly the fire grew in weightlessness. The goal was to check whether NASA's ground-based flammability tests predict how materials burn in space. [1, 2, 4]

**For researchers.** Large-scale flame growth over a Sibal composite fabric (75% cotton, 25% fiberglass by weight), approximately 0.94 meters long and 0.4 meters wide. The sample was mounted on a card in the middle of a fan-driven flow duct inside the Saffire 1 enclosure aboard Cygnus, after the vehicle deberthed from the ISS. Air flow velocity was 20 cm/s, and a hot wire provided ignition. Diagnostics: two cameras for flame images, thermocouples for flow, flame and plume temperatures, two radiometers for flame radiation, solid state sensors for pressure, CO2 and O2 mole fraction, and two anemometers for flow velocity. Data were compressed and downlinked. Objectives: low-g fire growth rate, and low-g flammability limits compared with NASA's normal gravity material flammability screening test. [1, 2, 4]

| Criterion | Score | Reason |
|---|---|---|
| fire_safety_directness | 3 | Its stated objectives are to determine how rapidly a large-scale fire grows in low gravity and to compare low-g flammability limits with NASA's normal gravity material flammability screening test, for spacecraft fire safety design. [1] |
| habitat_relevance | 2.50 | Mean of the four habitat scores (3, 3, 2, 2) |
| predictive_modeling_data | 2 | Quantitative sensor channels (temperatures, flame radiation, pressure, CO2 and O2 mole fraction, flow velocity) and flame imagery were recorded and downlinked, but no per-test outcome table is described. A listed publication compares a transient flame growth model with the experiment. [2, 3] |
| controls_and_equipment | 3 | The investigation compares low-g flammability limits with NASA's normal gravity material flammability screening test, and its results are stated to help validate NASA's material selection criteria. [1, 2] |
| earth_applications | 2 | The passages name specific areas of benefit, namely fire safety and prevention inside mines, airplanes or submarines, without a concrete product or method. [2] |

| Habitat | Score | Reason |
|---|---|---|
| Spacecraft | 3 | A large fabric fire was burned in microgravity inside a spacecraft (Cygnus) under a forced air flow of 20 cm/s. Both the conditions and the flame-growth phenomenon match crewed spacecraft fire scenarios. [1, 2] |
| Space station | 3 | The test ran in orbital microgravity with fan-driven low-speed flow (20 cm/s), which overlaps the ventilated cabin conditions of a space station. [1, 2] |
| Moon base | 2 | Flame growth and flammability limits of fabric are relevant to a Moon Base. However, the passages report only air flowing at 20 cm/s in microgravity, with no elevated oxygen, reduced pressure or partial gravity, so the results need extrapolation. [2] |
| Pressurized rover | 2 | The phenomenon is relevant to a pressurized rover, but the passages report no tests at elevated oxygen, reduced pressure or simulated partial gravity. [2] |

**Contributions to the challenge objectives**

- Identify relevant: Saffire-I is the large-scale fire experiment directly aimed at spacecraft fire safety. It addresses the lack of microgravity data for spacecraft designers by burning a large fabric sample in an expendable spacecraft. [1, 4]
- Predictive modeling: It provides downlinked time-resolved channels of temperature, flame radiation, pressure, CO2 and O2 mole fraction, flow velocity and flame imagery for a single large sample. A listed publication compares a flame growth model against the experiment. [2, 3]
- Controls equipment: It compares low-g flammability limits with NASA's normal gravity material flammability screening test, and its results are stated to help validate NASA's material selection criteria. [1, 2]
- Earth applications: Studying fire in small, sealed environments is stated to benefit fire safety and prevention on Earth, including inside mines, airplanes or submarines. [2]

**Fire safety pillars**

- Prevention: It informs material selection by determining low-g flammability limits and comparing them with NASA's normal gravity material flammability screening test. [1, 2]

**Profile**

| Field | Value |
|---|---|
| Fuel type | solid [1] |
| Hardware | Saffire 1 enclosure in Cygnus, approximately half a meter wide by 1 meter deep by 1.3 meter long. It consisted of a flow duct and an avionics bay. The sample card sat in the middle of a large flow duct, with fans at the top of the duct and flow straighteners at the bottom. Ignition was by hot wire. [1, 2, 4] |
| Flight platform | International Space Station (ISS) program. The experiment was performed on Orbital Science's Cygnus resupply vehicle after it deberthed from the ISS, before its destructive reentry. [1, 4] |
| Dates | Investigation start date 03-02-2001, end date 02-28-2008 (PSI card). Mission completed July 2016 (fact sheet). PSI record released 18-Sep-2024. [1, 3, 4] |
| Fuels | Sibal, a composite fabric of cotton on a fiberglass substrate (75% cotton, 25% fiberglass by weight). It burns like cotton but maintains structural integrity after the cotton is consumed. [1, 2] |
| Sample shape size | Flat fabric sample on a sample card, approximately 0.94 meters long and 0.4 meters wide (PSI card). The fact sheet gives 0.4 m wide by 1 meter long. [2, 4] |
| Oxygen | Air was drawn through the flow duct. No O2 concentration value is stated in the corpus. O2 mole fraction was measured by solid state sensors. [2] |
| Pressure | _Not stated in the corpus._ |
| Airflow | 20 cm/s air flow velocity, drawn through the flow duct by fans. [2] |
| Variables | _Not stated in the corpus._ |
| Constants | Sample material: Sibal (75% cotton, 25% fiberglass by weight). [1]; Air flow velocity: 20 cm/s. [2]; Single large sample, approximately 0.94 meters long and 0.4 meters wide. [2] |
| Sensors | Two cameras capturing flame images. [2]; Thermocouples for flow, flame and plume temperatures. [2]; Two radiometers recording flame radiation. [2]; Solid state sensors for pressure, CO2 and O2 mole fraction. [2]; Two anemometers tracking flow velocity. [2] |
| Measurements | Flame images and flame growth. [2]; Flow, flame and plume temperatures. [2]; Flame radiation. [2]; Pressure, CO2 and O2 mole fraction. [2]; Flow velocity. [2] |

**Data for modeling** (needs extraction): Time-resolved sensor channels (thermocouple temperatures, radiometer flame radiation, pressure, CO2 and O2 mole fraction, anemometer flow velocity) and video of flame growth were compressed and downlinked for one large Sibal sample at 20 cm/s. Flame spread and growth rates must be extracted from the imagery and channels. A listed publication compares a flame growth model with the experiment. [2, 3]

**Key findings**

- _None stated in the corpus._

**Limitations**

- The corpus holds only the PSI summary card, the PSI record and a family fact sheet for Saffire-I. No papers, data files or measured results appear in the passages, so no findings can be reported. [1, 3, 4]
- Only one material (Sibal) at one air flow velocity (20 cm/s) in air is described. No elevated oxygen, reduced pressure or partial-gravity conditions relevant to a Moon Base or rover are reported. [1, 2]
- The proposal title and sub-research area refer to smoke characterization for fire detection, but the stated objectives and approach describe no smoke or particulate measurements. The impact statement mentions flammability limits for several spacecraft materials, while only one material is described for Saffire-I. [1, 2]

**Sources**

1. "Spacecraft Fire Safety Experiment-I — investigation summary". SAFFIRE-I (PSI-98). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-98>
2. "Spacecraft Fire Safety Experiment-I — investigation summary". SAFFIRE-I (PSI-98). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-98>
3. "Spacecraft Fire Safety Experiment-I — PSI record". SAFFIRE-I (PSI-98). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-98>
4. "Spacecraft Fire Safety Demonstration (Saffire)", p. 1. <https://www.nasa.gov/wp-content/uploads/2025/07/spacecraft-fire-safety-demonstration-saffire.pdf>

<a id="rank-6-psi-99"></a>
### 6. SAFFIRE-II (PSI-99): Spacecraft Fire Experiment-II

[PSI investigation page](https://psi.nasa.gov/physci/repo/data/investigations/PSI-99) · Tier 1 · Total 86.7

Evidence: own metadata 1 doc / 2 chunks; linked factsheet 1 doc / 4 chunks; pages no; retrieval hybrid.

**For students.** Saffire-II set fire to nine samples of spacecraft materials inside an uncrewed Cygnus cargo ship after it left the space station. The samples included a cotton-fiberglass cloth, silicone and PMMA, the acrylic glass used for spacecraft windows. Cameras and sensors tracked how fast the flames grew in weightlessness. The goal was to check NASA's ground-based flammability tests against fire behavior in space. [1, 2, 4]

**For researchers.** Saffire-II was a large-scale, uncrewed low-g flame spread experiment in the Cygnus Pressurized Cargo Module, run after Cygnus deberthed from the ISS. A sample card with 9 samples, each 5 cm x 29 cm (SIBAL, silicone, structure PMMA, flat PMMA, PMMA with Nomex), sat in the middle of a large flow duct. Fans drew air through the duct past flow straighteners at 20 or 30 cm/s, concurrent or opposed depending on the material. Diagnostics were two cameras, thermocouples (flow, flame and plume temperatures), two radiometers (flame radiation), solid state sensors (pressure, CO2 and O2 mole fraction) and two anemometers. The objectives were fire growth rate and low-g flammability limits compared with NASA's normal-gravity material flammability screening test. Ambient O2 and pressure set-points are not stated. [1, 2]

| Criterion | Score | Reason |
|---|---|---|
| fire_safety_directness | 3 | Its stated objectives are to determine how rapidly a large-scale fire grows in low gravity and to compare low-g flammability limits of spacecraft materials with NASA's normal-gravity material flammability screening test. [1, 2] |
| habitat_relevance | 2.50 | Mean of the four habitat scores (3, 3, 2, 2) |
| predictive_modeling_data | 2 | Quantitative channels were recorded and downlinked: thermocouple temperatures, radiometer flame radiation, pressure, CO2 and O2 mole fraction, anemometer flow velocity and flame imagery. The passages give no per-test table of outcomes, and spread or limit values must be extracted from the imagery, the sensor data or the referenced Experimental Details file. [2] |
| controls_and_equipment | 3 | The passages state that its results help to validate NASA's material selection criteria and compare low-g flammability limits with NASA's normal-gravity material flammability screening test. [1, 2] |
| earth_applications | 2 | It names specific areas of benefit: fire safety and prevention in small, sealed environments such as mines, airplanes or submarines. No concrete product or standard is named. [2] |

| Habitat | Score | Reason |
|---|---|---|
| Spacecraft | 3 | Spacecraft materials were burned in microgravity inside a Cygnus spacecraft, under forced airflow of 20 or 30 cm/s, concurrent or opposed, which matches cabin-ventilation conditions. [1, 2] |
| Space station | 3 | The tests ran in microgravity with low-speed forced airflow (20 or 30 cm/s) on materials relevant to crewed vehicles, conditions that overlap station ventilation environments. [1, 2] |
| Moon base | 2 | Low-g flammability limits and flame growth of spacecraft materials are relevant, but no tests at elevated oxygen, reduced pressure or simulated partial gravity are reported for Saffire-II, so the results need extrapolation. The fact sheet attributes tests at different pressures and oxygen levels to Saffire IV, not Saffire-II. [1, 2, 5] |
| Pressurized rover | 2 | Material flammability and flame growth matter in pressurized rovers, but Saffire-II reports no elevated-oxygen, reduced-pressure or partial-gravity conditions, so its microgravity results can only bound rover scenarios. [1, 2] |

**Contributions to the challenge objectives**

- Identify relevant: It is a direct spacecraft fire safety investigation: a large-scale fire in an expendable spacecraft, measuring fire growth and low-g flammability limits of spacecraft materials. [1, 2]
- Predictive modeling: It addresses the stated lack of microgravity data for spacecraft designers. It recorded flame imagery, temperatures, flame radiation, pressure, CO2 and O2 mole fraction, and flow velocity, and its PSI record lists a model-versus-experiment paper on transient flame growth over a large fabric in microgravity. [1, 2, 3]
- Controls equipment: Its results help to validate NASA's material selection criteria by comparing low-g flammability limits with the normal-gravity material flammability screening test. [1, 2]
- Earth applications: Studying fire in small, sealed environments benefits fire safety and prevention on Earth, including inside mines, airplanes or submarines. [2]

**Fire safety pillars**

- Prevention: It determines microgravity flammability limits of several spacecraft materials and helps validate NASA's material selection criteria. [1, 2]

**Profile**

| Field | Value |
|---|---|
| Fuel type | solid [1, 2] |
| Hardware | Saffire-II flight unit in the Cygnus Pressurized Cargo Module. A sample card sits in the middle of a large flow duct, with fans at the top of the duct drawing air through and flow straighteners at the bottom of the experiment module. [1, 2] |
| Flight platform | Cygnus Spacecraft (Orbital ATK resupply vehicle), operated after it deberthed from the ISS. Launched on Orbital ATK's sixth contracted cargo resupply mission to the ISS. [1, 4] |
| Dates | Investigation start date 09-30-2016, end date 04-01-2017. Launched October 2016; mission completed Nov. 27, 2016. PSI release date 18-Sep-2024. [1, 3, 4] |
| Fuels | SIBAL, silicone, structure PMMA, flat PMMA and PMMA with Nomex. The fact sheet lists a cotton-fiberglass blend, Nomex and the acrylic glass used for spacecraft windows among the nine samples. [1, 4] |
| Sample shape size | One sample card with 9 samples, each 5 cm x 29 cm. Flat and structure PMMA variants are named. Thickness is not stated. [1, 2] |
| Oxygen | No O2 set-point is stated. The duct flow is described as air, and O2 mole fraction was measured by solid state sensors. [2] |
| Pressure | _Not stated in the corpus._ |
| Airflow | Air flow velocity of either 20 or 30 cm/s depending on sample material, either concurrent or opposed. [2] |
| Variables | Sample material: SIBAL, silicone, structure PMMA, flat PMMA, PMMA with Nomex. [1]; Air flow velocity: 20 or 30 cm/s, depending on sample material. [2]; Flow direction relative to flame spread: concurrent or opposed. [2] |
| Constants | Sample size of 5 cm x 29 cm for each of the 9 samples on the sample card. [2]; Same flow duct with fan-driven airflow and flow straighteners, in microgravity aboard Cygnus. [1, 2] |
| Sensors | Two cameras for flame images. [2]; Thermocouples for flow, flame and plume temperatures. [2]; Two radiometers for flame radiation. [2]; Solid state sensors for pressure, CO2 and O2 mole fraction. [2]; Two anemometers for flow velocity. [2] |
| Measurements | Flame images (flame growth and spread). [2]; Flow, flame and plume temperatures. [2]; Flame radiation. [2]; Pressure, CO2 and O2 mole fraction. [2]; Flow velocity. [2] |

**Data for modeling** (needs extraction): Sensor channels (temperatures, flame radiation, pressure, CO2, O2, flow velocity) and flame imagery were compressed and downlinked. Per-sample parameters are said to be in an Experimental Details file that is not in this corpus, so spread rates and flammability limits must be extracted before fitting or validating models. [2]

**Key findings**

- _None stated in the corpus._

**Limitations**

- The corpus holds only the summary card, the PSI record and a family fact sheet. No papers or the Experimental Details file are included, so no measured spread rates or flammability limit values are available here. [1, 2, 3]
- No elevated-oxygen or reduced-pressure tests are reported for Saffire-II. The fact sheet attributes tests of the same materials at different pressures and oxygen levels to Saffire IV. [2, 5]
- Sample thickness, the ambient O2 and pressure set-points, and which material used which flow speed and direction are not stated in the passages. [2]

**Review flags**

- `over_word_limit`: summary.plain has 62 words; the prompt asks for at most 60
- `over_word_limit`: summary.technical has 125 words; the prompt asks for at most 120

**Sources**

1. "Spacecraft Fire Experiment-II — investigation summary". SAFFIRE-II (PSI-99). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-99>
2. "Spacecraft Fire Experiment-II — investigation summary". SAFFIRE-II (PSI-99). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-99>
3. "Spacecraft Fire Experiment-II — PSI record". SAFFIRE-II (PSI-99). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-99>
4. "Spacecraft Fire Safety Demonstration (Saffire)", p. 1. <https://www.nasa.gov/wp-content/uploads/2025/07/spacecraft-fire-safety-demonstration-saffire.pdf>
5. "Spacecraft Fire Safety Demonstration (Saffire)", p. 2. <https://www.nasa.gov/wp-content/uploads/2025/07/spacecraft-fire-safety-demonstration-saffire.pdf>

<a id="rank-7-psi-100"></a>
### 7. SAFFIRE-III (PSI-100): Spacecraft Fire Experiment-III

[PSI investigation page](https://psi.nasa.gov/physci/repo/data/investigations/PSI-100) · Tier 1 · Total 86.7

Evidence: own metadata 1 doc / 2 chunks; linked factsheet 1 doc / 4 chunks; pages no; retrieval hybrid.

**For students.** Saffire-III lit a large fire inside an uncrewed Cygnus cargo ship after it left the International Space Station, so no crew was at risk. It burned SIBAL, a cotton-fiberglass fabric, with air blowing past it at 30 cm/s. The goals were to see how fast a big fire grows in weightlessness and whether Earth-based flammability tests predict how materials burn in space. [1, 5]

**For researchers.** Large-scale low-gravity flame spread test in the Saffire III enclosure aboard the Cygnus resupply vehicle after it deberthed from the ISS. The sample material was SIBAL, the same cotton-fiberglass blend burned in Saffire-I. It burned in concurrent or opposed flow at 30 cm/s, compared with 20 cm/s in Saffire I. The objectives were the large-scale fire growth rate in low-g and low-g flammability limits compared with NASA's normal-gravity material flammability screening test. Diagnostics were two cameras, thermocouples (flow, flame and plume temperatures), two radiometers (flame radiation), solid state sensors (pressure, CO2 and O2 mole fraction) and two anemometers (flow velocity). Data were compressed and downlinked. Ambient O2, pressure and sample dimensions are not stated in the corpus. [1, 2, 5]

| Criterion | Score | Reason |
|---|---|---|
| fire_safety_directness | 3 | Its sub-research area is Spacecraft Fire Safety. Its objectives are large-scale fire growth in low gravity and low-g flammability limits compared with NASA's material flammability screening test. [1] |
| habitat_relevance | 2.50 | Mean of the four habitat scores (3, 3, 2, 2) |
| predictive_modeling_data | 2 | Quantitative data exist: camera imagery, thermocouple temperatures, radiometer flame radiation, pressure, CO2 and O2 mole fraction, and flow velocity. However, the passages give no per-test outcome table, so outcomes must be extracted from raw channels and imagery. [1, 2] |
| controls_and_equipment | 3 | The card states that the investigation compares low-g flammability limits with NASA's normal-gravity material flammability screening test. It also states that results help validate NASA's material selection criteria. [1, 2] |
| earth_applications | 2 | The card names specific areas of benefit (fire safety and prevention inside mines, airplanes or submarines) but no concrete product, standard or method. [2] |

| Habitat | Score | Reason |
|---|---|---|
| Spacecraft | 3 | The fire burned inside a real spacecraft (Cygnus) in microgravity with forced flow at 30 cm/s, concurrent or opposed. These conditions overlap with a ventilated crew cabin. [1, 4] |
| Space station | 3 | The tests were in orbital microgravity with forced flow at 30 cm/s on a cabin fabric material, which directly informs fire growth in a ventilated station module. [1] |
| Moon base | 2 | Fire growth and flammability limits of a fabric are relevant to a lunar base. However, no elevated-oxygen, reduced-pressure or partial-gravity tests are reported for Saffire-III, so results need extrapolation. [1, 2] |
| Pressurized rover | 2 | Flame growth in a small sealed volume is relevant to a pressurized rover. However, the passages report no tests at 30 % O2 or more, at reduced pressure, or in partial gravity. [1, 2] |

**Contributions to the challenge objectives**

- Identify relevant: Saffire-III is a spacecraft fire safety investigation that burned a large SIBAL sample in an actual spacecraft. It addresses the stated lack of microgravity fire data available to spacecraft designers. [1]
- Predictive modeling: It provides imagery plus temperature, radiation, pressure, CO2, O2 and flow-velocity measurements of large-scale low-g fire growth at 30 cm/s. This responds to the uncertainty of designing with terrestrial fire data. [1, 2]
- Controls equipment: It compares low-g flammability limits with NASA's normal-gravity material flammability screening test. Results are intended to help validate NASA's material selection criteria. [1, 2]
- Earth applications: Studying fire in small sealed environments is stated to benefit fire safety and prevention in mines, airplanes and submarines. [2]

**Fire safety pillars**

- Prevention: It addresses material flammability limits in low gravity relative to NASA's screening test, which underpins material selection for fire prevention. [1, 2]

**Profile**

| Field | Value |
|---|---|
| Fuel type | solid [1] |
| Hardware | Saffire III enclosure in Cygnus [1] |
| Flight platform | International Space Station (ISS) program. The experiment was performed on the Orbital Science's Cygnus resupply vehicle after it deberthed from the ISS, and was launched aboard Orbital ATK's seventh contracted commercial resupply services mission. [1, 5] |
| Dates | Investigation start date 04-18-2017 (launch April 18, 2017). Ignition was planned after Cygnus departed the station in early June. The PSI data release date is 18-Sep-2024. [1, 3, 5] |
| Fuels | SIBAL, described by the fact sheet as the same cotton-fiberglass blend burned in Saffire-I. In the Saffire IV context, the fact sheet describes SIBAL cloth as a composite of 75% cotton and 25% fiberglass. [1, 5, 6] |
| Sample shape size | _Not stated in the corpus._ |
| Oxygen | _Not stated in the corpus._ |
| Pressure | _Not stated in the corpus._ |
| Airflow | Flow velocity of 30 cm/s (compared to 20 cm/s during Saffire I), either concurrent or opposed. [1] |
| Variables | Flow direction: concurrent or opposed. [1] |
| Constants | Sample material: SIBAL. [1]; Flow velocity: 30 cm/s. [1] |
| Sensors | Two cameras capturing flame images. [1, 2]; Thermocouples for flow, flame and plume temperatures. [2]; Two radiometers recording flame radiation. [2]; Solid state sensors for pressure, CO2 and O2 mole fraction. [2]; Two anemometers tracking flow velocity. [2] |
| Measurements | Flame images (fire growth). [1, 2]; Flow, flame and plume temperatures. [2]; Flame radiation. [2]; Pressure and CO2 and O2 mole fraction. [2]; Flow velocity. [2] |

**Data for modeling** (needs extraction): Quantitative channels (thermocouple temperatures, radiometer flame radiation, pressure, CO2 and O2 mole fraction, anemometer flow velocity) and two-camera flame imagery were compressed and downlinked. Sample and experimental parameters are in an Experimental Details file that is not in this corpus. Fire growth or spread outcomes must be extracted from the imagery and sensor records. [1, 2]

**Key findings**

- _None stated in the corpus._

**Limitations**

- The corpus holds only the summary card, the PSI record and a family fact sheet. No Saffire-III results, papers or the Experimental Details file are included, so no findings can be reported. [2, 3]
- Sample dimensions, ambient oxygen concentration and pressure for Saffire-III are not stated in the corpus. Only one flow velocity (30 cm/s) is reported. [1]
- No elevated-oxygen, reduced-pressure or partial-gravity conditions are reported for Saffire-III; those were addressed in later Saffire experiments. Its applicability to lunar habitats therefore needs extrapolation. [1, 6]

**Review flags**

- `over_word_limit`: summary.plain has 62 words; the prompt asks for at most 60

**Sources**

1. "Spacecraft Fire Experiment-III — investigation summary". SAFFIRE-III (PSI-100). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-100>
2. "Spacecraft Fire Experiment-III — investigation summary". SAFFIRE-III (PSI-100). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-100>
3. "Spacecraft Fire Experiment-III — PSI record". SAFFIRE-III (PSI-100). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-100>
4. "Spacecraft Fire Safety Demonstration (Saffire)", p. 1. <https://www.nasa.gov/wp-content/uploads/2025/07/spacecraft-fire-safety-demonstration-saffire.pdf>
5. "Spacecraft Fire Safety Demonstration (Saffire)", p. 1. <https://www.nasa.gov/wp-content/uploads/2025/07/spacecraft-fire-safety-demonstration-saffire.pdf>
6. "Spacecraft Fire Safety Demonstration (Saffire)", p. 2. <https://www.nasa.gov/wp-content/uploads/2025/07/spacecraft-fire-safety-demonstration-saffire.pdf>

<a id="rank-8-psi-101"></a>
### 8. SAME-R (PSI-101): Smoke Aerosol Measurement Experiment-Reflight

[PSI investigation page](https://psi.nasa.gov/physci/repo/data/investigations/PSI-101) · Tier 1 · Total 86.7

Evidence: own metadata 1 doc / 3 chunks; linked factsheet 1 doc / 5 chunks; pages no; retrieval hybrid.

**For students.** SAME-R heated common spacecraft materials such as Teflon, Kapton, cotton, silicone rubber and a fire-retardant foam aboard the International Space Station to measure the size of the smoke particles they release. In weightlessness, smoke may form larger droplets that standard smoke detectors could miss, so the data are meant to support better spacecraft fire detectors. [1, 2, 3, 6]

**For researchers.** Reflight of SAME on the ISS (Expedition 24; flight tests July 16 to September 9, 2010, 66 test points) using the SAME hardware. Spacecraft materials (Teflon, Kapton, cotton, silicone rubber and Pyrell, an intumescent fire-retardant foam replacing DBP) were heated as pyrolyzing/smoldering smoke sources. Test conditions were broadened to higher heating temperatures and no-flow during sample heating. Diagnostics measured moments of the particle size distribution (number, diameter and mass concentration; zeroth, first and third moments) with aerosol instruments, a thermal precipitator for TEM, the GRC-built M-pass, a commercial smoke detector, and ISS and Space Shuttle smoke detectors. Post-flight ground tests, including an SMPS, assessed the lognormal assumption behind the moment method. O2, pressure and flow speeds are not stated. [1, 2, 6, 7]

| Criterion | Score | Reason |
|---|---|---|
| fire_safety_directness | 3 | SAME-R sits in the Spacecraft Fire Safety sub-area. Its stated purpose is to quantify low-gravity smoke particle sizes because they affect whether smoke detectors alarm. [1, 2] |
| habitat_relevance | 2.50 | Mean of the four habitat scores (3, 3, 2, 2) |
| predictive_modeling_data | 2 | Flight units measured moments of the particle size distribution over 66 test points. These outcomes need data reduction under a lognormal assumption that was checked in post-flight ground tests, and no per-test outcome table is described. [2, 6, 7] |
| controls_and_equipment | 3 | The passages state that the results can lead to an advanced spacecraft fire detector and provide baseline data for evaluating detection technology. The flight system included the ISS and Space Shuttle smoke detectors. [2, 3, 7] |
| earth_applications | 2 | The passages name submarines and underwater laboratories as specific environments where the resulting smoke detectors could be useful, without a concrete product. [3] |

| Habitat | Score | Reason |
|---|---|---|
| Spacecraft | 3 | The tests ran in microgravity on smoke from spacecraft materials, including a no-flow condition, and evaluated the Space Shuttle and ISS smoke detectors. [2, 6, 7] |
| Space station | 3 | The tests were conducted on the ISS and included the ISS smoke detectors, so the conditions match the station environment directly. [1, 6, 7] |
| Moon base | 2 | Early-fire smoke detection matters in a lunar base, but the passages report no elevated-oxygen, reduced-pressure or partial-gravity tests, so the microgravity results need extrapolation. [1, 7] |
| Pressurized rover | 2 | Smoke detection is relevant in a pressurized rover, but the tested conditions (ISS microgravity, no stated elevated O2 or reduced pressure) require extrapolation. [1, 7] |

**Contributions to the challenge objectives**

- Identify relevant: SAME-R is a Spacecraft Fire Safety investigation measuring low-gravity smoke from spacecraft materials (Teflon, Kapton, cotton, silicone rubber, Pyrell), directly relevant to fire detection in crewed vehicles. [1, 6]
- Predictive modeling: SAME-R provides moment-based particle size statistics from 66 flight test points, compared with ground SMPS and TEM data. The SAME factsheet states that SAME data are intended to support a numerical code predicting smoke droplet growth and to validate smoke growth models. [2, 5, 6, 7]
- Controls equipment: Its results are intended to lead to an advanced fire detector for long-duration spacecraft. They also serve as reduced gravity baseline data for evaluating the ISS and Shuttle smoke detectors and future detection technology. [3, 7]
- Earth applications: The passages state that smoke detectors developed from these results could be useful in extreme environments on Earth such as submarines or underwater laboratories. [3]

**Fire safety pillars**

- Detection: SAME-R characterizes low-gravity smoke particle sizes to evaluate how existing spacecraft smoke detectors respond and to guide future fire detectors. [2, 3, 7]

**Profile**

| Field | Value |
|---|---|
| Fuel type | solid [6] |
| Hardware | Listed as Comparitive Soot Diagnostic Hardware (refer to final report). SAME-R reused the SAME on-orbit hardware, with the GRC-developed M-pass replacing one of the two Commercial Diagnostic Enclosures (DustTrak and ionization detector). The flight diagnostics included a thermal precipitator for TEM sampling, aerosol instruments, a commercial smoke detector, and the ISS and Space Shuttle smoke detectors. [1, 2, 6, 7] |
| Flight platform | International Space Station (ISS), Expedition 24. [1, 6] |
| Dates | Investigation period 07-01-2010 to 09-30-2010. Flight tests ran July 16 to September 9, 2010 and completed 66 test points. [1, 2] |
| Fuels | Teflon, Kapton, cotton, silicone rubber and Pyrell. Pyrell® is an intumescent fire-retardant foam by Foamex that replaced the DBP samples used in SAME. [2, 6] |
| Sample shape size | _Not stated in the corpus._ |
| Oxygen | _Not stated in the corpus._ |
| Pressure | _Not stated in the corpus._ |
| Airflow | Test conditions were broadened to include no-flow during sample heating time. Flow speeds are not stated in the corpus. [2] |
| Variables | Test material (Teflon, Kapton, cotton, silicone rubber, Pyrell) [6]; Sample heating temperature, extended to higher heating temperatures [2]; Flow condition during sample heating, including no-flow [2]; Smoke age (un-aged and aged smoke compared) [7] |
| Constants | Same SAME flight hardware used on-orbit for all tests [2]; Microgravity aboard the ISS [1] |
| Sensors | Thermal precipitator collecting smoke particles on grids for Transmission Electron Microscopy (TEM) [1, 6]; Commercial Diagnostic Enclosure with DustTrak and ionization detector [2]; M-pass instrument developed in-house at GRC [2]; Several aerosol instruments and a commercial smoke detector [6]; ISS and Space Shuttle smoke detectors [7]; Scanning Mobility Particle Sizer Spectrometer (SMPS), used in ground-based testing only [7] |
| Measurements | Particle number concentration (zeroth moment), diameter concentration (first moment) and mass concentration (third moment) [6, 7]; Count mean diameter and diameter of average mass from moment averages; geometric mean diameter and geometric standard deviation assuming a lognormal distribution [7]; Responses of the ISS and Space Shuttle smoke detectors [7]; Particle size distributions from TEM image analysis, compared with SMPS ground data [7] |

**Data for modeling** (needs extraction): Moment-based particle size statistics from 66 flight test points, plus detector responses, TEM samples and ground SMPS comparisons. The outcomes require data reduction that relies on a lognormal assumption validated in post-flight ground tests. The SAME factsheet states that SAME data are meant to support validation of smoke growth models. [2, 5, 6, 7]

**Key findings**

- _None stated in the corpus._

**Limitations**

- The corpus holds only the summary card, PSI record and the SAME factsheet for SAME-R; it reports no measured particle sizes or detector-response results. [1, 4, 6]
- Oxygen concentration, pressure, flow speeds and sample shape and size are not stated, which limits comparison and extrapolation to lunar habitats. [1, 2]
- Flight data rely on a moment method that assumes a lognormal size distribution, which had to be checked with post-flight ground tests. [2, 7]

**Sources**

1. "Smoke Aerosol Measurement Experiment-Reflight — investigation summary". SAME-R (PSI-101). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-101>
2. "Smoke Aerosol Measurement Experiment-Reflight — investigation summary". SAME-R (PSI-101). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-101>
3. "Smoke Aerosol Measurement Experiment-Reflight — investigation summary". SAME-R (PSI-101). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-101>
4. "Smoke Aerosol Measurement Experiment-Reflight — PSI record". SAME-R (PSI-101). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-101>
5. "Smoke Aerosol Measurement Experiment (SAME)", p. 1. <https://www.nasa.gov/wp-content/uploads/2025/07/smoke-aerosol-measurement-experiment-same.pdf>
6. "Smoke Aerosol Measurement Experiment (SAME)", p. 3. <https://www.nasa.gov/wp-content/uploads/2025/07/smoke-aerosol-measurement-experiment-same.pdf>
7. "Smoke Aerosol Measurement Experiment (SAME)", p. 4. <https://www.nasa.gov/wp-content/uploads/2025/07/smoke-aerosol-measurement-experiment-same.pdf>

<a id="rank-9-psi-102"></a>
### 9. SAME (PSI-102): Smoke and Aerosol Measurement Experiment

[PSI investigation page](https://psi.nasa.gov/physci/repo/data/investigations/PSI-102) · Tier 1 · Total 86.7

Evidence: own metadata 1 doc / 3 chunks; linked factsheet 1 doc / 5 chunks; pages no; retrieval hybrid.

**For students.** SAME heated spacecraft materials such as Teflon, Kapton, cellulose and silicone rubber aboard the International Space Station until they gave off smoke, then measured how large the smoke particles grew without gravity. The goal was to check whether the smoke detectors used on the Space Shuttle and the station would still raise an alarm for this smoke. [1, 2, 5]

**For researchers.** Smoke from overheated (pyrolyzing/smoldering) spacecraft materials (Teflon, Kapton, cellulose, silicone rubber) was generated in the ISS Glovebox with the Comparitive Soot Diagnostic Hardware. An igniter was energized for 15 to 60 seconds, and combustion events typically lasted 2 minutes. Sample temperature, air flow and smoke residence (aging) time were test variables. Thermophoretic samplers collected particulate for post-flight TEM sizing of primary and aggregate particles, and samples were weighed for mass loss. Responses of an ionization smoke detector (Space Shuttle) and a photoelectric smoke detector (ISS) were transcribed from video. The hypothesis was that reduced buoyant mixing in μg yields larger liquid smoke droplets and a lower number density than in 1-g, which could affect detector alarms. O2, pressure and flow values are not stated in the corpus. [1, 2, 5, 6]

| Criterion | Score | Reason |
|---|---|---|
| fire_safety_directness | 3 | Its sub-research area is Spacecraft Fire Safety. Its stated purpose is to characterize smoke from spacecraft materials in low gravity and to determine whether smoke detectors will alarm. [1, 2, 5] |
| habitat_relevance | 2.50 | Mean of the four habitat scores (3, 3, 2, 2) |
| predictive_modeling_data | 2 | Quantitative measurements exist (TEM particle dimensions, sample mass loss, detector response), but they had to be extracted from TEM images and video records. The data is also described as a reference for validating smoke growth models. [2, 5] |
| controls_and_equipment | 3 | It evaluates the ionization (Shuttle) and photoelectric (ISS) smoke detectors. It is stated to improve design requirements for smoke detectors and to provide baseline data for evaluating future detection technology. [2, 3, 5, 6] |
| earth_applications | 2 | The passages name specific extreme environments, submarines and underwater laboratories, where smoke detectors developed from SAME could be useful. They name no concrete product or standard. [3, 6] |

| Habitat | Score | Reason |
|---|---|---|
| Spacecraft | 3 | It tested smoke from spacecraft materials in microgravity on the ISS, with air flow as a variable. It directly evaluates the smoke detectors used on the Space Shuttle. [1, 5, 6] |
| Space station | 3 | It was conducted on the ISS and evaluates the photoelectric smoke detectors used on the ISS, using smoke from spacecraft materials. [1, 5, 6] |
| Moon base | 2 | Smoke detection is relevant to a lunar base, but the passages report no tests at elevated oxygen, reduced pressure or partial gravity. Results from microgravity would need extrapolation. [1, 6] |
| Pressurized rover | 2 | Early smoke detection matters in a confined pressurized rover, but the passages report no tests at elevated oxygen, reduced pressure or partial gravity. [1, 6, 8] |

**Contributions to the challenge objectives**

- Identify relevant: It is a spacecraft fire safety investigation that measured smoke from materials found on spacecraft, in microgravity on the ISS, to assess fire detection. [1, 5, 6]
- Predictive modeling: It was to develop a numerical code predicting smoke droplet growth from the fuel pyrolysis rate, the vapor thermodynamic properties and the flow environment. It provides a readily modeled reference for validating smoke growth models. [1, 5]
- Controls equipment: It provides quantitative data on the sensitivity of the Shuttle ionization and ISS photoelectric smoke detectors to reduced-gravity smokes. This gives a baseline against which future detection technology can be evaluated and informs detector design requirements. [2, 3, 5, 6]
- Earth applications: Smoke detectors developed from SAME results could be useful in extreme Earth environments such as submarines or underwater laboratories. [3, 6]

**Fire safety pillars**

- Detection: SAME characterizes smoke particle size in low gravity in order to evaluate and improve spacecraft smoke detectors. [1, 2, 5, 6]

**Profile**

| Field | Value |
|---|---|
| Fuel type | solid [5] |
| Hardware | Comparitive Soot Diagnostic Hardware: near field hardware installed in the Glovebox, a Far Field Box attached to the Glovebox, video cameras, two smoke detectors, an igniter and thermophoretic soot samplers. [1, 2] |
| Flight platform | International Space Station (ISS) [1] |
| Dates | Investigation start date 03-02-2001; end date 02-28-2008. [1] |
| Fuels | Overheated spacecraft materials: Teflon, Kapton, cellulose and silicone rubber. [2, 5] |
| Sample shape size | _Not stated in the corpus._ |
| Oxygen | _Not stated in the corpus._ |
| Pressure | _Not stated in the corpus._ |
| Airflow | Air flow (flow field) was a test variable; no values are stated in the corpus. [2, 6] |
| Variables | Test material (Teflon, Kapton, cellulose, silicone rubber). [5]; Sample temperature. [2, 6]; Air flow / flow field. [2, 6]; Smoke residence time near the source / particle aging time. [2, 6]; Igniter on-time of 15 to 60 seconds. [2]; Gravity level: 1-g conditions producing the same mass loss as flight were determined for comparison. [2] |
| Constants | The same two smoke detectors (Space Shuttle ionization and ISS photoelectric designs) were self-diagnosed and operated in each run. [2, 5]; Combustion event duration was typically 2 minutes. [2] |
| Sensors | Ionization smoke detector (Space Shuttle design). [5]; Photoelectric smoke detector (ISS design). [5]; Thermophoretic soot samplers. [2]; Video cameras recording detector data. [2]; Post-flight Transmission Electron microscope (TEM) analysis of collected particulate. [2] |
| Measurements | Primary and aggregate smoke particle dimensions (TEM). [2]; Smoke particle size distribution. [5, 6]; Sample mass loss and mass loss rate. [2]; Smoke detector response. [2] |

**Data for modeling** (needs extraction): TEM particle dimensions, sample mass loss and detector responses were measured, but they require extraction from TEM images and video records. The data is described as a reference for validating smoke growth models. The corpus contains no per-test data table for SAME. [2, 5]

**Key findings**

- _None stated in the corpus._

**Limitations**

- The corpus holds only the summary card, PSI record and fact sheet for SAME. No measured particle sizes or detector responses from SAME itself are reported in the passages. [1, 4]
- Oxygen concentration, pressure, airflow values and sample size are not stated, and no tests at elevated O2, reduced pressure or partial gravity are reported for lunar habitats. [1, 2, 6]
- The fact sheet's results section largely describes the separate reflight SAME-R (Expedition 24, July – September 2010), which is not attributed to SAME here. [7, 8]

**Review flags**

- `over_word_limit`: summary.technical has 127 words; the prompt asks for at most 120

**Sources**

1. "Smoke and Aerosol Measurement Experiment — investigation summary". SAME (PSI-102). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-102>
2. "Smoke and Aerosol Measurement Experiment — investigation summary". SAME (PSI-102). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-102>
3. "Smoke and Aerosol Measurement Experiment — investigation summary". SAME (PSI-102). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-102>
4. "Smoke and Aerosol Measurement Experiment — PSI record". SAME (PSI-102). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-102>
5. "Smoke Aerosol Measurement Experiment (SAME)", p. 1. <https://www.nasa.gov/wp-content/uploads/2025/07/smoke-aerosol-measurement-experiment-same.pdf>
6. "Smoke Aerosol Measurement Experiment (SAME)", p. 1. <https://www.nasa.gov/wp-content/uploads/2025/07/smoke-aerosol-measurement-experiment-same.pdf>
7. "Smoke Aerosol Measurement Experiment (SAME)", p. 3. <https://www.nasa.gov/wp-content/uploads/2025/07/smoke-aerosol-measurement-experiment-same.pdf>
8. "Smoke Aerosol Measurement Experiment (SAME)", p. 4. <https://www.nasa.gov/wp-content/uploads/2025/07/smoke-aerosol-measurement-experiment-same.pdf>

<a id="rank-10-psi-62"></a>
### 10. PSI-62: Concurrent Flame Spread Modeling using Flamelet Generated Manifolds in Microgravity with Comparison to BASS Experiments using Two-Color Tomography

[PSI investigation page](https://psi.nasa.gov/physci/repo/data/investigations/PSI-62) · Tier 1 · Total 76.7

Evidence: own metadata 1 doc / 3 chunks; linked none; pages no; retrieval hybrid.

**For students.** This computer-modeling project developed a faster way to simulate flames spreading along solid plastic in the same direction as the airflow (concurrent flame spread) in weightlessness. Researchers checked the simulations against camera images from NASA's BASS fire experiments. The goal was a tool to predict when spacecraft materials can burn. [1, 2]

**For researchers.** Ground investigation (GRC, 2019–2021) that implemented an unsteady flamelet generated manifold (UFGM) chemistry reduction within a fully coupled fluid–solid framework for charring and ablating materials, to simulate concurrent flame spread in microgravity. Test cases followed BASS geometries: PMMA flat sheets, spheres and rods, and wax cylinders. BASS and BASS-II imagery from PSI (DSLR cameras) was post-processed with newly developed two-color tomography to reconstruct 3D soot and temperature fields. Evaluation metrics were flame geometry, temperature distribution, soot volume fraction and flame spread rate, with emphasis on the 'Goldilocks' flammability zone reported by Olson and Ferkul. The predictions were compared with a parallel NSF normal-gravity flame spread project. O2, pressure and flow speeds are not stated in the corpus. [1, 2]

| Criterion | Score | Reason |
|---|---|---|
| fire_safety_directness | 3 | Listed under Spacecraft Fire Safety, it models flame spread over solid materials (PMMA, wax). Its stated long-term goal is accurate prediction of flammability limits for spacecraft materials. [1, 2] |
| habitat_relevance | 2.50 | Mean of the four habitat scores (3, 3, 2, 2) |
| predictive_modeling_data | 2 | It produces model predictions and 3D tomographic reconstructions of soot and temperature from BASS imagery, intended for model validation. The passages describe no ready-to-use test matrix pairing conditions with outcomes. [1, 2] |
| controls_and_equipment | 2 | It provides predictive modeling tools for screening new materials' flammability limits and LES subgrid models for hazard assessment. This informs material selection through models, not directly through hardware or standards. [1, 2] |
| earth_applications | 1 | The passages give only general Earth benefits: improved combustion modeling, better fire safety standards and protocols, and fire prevention strategies. No specific area or concrete use is named. [3] |

| Habitat | Score | Reason |
|---|---|---|
| Spacecraft | 3 | It models concurrent flame spread over solids in microgravity with forced flow, benchmarked on BASS, where airflow speed was the main variable. The target phenomenon is the low-flow 'Goldilocks' flammability zone, which matters for ventilated spacecraft cabins. [1, 2, 5] |
| Space station | 3 | It covers the same microgravity forced-flow flame spread conditions and flammability-limit prediction, which apply to ventilated station modules and long-duration missions. [1, 2, 5] |
| Moon base | 2 | Flammability-limit prediction is relevant, and microgravity and normal-gravity comparisons could bound the case. No elevated-oxygen, reduced-pressure or partial-gravity tests are reported. [1, 2] |
| Pressurized rover | 2 | Flammability-limit prediction is relevant, and microgravity and normal-gravity comparisons could bound the case. No elevated-oxygen, reduced-pressure or partial-gravity tests are reported. [1, 2] |

**Contributions to the challenge objectives**

- Identify relevant: A Spacecraft Fire Safety ground investigation targeting flammability limits of spacecraft materials under concurrent flame spread in microgravity. [1]
- Predictive modeling: It develops and validates an unsteady flamelet generated manifold model for solid-fuel concurrent flame spread, benchmarked against BASS/BASS-II imagery reconstructed by two-color tomography. The model is also intended as an LES subgrid-scale model for fires. [1, 2]
- Controls equipment: It provides predictive tools for screening new materials' flammability limits, supporting the design of safer spacecraft. [2]
- Earth applications: Improved combustion modeling of coupled thermal, chemical and flow processes could better fire safety standards and fire prevention and mitigation strategies on Earth. [3]

**Fire safety pillars**

- Prevention: Predicting flammability limits of spacecraft materials supports material screening and selection. [1, 2]

**Profile**

| Field | Value |
|---|---|
| Fuel type | solid [2] |
| Hardware | No flight hardware; a computational framework for fully coupled fluid–solid simulations with an unsteady FGM method, plus two-color tomography post-processing of BASS/BASS-II DSLR camera imagery. [2] |
| Flight platform | Ground Investigation, using experimental imagery from BASS and BASS-II found in PSI. [1, 2] |
| Dates | Investigation 05-01-2019 to 04-30-2021; PSI release date 14-Nov-2025. [1, 4] |
| Fuels | Polymethyl methacrylate (PMMA); wax. [2] |
| Sample shape size | BASS geometries: PMMA flat sheets, spheres and rods; wax cylinders. Sizes not stated in the corpus. [2] |
| Oxygen | _Not stated in the corpus._ |
| Pressure | _Not stated in the corpus._ |
| Airflow | Concurrent flow (flame spreading in the flow direction); flow speeds not stated for this investigation. In the BASS benchmark experiments, airflow speed was the main variable. [1, 5] |
| Variables | Sample geometry and material: PMMA flat sheets, spheres, rods; wax cylinders. [2]; Gravity level: microgravity simulations compared with a parallel NSF normal-gravity flame spread project. [2] |
| Constants | Concurrent flame spread configuration over solid fuels. [1, 2] |
| Sensors | DSLR cameras (BASS/BASS-II imagery), post-processed with two-color tomography. [2] |
| Measurements | 3D reconstructions of soot and temperature fields. [2]; Flame geometry, temperature distribution, soot volume fraction and flame spread rate (model evaluation metrics). [2] |

**Data for modeling** (needs extraction): Outputs are model predictions and tomographic 3D soot and temperature reconstructions from BASS/BASS-II imagery, intended for model validation. No per-test matrix of conditions and outcomes is described; results would have to be extracted from the listed publications. [2, 4]

**Key findings**

- _None stated in the corpus._

**Limitations**

- The corpus holds only the summary card and PSI record; no papers or data files, so no results are available here. [1, 4]
- Oxygen concentration, pressure, flow speeds and sample sizes are not stated in the corpus. [2]
- It is a computational ground study relying on existing BASS imagery; no elevated-oxygen, reduced-pressure or partial-gravity conditions are reported. [1, 2]

**Review flags**

- `card_only`: The evidence is only the PSI card and the PSI record: no other document in the corpus

**Sources**

1. "Concurrent Flame Spread Modeling using Flamelet Generated Manifolds in Microgravity with Comparison to BASS Experiments using Two-Color Tomography — investigation summary". PSI-62. <https://psi.nasa.gov/physci/repo/data/investigations/PSI-62>
2. "Concurrent Flame Spread Modeling using Flamelet Generated Manifolds in Microgravity with Comparison to BASS Experiments using Two-Color Tomography — investigation summary". PSI-62. <https://psi.nasa.gov/physci/repo/data/investigations/PSI-62>
3. "Concurrent Flame Spread Modeling using Flamelet Generated Manifolds in Microgravity with Comparison to BASS Experiments using Two-Color Tomography — investigation summary". PSI-62. <https://psi.nasa.gov/physci/repo/data/investigations/PSI-62>
4. "Concurrent Flame Spread Modeling using Flamelet Generated Manifolds in Microgravity with Comparison to BASS Experiments using Two-Color Tomography — PSI record". PSI-62. <https://psi.nasa.gov/physci/repo/data/investigations/PSI-62>
5. Gokoglu, Dietrich, Stocker, Ferkul, Olson, Hicks (2015), "A Researcher's Guide to: Combustion Science (Combustion in Reduced Gravity), NP-2015-10-034-JSC", p. 21. <https://www.nasa.gov/wp-content/uploads/2016/05/np-2015-10-034-jsc_combustion_in_reduced_gravity-iss-mini-book-011116-508.pdf>

<a id="rank-11-psi-47"></a>
### 11. DAFT (PSI-47): Dust and Aerosol Measurement Feasibility Test / Dust and Aerosol Measurement Feasibility Test-2

[PSI investigation page](https://psi.nasa.gov/physci/repo/data/investigations/PSI-47) · Tier 1 · Total 75.0

Evidence: own metadata 1 doc / 2 chunks; linked factsheet 1 doc / 3 chunks; pages no; retrieval hybrid.

**For students.** DAFT and DAFT-2 tested on the International Space Station whether a modified hand-held particle counter (TSI P-Trak) works in weightlessness, where gravity cannot recycle its alcohol. The device was needed for a later smoke experiment (SAME). Measurements showed lower particle levels in ISS air than on Shuttles, and larger average particles than on Earth, helping design better smoke detectors. [1, 2, 4, 5]

**For researchers.** No burning is described: DAFT/DAFT-2 was a risk-mitigation test for SAME, verifying on the ISS that a TSI P-Trak condensate nuclei counter, modified to recycle isopropanol by capillary action in a redesigned condenser tube and with its mercury orientation switch removed, counts aerosol correctly in microgravity. Hypothesized failure modes were clogging/obscuration by isopropanol and over-counting from optics-chamber airflow. Arizona Red Dust (ARD), aerosolized with GN2 and contained in 15-liter Mylar bags, served as the aerosol standard; P-Trak counts were compared with a DustTrak control. The fact sheet reports low ISS particulate levels relative to Shuttles and larger average particle sizes on orbit than on Earth. Oxygen, pressure and airflow conditions are not stated. [1, 2, 5]

| Criterion | Score | Reason |
|---|---|---|
| fire_safety_directness | 3 | Classified under Spacecraft Fire Safety, its stated purpose was to de-risk the smoke-measurement instrument for SAME and to assess the suitability of current shuttle and ISS smoke detectors, i.e., fire detection in crewed spacecraft. [1, 4] |
| habitat_relevance | 1.75 | Mean of the four habitat scores (2, 3, 1, 1) |
| predictive_modeling_data | 1 | Quantitative particle counts and ISS particulate levels are described, but no combustion data, test matrix or model use is stated; the data serve instrument validation and detector design rather than flammability or fire-scenario modeling. [2, 5] |
| controls_and_equipment | 3 | The passages state it supports assessment of current shuttle and ISS smoke detectors and the development of novel fire and smoke detection systems, and that ISS particulate levels will help design detectors that distinguish dust from smoke. [2, 4, 5] |
| earth_applications | 2 | Specific areas are named (smoke detection in submarines or underwater laboratories) without a concrete product or standard. [2, 6] |

| Habitat | Score | Reason |
|---|---|---|
| Spacecraft | 2 | The instrument was validated in microgravity and the results are meant to inform fire detectors for future spacecraft and shuttle detectors, but the background particulate data are specific to ISS and its filtration. [4, 5] |
| Space station | 3 | Measurements were made in the ISS cabin atmosphere itself, characterizing particulate levels and sizes relevant to ISS smoke detector suitability. [4, 5] |
| Moon base | 1 | Only indirect relevance through smoke-detection instrumentation; no elevated-oxygen, reduced-pressure or partial-gravity conditions are reported. [1, 2] |
| Pressurized rover | 1 | Only indirect relevance through smoke-detection instrumentation; no elevated-oxygen, reduced-pressure or partial-gravity conditions are reported. [1, 2] |

**Contributions to the challenge objectives**

- Identify relevant: A spacecraft fire safety investigation focused on fire detection: it validated the particle counter used by SAME and characterized ISS airborne particulate relevant to smoke detector design. [1, 4, 5]
- Predictive modeling: _Not stated in the corpus._
- Controls equipment: Supports assessment of current shuttle and ISS smoke detectors and the design of more reliable, sensitive fire and smoke detection systems able to distinguish normal dust from smoke particles. [2, 4, 5]
- Earth applications: The adapted instrument and resulting smoke detectors may serve other extreme environments on Earth, such as submarines or underwater laboratories. [2, 6]

**Fire safety pillars**

- Detection: It validated a smoke-aerosol particle counter in microgravity and measured ISS background particulate to help design better smoke detectors. [1, 4, 5]

**Profile**

| Field | Value |
|---|---|
| Fuel type | none [1, 2] |
| Hardware | Modified TSI P-Trak (Ultrafine Particle Counter, condensate nuclei counter) with a redesigned condenser tube using capillary forces to recycle isopropyl alcohol and the mercury orientation switch removed; DustTrak used as control; 15-liter Mylar bags for aerosol; DAFT-3 and DAFT-4 used ISS gaseous nitrogen with a fill device. Data downlinked via a program on an EXPRESS computer. [1, 2, 4, 6] |
| Flight platform | International Space Station (ISS); begun on Expedition 10 and planned for completion during Expedition 13. [1, 4] |
| Dates | Investigation start 03-01-2003, end 06-01-2009; PSI release date 01-Jun-2009. [1, 3] |
| Fuels | No fuel is described; the test aerosol was Arizona Red Dust (ARD) aerosolized with GN2, plus ambient ISS air particulate. [2, 5] |
| Sample shape size | Aerosol samples contained within 15-liter Mylar bags. SAME, the target application, requires counts of particles ranging from 0.2-1 micron. [2, 5] |
| Oxygen | _Not stated in the corpus._ |
| Pressure | _Not stated in the corpus._ |
| Airflow | _Not stated in the corpus._ |
| Variables | Instrument: modified TSI P-Trak compared against the DustTrak control. [1, 2]; Aerosol source: ARD standard aerosol created and filtered per the experiment design versus ambient ISS air particulate. [2, 5]; Test configuration: DAFT-1/DAFT-2 (no external power) versus DAFT-3/DAFT-4 (requiring ISS gaseous nitrogen and a fill device). [6] |
| Constants | Microgravity aboard the ISS. [1]; Each test point: devices turned on and run for 6 minutes, with average readings and anomalies noted. [6]; Maximum of three P-Trak test points per day due to sensitivity to atmospheric alcohol content. [6] |
| Sensors | Modified TSI P-Trak condensate nuclei counter: isopropanol condenses on particles, which are then laser counted. [1, 5]; DustTrak, used as the control instrument. [1, 2] |
| Measurements | Aerosol particle counts from the P-Trak compared with DustTrak counts. [2]; Particle sizes and particulate levels in the ISS atmosphere. [4, 5] |

**Data for modeling** (not applicable): No combustion data are described. The passages mention particle counts from ARD standards and ISS ambient air, and ISS particulate levels and sizes, but no test-level tables or modeling use. [2, 5]

**Key findings**

- Data indicated low levels of particulate in ISS relative to Shuttles, attributed to ISS's smaller crew size and its filtration system. [5]
- Average particle sizes were larger on orbit than on Earth, perhaps due to inefficiency of the spacecraft's filter. [5]

**Limitations**

- No fire or combustion was studied; the investigation validated an aerosol instrument and measured background particulate, not smoke from burning materials. [1, 2]
- The passages do not report whether the modified P-Trak met its accuracy goals versus the DustTrak, nor any test-level data. [1, 2, 5]
- Corpus coverage is limited to the summary card, PSI record and one fact sheet; oxygen, pressure and airflow conditions are not stated. [1, 3, 4]

**Sources**

1. "Dust and Aerosol Measurement Feasibility Test / Dust and Aerosol Measurement Feasibility Test-2 — investigation summary". DAFT (PSI-47). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-47>
2. "Dust and Aerosol Measurement Feasibility Test / Dust and Aerosol Measurement Feasibility Test-2 — investigation summary". DAFT (PSI-47). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-47>
3. "Dust and Aerosol Measurement Feasibility Test / Dust and Aerosol Measurement Feasibility Test-2 — PSI record". DAFT (PSI-47). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-47>
4. "Dust and Aerosol Measurement Feasibility Test (DAFT)", p. 1. <https://www.nasa.gov/wp-content/uploads/2025/07/dust-and-aerosol-measurement-feasibility-test-daft.pdf>
5. "Dust and Aerosol Measurement Feasibility Test (DAFT)", p. 1. <https://www.nasa.gov/wp-content/uploads/2025/07/dust-and-aerosol-measurement-feasibility-test-daft.pdf>
6. "Dust and Aerosol Measurement Feasibility Test (DAFT)", p. 2. <https://www.nasa.gov/wp-content/uploads/2025/07/dust-and-aerosol-measurement-feasibility-test-daft.pdf>

<a id="rank-12-psi-115"></a>
### 12. PSI-115: Utilization of the Smoke Aerosol Measurement Experiment Data for Advanced Modeling and Simulation of Smoke Generation in Micro-Gravity

[PSI investigation page](https://psi.nasa.gov/physci/repo/data/investigations/PSI-115) · Tier 2 · Total 73.3

Evidence: own metadata 1 doc / 2 chunks; linked none; pages no; retrieval hybrid.

**For students.** A computer-simulation study of how smoke forms in space compared with on Earth. Researchers modeled tiny particles growing from vapor released by a heated sample, with and without gravity, in a setup like the SAME smoke experiments. The goal was to understand why space smoke differs, so that smoke detectors can be designed to work better. [1, 2]

**For researchers.** Ground-based numerical investigation (2017–2019, GRC; PI Sean Garrick). Formation and growth of dibutyl-phthalate (DBP) particles from pyrolysis vapor expelled by a heated sample were simulated in Earth gravity and microgravity using direct numerical simulation via a Navier-Stokes nodal approach, in a geometry similar to the SAME experiments. Two cross-flow velocities were considered, low enough that buoyancy cannot be neglected in gravity. Simulations assess the dependence of particle size distributions on thermophoresis, particle settling and flow geometry. Buoyancy-driven wake differences were examined at the lower flow speed, and instantaneous scalar fields describe particle accumulation and growth in buoyant and non-buoyant wakes. Oxygen, pressure and velocity values are not stated in the corpus. [1, 2, 3]

| Criterion | Score | Reason |
|---|---|---|
| fire_safety_directness | 3 | Its stated purpose is to quantify how microgravity smoke differs from Earth smoke and to identify the causes, with the stated impact of better smoke detection devices. [1, 2] |
| habitat_relevance | 1.50 | Mean of the four habitat scores (2, 2, 1, 1) |
| predictive_modeling_data | 2 | The investigation produced quantitative simulations of particle size distributions and particle accumulation fields for two cross-flow speeds in 1-g and microgravity. These outputs are described only as being in the final report, which is not in the corpus, so they would need to be extracted. [1, 2] |
| controls_and_equipment | 2 | The passages state that models and tools characterizing smoke particles would directly lead to better smoke detection devices. This is guidance delivered through models rather than direct hardware or standards testing. [2] |
| earth_applications | 2 | The Earth-benefits statement names a specific area, better smoke detection devices that prevent loss of materiel and life, but no concrete product or standard. [2] |

| Habitat | Score | Reason |
|---|---|---|
| Spacecraft | 2 | It simulates microgravity smoke growth under low cross-flow speeds, which is relevant to smoke detection in ventilated cabins. However, the results are numerical, the velocities are not quantified in the corpus, and only a DBP surrogate was modeled. [1, 2] |
| Space station | 2 | Microgravity smoke particle growth in low cross-flow informs smoke detection on a station. The conditions are simulated and only partly specified, so applying them requires extrapolation. [1, 2] |
| Moon base | 1 | The comparison of Earth gravity and microgravity smoke can only bound partial-gravity behavior. No elevated-oxygen, reduced-pressure or partial-gravity conditions are reported. [1] |
| Pressurized rover | 1 | The 1-g versus microgravity simulations give only indirect, bounding relevance to smoke in a lunar pressurized rover. No elevated oxygen or reduced pressure was considered. [1] |

**Contributions to the challenge objectives**

- Identify relevant: It directly addresses how the absence of buoyancy changes smoke particle growth and composition, which is relevant to smoke detection in crewed microgravity environments. [1, 2]
- Predictive modeling: It provides a direct numerical simulation framework for DBP smoke particle formation and growth, assessing how particle size distributions depend on thermophoresis, settling, flow geometry and gravity. [1, 2]
- Controls equipment: Its smoke-particle models are stated to lead directly to better smoke detection devices. [2]
- Earth applications: It claims an Earth benefit in improved smoke detection devices that help prevent loss of materiel and life. [2]

**Fire safety pillars**

- Detection: Characterizing how gravity alters smoke particles is stated to support better smoke detection devices. [2]

**Profile**

| Field | Value |
|---|---|
| Fuel type | _Not stated in the corpus._ |
| Hardware | No physical hardware; direct numerical simulation via a Navier-Stokes nodal approach, in a geometry similar to that of the SAME experiments. [1] |
| Flight platform | Ground Investigation; flight program/platform: Not Applicable. [1] |
| Dates | Investigation 01-30-2017 to 12-31-2019; PSI record released 18-Sep-2024. [1, 3] |
| Fuels | Simulated dibutyl-phthalate (DBP) particles formed from pyrolysis vapor expelled from a heated sample. [1] |
| Sample shape size | A heated sample (hot vapor source) in a geometry similar to that of the SAME experiments; shape and dimensions not stated in the corpus. [1, 2] |
| Oxygen | _Not stated in the corpus._ |
| Pressure | _Not stated in the corpus._ |
| Airflow | Two cross-flow velocities, of sufficiently low speed that buoyancy cannot be neglected in the presence of gravity; numerical values not stated in the corpus. [1] |
| Variables | Gravity: Earth gravity versus microgravity (buoyant versus non-buoyant wakes). [1, 2]; Cross-flow velocity (two low speeds). [1]; Influence of thermophoresis, particle settling and flow geometry on particle size distributions. [1] |
| Constants | Particle material: dibutyl-phthalate (DBP). [1]; Flow geometry similar to that of the SAME experiments, with a heated sample as the vapor source. [1] |
| Sensors | _Not stated in the corpus._ |
| Measurements | Simulated particle size distributions. [1]; Instantaneous scalar fields of particle accumulation and growth in wakes downstream of the hot vapor source. [2]; Wake geometry differences attributable to buoyancy at the lower flow speed. [1] |

**Data for modeling** (needs extraction): Numerical simulation outputs (DBP particle size distributions and particle accumulation and growth fields for two cross-flow speeds in 1-g and microgravity) are reported in a final report that is not in the corpus, so they must be extracted before use for model comparison. [1, 2]

**Key findings**

- _None stated in the corpus._

**Limitations**

- The work is purely numerical (a ground investigation) with no experimental measurements of its own, and it models only DBP particles as the smoke source. [1]
- Oxygen concentration, pressure, cross-flow velocity values and sample dimensions are not stated in the corpus. [1]
- The corpus holds only the summary card and the PSI record. The final report and its results are absent, and no publications are listed. [1, 3]

**Review flags**

- `card_only`: The evidence is only the PSI card and the PSI record: no other document in the corpus

**Sources**

1. "Utilization of the Smoke Aerosol Measurement Experiment Data for Advanced Modeling and Simulation of Smoke Generation in Micro-Gravity — investigation summary". PSI-115. <https://psi.nasa.gov/physci/repo/data/investigations/PSI-115>
2. "Utilization of the Smoke Aerosol Measurement Experiment Data for Advanced Modeling and Simulation of Smoke Generation in Micro-Gravity — investigation summary". PSI-115. <https://psi.nasa.gov/physci/repo/data/investigations/PSI-115>
3. "Utilization of the Smoke Aerosol Measurement Experiment Data for Advanced Modeling and Simulation of Smoke Generation in Micro-Gravity — PSI record". PSI-115. <https://psi.nasa.gov/physci/repo/data/investigations/PSI-115>

<a id="rank-13-psi-107"></a>
### 13. SPICE (PSI-107): Smoke Point In Co-flow Experiment

[PSI investigation page](https://psi.nasa.gov/physci/repo/data/investigations/PSI-107) · Tier 2 · Total 70.0

Evidence: own metadata 1 doc / 2 chunks; linked factsheet 1 doc / 3 chunks; pages no; retrieval hybrid.

**For students.** SPICE burned small gas jets, similar to a lighter flame, aboard the International Space Station. The goal was to find each flame's 'smoke point', the size at which it starts releasing soot (dark carbon particles). Soot makes fires radiate heat, which helps them spread. The results inform how fires behave in spacecraft and how cabin materials are chosen. [1, 2, 4, 5, 6]

**For researchers.** Laminar non-buoyant round jet diffusion flames were stabilized on nozzles of 0.41 mm, 0.76 mm and 1.6 mm diameter in co-flowing air at 5.4 cm/s to 65 cm/s. Fuels were methane, ethylene, propane, propylene and propylene mixtures. The flames burned inside a flow duct in the Microgravity Science Glovebox on the ISS. Fuel flow rate was varied to locate the laminar smoke point, the onset of soot emission. Still and video cameras recorded luminous flame lengths. Measurements included flame height, radiative heat losses and co-flow air velocity distributions. The PSI card reports 526 flames; the fact sheet reports 250 tests and more than 70 smoke points. Oxygen concentrations other than air, and pressure, are not stated. [1, 2, 5]

| Criterion | Score | Reason |
|---|---|---|
| fire_safety_directness | 2 | SPICE is soot and smoke-point combustion science, classed under the Fire Safety sub-area. Its fact sheet states direct fire-safety applications: soot dominates heat emitted from microgravity fires, and the work supports improved flammability criteria for spacecraft material selection. [1, 4, 5] |
| habitat_relevance | 2.50 | Mean of the four habitat scores (3, 3, 2, 2) |
| predictive_modeling_data | 2 | The passages give quantitative conditions (burner diameters, co-flow 5.4 cm/s to 65 cm/s, 526 flames, more than 70 smoke points) and outcomes recorded by still and video cameras. However, no per-test table of outcomes is described, and the flame shape and smoke point data are presented as intended to validate models. [2, 4, 5] |
| controls_and_equipment | 2 | The fact sheet links SPICE to material selection through models. Its results can feed first-order heat-release models and extend NASA cone-calorimeter data toward a performance-based material selection process with improved flammability criteria. [5, 6] |
| earth_applications | 2 | The fact sheet names specific areas of benefit: fire modeling on Earth, prevention of fire spread, and practical combustors such as jet engines, furnaces and power generation boilers. It names no concrete product or standard. [4, 6] |

| Habitat | Score | Reason |
|---|---|---|
| Spacecraft | 3 | The flames burned in microgravity in co-flowing air at 5.4 cm/s to 65 cm/s, low forced-flow speeds. The fact sheet states that soot-driven radiative heat release matters for predicting spacecraft fires. [2, 5, 6] |
| Space station | 3 | Tests ran aboard the ISS in microgravity with low-speed co-flowing air. The soot and heat-release phenomena are stated to inform fire behavior and material selection for crewed spacecraft. [1, 2, 5, 6] |
| Moon base | 2 | Soot production and radiative heat release are relevant to lunar habitat fires. However, the passages report only microgravity tests in air, with no elevated oxygen, reduced pressure or simulated partial gravity, so extrapolation is needed. [2, 5, 6] |
| Pressurized rover | 2 | The phenomenon is relevant to fires in pressurized rovers. However, the tested conditions (microgravity, co-flowing air, pressure not stated) must be extrapolated to partial gravity and an oxygen-enriched, reduced-pressure atmosphere. [2, 5, 6] |

**Contributions to the challenge objectives**

- Identify relevant: SPICE is a PSI Fire Safety investigation. It studies the onset of soot emission, which the fact sheet says dominates heat emitted from microgravity fires and governs their ability to spread. [1, 4, 5]
- Predictive modeling: It provides a database of smoke points and luminous flame lengths versus fuel, burner diameter and co-flow velocity. These data are intended to validate flame-shape models and support first-order predictions of heat release in spacecraft fires. [2, 4, 6]
- Controls equipment: Improved understanding of soot and heat release is stated to support improved flammability criteria for spacecraft material selection. It would also help extend cone-calorimeter heat-release data to microgravity fires. [5, 6]
- Earth applications: The smoke point is described as a classical metric used in fire modeling on Earth. SPICE's results are stated to help predict heat release in jet engines and furnaces and to improve control of soot in practical combustors. [4, 5, 6]

**Fire safety pillars**

- Prevention: Understanding soot-driven radiative heat emission is stated to be critical for preventing fire spread and to support improved flammability criteria for material selection in spacecraft. [4, 5, 6]

**Profile**

| Field | Value |
|---|---|
| Fuel type | gas [1, 2] |
| Hardware | Microgravity Science Glovebox (MSG). The apparatus was a flow duct with integrated nozzles, cameras and fuel delivery systems. [1] |
| Flight platform | International Space Station (ISS); managed by NASA Glenn Research Center (GRC). [1] |
| Dates | Flight dates not stated in the corpus; PSI data release date 18-Sep-2024. [3] |
| Fuels | Methane, ethylene, propane, propylene, and propylene mixtures (gaseous fuels). [1, 2, 5] |
| Sample shape size | Round gas-jet nozzles (burners) producing laminar jet diffusion flames, with burner diameters of 0.41 mm, 0.76 mm, and 1.6 mm. [2, 3] |
| Oxygen | Co-flowing air; no other oxygen concentration is stated. [2] |
| Pressure | _Not stated in the corpus._ |
| Airflow | Co-flow air velocities ranging from 5.4 cm/s to 65 cm/s. [2] |
| Variables | Fuel type (methane, ethylene, propane, propylene, propylene mixtures) [1, 2]; Burner diameter (0.41 mm, 0.76 mm, 1.6 mm) [2]; Co-flow air velocity (5.4 cm/s to 65 cm/s) [2]; Fuel flow rate, adjusted to identify the smoke point [2] |
| Constants | Microgravity aboard the ISS in the MSG flow duct [1]; Co-flowing air as oxidizer [2] |
| Sensors | Still and video cameras [2] |
| Measurements | Smoke point, identified as the flame's transition to emitting soot [2, 5]; Luminous flame lengths and flame height [1, 2]; Radiative heat losses [2]; Co-flow air velocity distributions [2]; Flame stabilization heights and temperature field (planned, per fact sheet) [4] |

**Data for modeling** (needs extraction): Smoke points and flame lengths were recorded for 526 flames across fuels, three burner diameters and co-flow velocities of 5.4 cm/s to 65 cm/s. The fact sheet reports more than 70 smoke points from 250 tests. Outcomes come from camera imagery and publications rather than a per-test table described in the passages, and are intended for validating flame-shape and heat-release models. [2, 4, 5, 6]

**Key findings**

- The investigation completed 250 combustion tests with propylene, propane and ethylene fuel mixtures in microgravity. More than 70 smoke points were identified, yielding estimates of soot-forming conditions and flame dimensions. [5]
- In total 526 flames were studied, with the smoke point located by adjusting fuel flow rate in co-flowing air. [2]

**Limitations**

- The corpus holds only the PSI card, the PSI record and a fact sheet; the investigation's papers are listed but not included, so quantitative results are not available here. The test counts also differ between sources (526 flames vs 250 tests). [2, 3, 5]
- Only microgravity tests in co-flowing air are reported. No elevated oxygen, reduced pressure or partial-gravity conditions are reported, and pressure is not stated. [2]
- The flames are gaseous fuel jets, not burning solid materials. The link to material flammability relies on soot and heat-release models. [1, 5, 6]

**Sources**

1. "Smoke Point In Co-flow Experiment — investigation summary". SPICE (PSI-107). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-107>
2. "Smoke Point In Co-flow Experiment — investigation summary". SPICE (PSI-107). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-107>
3. "Smoke Point In Co-flow Experiment — PSI record". SPICE (PSI-107). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-107>
4. "Smoke Point In Co-flow Experiment (SPICE)", p. 1. <https://www.nasa.gov/wp-content/uploads/2025/07/smoke-point-in-co-flow-experiment-spice.pdf>
5. "Smoke Point In Co-flow Experiment (SPICE)", p. 1. <https://www.nasa.gov/wp-content/uploads/2025/07/smoke-point-in-co-flow-experiment-spice.pdf>
6. "Smoke Point In Co-flow Experiment (SPICE)", p. 2. <https://www.nasa.gov/wp-content/uploads/2025/07/smoke-point-in-co-flow-experiment-spice.pdf>

<a id="rank-14-psi-60"></a>
### 14. PSI-60: Computational and Experimental Analysis of SPICE Data Sets

[PSI investigation page](https://psi.nasa.gov/physci/repo/data/investigations/PSI-60) · Tier 2 · Total 63.3

Evidence: own metadata 1 doc / 2 chunks; linked factsheet 1 doc / 3 chunks; pages no; retrieval hybrid.

**For students.** This ground study re-analyzed more than 1600 photos from NASA's SPICE experiment, which burned small gas-jet flames (like a lighter flame) in microgravity. It combined the images with computer models to study soot, the dark carbon particles that make flames glow and give off heat, and to understand why flames form soot differently in weightlessness than on Earth. [1, 5]

**For researchers.** Ground investigation (Yale; PI Smooke) that integrated experiments and computation on the SPICE laminar coflow gas-jet diffusion flame data sets in PSI. It decoded over 1600 raw Nikon NEF DSLR images into three color channels. Color-ratio pyrometry gave soot temperature fields, and SPICE absolute light calibration gave soot volume fractions. A coupled flow–species–soot model, modified to include radiation re-absorption and discrete-sectional aggregate formation, was run for Yale and ACME burner configurations under normal and microgravity conditions. Comparisons between experiment and model guided sensitivity analyses of soot evolution parameters: radiation, scattering, boundary conditions and heat transfer to the burner structure. The corpus does not state the fuels, O2 concentration, pressure or co-flow speeds of the analyzed cases. [1, 2, 3]

| Criterion | Score | Reason |
|---|---|---|
| fire_safety_directness | 2 | Its purpose is combustion science: the discrepancy between soot formation in 1g and 0g flames. The card states that the results support safer fire detection and suppression for long-duration missions. [1, 2] |
| habitat_relevance | 1.50 | Mean of the four habitat scores (2, 2, 1, 1) |
| predictive_modeling_data | 2 | It derived quantitative soot temperature fields and soot volume fractions from over 1600 raw DSLR images and compared them with a coupled flow–species–soot model. The passages describe no per-test matrix pairing conditions with outcomes, so the results must be extracted from the processed fields or the publication. [1, 2, 3] |
| controls_and_equipment | 2 | The card states that improved predictive soot and radiative transport models support safer fire detection and suppression. It names no specific detector, suppressant or material-screening hardware or standard. [2] |
| earth_applications | 2 | The card names specific areas of benefit: reducing pollutant emissions, optimizing combustion efficiency, and designing cleaner energy and industrial systems. It names no concrete product or standard. [2] |

| Habitat | Score | Reason |
|---|---|---|
| Spacecraft | 2 | It analyzed and simulated microgravity coflow gas-jet flames, focusing on soot, which dominates the heat emitted from microgravity fires. Airflow values are not stated, and gas-jet flames need extrapolation to cabin material fires. [1, 4] |
| Space station | 2 | The microgravity soot formation and radiative transport studied here are relevant to station fires. The flames are laminar gas jets in co-flow, and no cabin-like ventilation speeds are stated. [1, 2, 4] |
| Moon base | 1 | Simulations under both normal and microgravity could only bound partial-gravity behavior. No elevated O2, reduced pressure or simulated partial gravity is reported. [1] |
| Pressurized rover | 1 | As for the Moon base, the normal and microgravity soot results give indirect relevance only. No tests at 30 % O2 or reduced pressure are reported. [1] |

**Contributions to the challenge objectives**

- Identify relevant: It addresses why soot formation differs between 1g and 0g flames. This matters for fire safety because soot dominates the heat emitted from flames in normal gravity and microgravity fires. [1, 4]
- Predictive modeling: It provides soot temperature fields and soot volume fractions derived from SPICE images, plus a coupled flow–species–soot model with radiation re-absorption and discrete-sectional aggregate formation. It also provides a framework for evaluating model parameter sensitivity. [1, 2]
- Controls equipment: The card states that improved understanding of soot formation and radiative transport supports safer fire detection and suppression for long-duration missions. No specific equipment is named. [2]
- Earth applications: Its insights are stated to help reduce pollutant emissions, optimize combustion efficiency and inform the design of cleaner energy and industrial systems. [2]

**Fire safety pillars**

- Detection: The card states that its results on soot formation and radiative transport support safer fire detection for long-duration missions. [2]
- Suppression: The card states that its results support safer fire suppression for long-duration missions. [2]

**Profile**

| Field | Value |
|---|---|
| Fuel type | gas [1] |
| Hardware | Ground investigation with no flight hardware of its own. It analyzed raw Nikon NEF DSLR images from SPICE and simulated Yale and ACME burner configurations. [1] |
| Flight platform | Ground investigation analyzing Smoke Point in Coflow Experiment (SPICE) microgravity data available in PSI. [1] |
| Dates | Investigation start date 06-05-2019, end date 08-29-2022; PSI record release date 30-Sep-2025. [1, 3] |
| Fuels | The corpus does not state which fuels were in the cases this investigation analyzed. The SPICE data sets it draws on came from tests with various fuel mixtures, including propylene, propane, and ethylene. [5] |
| Sample shape size | Laminar jet diffusion flames stabilized in a co-flowing oxidizer. SPICE used different nozzle diameter/co-flow velocity configurations, and this investigation simulated Yale and ACME burner configurations. Dimensions are not stated in the corpus. [1, 4] |
| Oxygen | _Not stated in the corpus._ |
| Pressure | _Not stated in the corpus._ |
| Airflow | SPICE flames burned in a co-flowing oxidizer under different nozzle diameter/co-flow velocity configurations. Co-flow speed values are not stated in the corpus. [4, 5] |
| Variables | Gravity level: normal gravity and microgravity [1]; Burner configuration: Yale and ACME burners [1]; Model parameters in sensitivity analyses: radiation, scattering, boundary conditions, heat transfer to the burner structure [2]; In the underlying SPICE data: fuel and nozzle diameter/co-flow velocity configuration [4, 5] |
| Constants | All experimental data came from SPICE data sets in PSI, using the SPICE absolute light calibration [1] |
| Sensors | Nikon DSLR camera, raw NEF images decoded into three color channels (SPICE imagery) [1] |
| Measurements | Soot temperature fields from color-ratio pyrometry [1]; Soot volume fractions from absolute light calibration [1]; Computed soot distributions compared with experiment for sensitivity analysis [2] |

**Data for modeling** (needs extraction): It derived soot temperature distributions and soot volume fractions from over 1600 raw SPICE DSLR images, paired with simulations of a coupled flow–species–soot model. The passages describe no ready test matrix, so outcomes must be extracted from the processed fields or the 2022 publication (DOI 10.1080/00102202.2022.2041621). The PSI record DOI is 10.60555/mzjm-yv57 (CC0-1.0). [1, 2, 3]

**Key findings**

- _None stated in the corpus._

**Limitations**

- It is a ground computational and image-analysis study of existing SPICE data, with no new combustion tests. [1]
- The corpus holds only the summary card and PSI record, so it gives no results and no fuels, O2, pressure or co-flow speeds for the analyzed cases. [1, 2, 3]
- It covers gaseous jet flames under normal and microgravity only, with no solid materials, elevated oxygen, reduced pressure or partial gravity. [1]

**Sources**

1. "Computational and Experimental Analysis of SPICE Data Sets — investigation summary". PSI-60. <https://psi.nasa.gov/physci/repo/data/investigations/PSI-60>
2. "Computational and Experimental Analysis of SPICE Data Sets — investigation summary". PSI-60. <https://psi.nasa.gov/physci/repo/data/investigations/PSI-60>
3. "Computational and Experimental Analysis of SPICE Data Sets — PSI record". PSI-60. <https://psi.nasa.gov/physci/repo/data/investigations/PSI-60>
4. "Smoke Point In Co-flow Experiment (SPICE)", p. 1. <https://www.nasa.gov/wp-content/uploads/2025/07/smoke-point-in-co-flow-experiment-spice.pdf>
5. "Smoke Point In Co-flow Experiment (SPICE)", p. 1. <https://www.nasa.gov/wp-content/uploads/2025/07/smoke-point-in-co-flow-experiment-spice.pdf>

<a id="rank-15-psi-117"></a>
### 15. PSI-117: Effect of External Thermo-Convective Perturbation on Cool Flame Dynamics: A Multidimensional Multi-Physics CFD Analysis

[PSI investigation page](https://psi.nasa.gov/physci/repo/data/investigations/PSI-117) · Tier 3 · Total 63.3

Evidence: own metadata 1 doc / 2 chunks; linked none; pages no; retrieval hybrid.

**For students.** This ground study used computer simulations to understand 'cool flames': faint, low-temperature flames that can surround burning fuel droplets in weightlessness. Using data from the space station's FLEX experiment, it tested how added heat and gentle air motion change whether these flames start, pulse, turn into hot flames, or go out. [1, 2]

**For researchers.** Ground CFD investigation (PI Tanvir Farouk) of n-alkane droplet cool flames in microgravity. A 3-D OpenFOAM model couples variable-density Navier–Stokes flow, low-temperature combustion chemistry, coupled heat and mass transfer, and radiation, with fidelity established against ISS FLEX measurements. Three forcing modes were simulated on large (1–4 mm) and sub-millimeter (~0.5 mm) droplets: convection alone (mimicking droplet drift), imposed heat flux, and combined convection plus heating. Work began with simplified chemistry and moved to reduced mechanisms for sweeps over forcing amplitude and frequency, ambient composition (including ozone-assisted cases) and pressure. Ignition delay, oscillation frequency and amplitude, and stand-off and extinction diameters were extracted to build stability maps for cool-flame onset, persistence and quenching, which were reconciled with FLEX observations. [1, 2, 3]

| Criterion | Score | Reason |
|---|---|---|
| fire_safety_directness | 2 | Its purpose is cool-flame droplet combustion science: ignition, oscillation, hot-ignition transition and extinction. The card states a direct application: the potential to improve spacecraft fire-safety modeling by resolving cool-flame and extinction behavior in microgravity. [1, 2] |
| habitat_relevance | 1.50 | Mean of the four habitat scores (2, 2, 1, 1) |
| predictive_modeling_data | 2 | The study produced CFD-derived quantitative observables (ignition delay, oscillation frequency and amplitude, stand-off and extinction diameters) and stability maps, and it states that it produced reusable models. No per-test data set pairing conditions with outcomes is described in the corpus, so results must be taken from papers or model outputs. [1, 2] |
| controls_and_equipment | 2 | The card says the work leverages FLEX to define safer operating envelopes and materials through modeling. That is guidance through models, not direct detection, suppression or screening hardware. [2] |
| earth_applications | 2 | The card names specific areas of benefit: engine knock, efficiency and emissions, and validated CFD tools transferable to practical combustors. It names no concrete product or standard. [2] |

| Habitat | Score | Reason |
|---|---|---|
| Spacecraft | 2 | It models microgravity droplet cool flames under low convective forcing that mimics drift, with a stated potential for spacecraft fire-safety modeling. The phenomenon is liquid-droplet cool flames, not cabin materials, so application needs extrapolation. [1, 2] |
| Space station | 2 | It uses ISS FLEX data and simulates microgravity conditions with weak convection, which bears on extinction behavior in ventilated or quiescent station environments. Extending it to station fire scenarios still requires extrapolation. [1, 2] |
| Moon base | 1 | Pressure and ambient composition were varied, but no elevated-oxygen, reduced-pressure or partial-gravity values are reported. Relevance to a lunar base is therefore indirect. [2] |
| Pressurized rover | 1 | No tests at 30 % or more O2, reduced pressure or simulated partial gravity are reported. The microgravity cool-flame results only indirectly inform pressurized rover conditions. [2] |

**Contributions to the challenge objectives**

- Identify relevant: A ground computational study of FLEX droplet cool flames whose stated space benefit is improved spacecraft fire-safety modeling of cool-flame and extinction behavior in microgravity. [1, 2]
- Predictive modeling: It provides a 3-D OpenFOAM CFD model validated against ISS FLEX measurements and stability maps of cool-flame onset, persistence and quenching. These are built from predicted ignition delay, oscillation and extinction diameters across forcing, composition and pressure sweeps. [1, 2]
- Controls equipment: The card states that the work leverages FLEX to define safer operating envelopes and materials. The stability maps were also used to guide next-generation droplet test matrices. [2]
- Earth applications: It advances low-temperature combustion understanding relevant to engine knock, efficiency and emissions, and delivers CFD tools transferable to practical combustors. [2]

**Fire safety pillars**

- Prevention: Mapping the conditions for cool-flame onset, hot-ignition transition and extinction is stated to help define safer operating envelopes and materials for spacecraft. [1, 2]

**Profile**

| Field | Value |
|---|---|
| Fuel type | liquid [1, 2] |
| Hardware | No flight hardware; a 3-D CFD model developed in OpenFOAM, validated against flight data from NASA's Flame Extinguishment Experiment (FLEX) obtained through PSI. [1, 2] |
| Flight platform | Ground Investigation (managed by Glenn Research Center); uses ISS FLEX flight measurements. [1, 2] |
| Dates | Investigation start 02-15-2017, end 02-14-2022; PSI record release date 10-Jun-2026. [1, 3] |
| Fuels | n-alkane droplets (simulated). Publication titles also cover higher n-alkane droplets, equi-volume n-heptane/iso-octane mixture droplets and multi-component jet fuel surrogate droplets. [2, 3] |
| Sample shape size | Spherical fuel droplets: large (1–4 mm) and sub-millimeter (~0.5 mm). [2] |
| Oxygen | _Not stated in the corpus._ |
| Pressure | Pressure was varied in parameter sweeps; values are not stated in the corpus. [2] |
| Airflow | Microgravity with buoyancy suppressed. Imposed convection mimicking droplet drift, and oscillatory/shear inflow with varied forcing amplitude and frequency, were simulated; speeds are not stated in the corpus. [1, 2] |
| Variables | Forcing mode: (i) convection alone to mimic droplet drift, (ii) imposed heat flux, (iii) combined convection plus heating. [2]; Droplet size: large (1–4 mm) and sub-millimeter (~0.5 mm). [2]; Forcing amplitude and frequency. [2]; Ambient composition (including ozone-assisted cases) and pressure. [2]; Chemistry fidelity: simplified chemistry first, then reduced mechanisms. [2] |
| Constants | Microgravity conditions with buoyancy suppressed. [1]; Model physics: variable-density Navier–Stokes flow coupled with low-temperature combustion chemistry, heat and mass transfer, and radiation. [2]; Already established droplet cool flames of n-alkane fuels. [1, 2] |
| Sensors | None; this is a computational study validated against ISS FLEX measurements (the FLEX instruments are not stated in the corpus). [1, 2] |
| Measurements | Predicted observables: ignition delay, oscillation frequency and amplitude, stand-off diameter and extinction diameter. [2]; Stability maps delineating conditions for cool-flame onset, persistence and quenching, including transitions to hot ignition and warm-flame behavior. [1, 2]; Sensitivity analyses coupling low-temperature chemistry with transport and radiative effects. [1] |

**Data for modeling** (needs extraction): The investigation produced reusable CFD models, sensitivity analyses and simulation-derived observables (ignition delay, oscillation frequency and amplitude, stand-off and extinction diameters) organized into stability maps and reconciled with FLEX data. The corpus does not describe a released per-case data table, so outputs must be extracted from the models or publications. [1, 2, 3]

**Key findings**

- The 3-D OpenFOAM model of n-alkane droplet cool flames was validated against ISS FLEX measurements before it was used for controlled forcing simulations. [2]

**Limitations**

- This is a ground computational study; it generated no new flight data and relies on FLEX measurements for validation. [1, 2]
- The corpus holds only the summary card and PSI record. Numeric results, stability-map values and the oxygen, pressure and flow ranges are not given. [1, 2, 3]
- The work concerns liquid fuel droplet cool flames, not solid cabin materials. No elevated-oxygen, reduced-pressure or partial-gravity cases are reported for lunar habitats. [1, 2]

**Review flags**

- `card_only`: The evidence is only the PSI card and the PSI record: no other document in the corpus

**Sources**

1. "Effect of External Thermo-Convective Perturbation on Cool Flame Dynamics: A Multidimensional Multi-Physics CFD Analysis — investigation summary". PSI-117. <https://psi.nasa.gov/physci/repo/data/investigations/PSI-117>
2. "Effect of External Thermo-Convective Perturbation on Cool Flame Dynamics: A Multidimensional Multi-Physics CFD Analysis — investigation summary". PSI-117. <https://psi.nasa.gov/physci/repo/data/investigations/PSI-117>
3. "Effect of External Thermo-Convective Perturbation on Cool Flame Dynamics: A Multidimensional Multi-Physics CFD Analysis — PSI record". PSI-117. <https://psi.nasa.gov/physci/repo/data/investigations/PSI-117>

<a id="rank-16-psi-68"></a>
### 16. FLEX-2 (PSI-68): Flame Extinguishment Experiment - 2

[PSI investigation page](https://psi.nasa.gov/physci/repo/data/investigations/PSI-68) · Tier 1 · Total 60.0

Evidence: own metadata 1 doc / 4 chunks; linked factsheet 1 doc / 8 chunks; pages no; retrieval hybrid.

**For students.** FLEX-2 burned tiny liquid fuel droplets aboard the International Space Station. Without gravity, each flame forms a ball around its droplet. By changing the fuel, the fuel mixtures, the oxygen level, the pressure, gentle airflow and the spacing between droplets, it studied how these flames burn, make soot and go out (extinction). The goal was reference data for checking computer models of fuel burning. [1, 2, 3, 7, 8]

**For researchers.** FLEX-2 burned single droplets and binary linear droplet arrays of pure and bi-component (including surrogate) liquid fuels in the CIR/MDCA on the ISS. Droplets were fiber-supported, tethered at fiber crosshairs, or freely deployed. Droplets of 2 mm to 4 mm in diameter are cited, and the initial diameter was varied. A retractable ignitor was powered for 1 to 5 seconds. The ambient O2 was 0.1 to 0.4 mole fraction with diluent balance, at 0.5 atm to 3.0 atm. Tests ran in a quiescent ambient or with sub-buoyant flow produced by translating the droplet. The independently varied parameters were fuel type, gas composition, pressure, initial diameter, translation velocity and array spacing. Diagnostics were color video, high speed photography and chamber pressure and temperature. Targets included extinction boundaries and soot-shell dynamics. [1, 2, 3, 6, 7, 8]

| Criterion | Score | Reason |
|---|---|---|
| fire_safety_directness | 2 | The stated goal is benchmark droplet-combustion data under combustor-like conditions, but the objectives include flame extinction mechanisms and their boundaries, soot formation, and flammability limits of droplet arrays. PSI also lists the investigation under the Spacecraft Fire Safety sub-research area. [1] |
| habitat_relevance | 2 | Mean of the four habitat scores (2, 2, 2, 2) |
| predictive_modeling_data | 2 | The data is explicitly intended as benchmark data to validate numerical simulations and develop theoretical models. However, the corpus gives no test-level matrix, and outcomes such as burning to completion versus extinction at finite radius must be extracted from video and photography. [1, 2, 3, 7] |
| controls_and_equipment | 1 | The only connection to safer spacecraft is the investigation's classification under the Spacecraft Fire Safety sub-research area. No link to detection, suppression or material-selection hardware is stated for FLEX-2. [1] |
| earth_applications | 2 | The passages name specific areas of benefit: transportation-sector liquid fuel combustion, cleaner and more efficient combustor designs, surrogate fuels, and validation of jet engine models. They describe these as potential contributions, not a realized product or standard. [3, 4, 6] |

| Habitat | Score | Reason |
|---|---|---|
| Spacecraft | 2 | Microgravity droplet extinction and flammability-limit tests, run in quiescent and sub-buoyant flow conditions, bear on fire behavior when ventilation is off or weak. The liquid fuels and combustor-oriented conditions need extrapolation to cabin fire materials. [1, 2, 7, 8] |
| Space station | 2 | The tests were run on the ISS in quiescent and sub-buoyant flows and address flame extinction and flammability limits. The droplet fuels and configuration need extrapolation to station fire scenarios. [1, 2, 7, 8] |
| Moon base | 2 | Tests reached O2 of up to 0.4 mole fraction and pressures down to 0.5 atm, which overlaps the expected lunar habitat atmosphere. However, they were in microgravity and used liquid droplets, so applying them to partial-gravity habitat fires requires extrapolation. [2] |
| Pressurized rover | 2 | The elevated O2 (up to 0.4 mole fraction) and reduced pressure (0.5 atm) tests overlap the expected rover atmosphere. The microgravity droplet-combustion results can only bound partial-gravity behavior. [2] |

**Contributions to the challenge objectives**

- Identify relevant: FLEX-2 is classified under Spacecraft Fire Safety and studies flame extinction mechanisms, their boundaries, and the flammability limits of droplet arrays. It covered O2 of 0.1 to 0.4 mole fraction and pressures of 0.5 atm to 3.0 atm. [1, 2]
- Predictive modeling: It provides benchmark data on bi-component droplet combustion over a wide range of initial conditions, intended to validate numerical simulations. It also supports detailed and reduced-order droplet combustion models that include flow-field and droplet-droplet interactions. [1, 2, 6]
- Controls equipment: _Not stated in the corpus._
- Earth applications: Insights are aimed at cleaner and more efficient liquid-fuel combustion in transportation and at evaluating future fuels through surrogates. They also target the validation of jet engine models by engine manufacturers. [3, 4, 6]

**Fire safety pillars**

- Prevention: It studies flame extinction boundaries and the influence of droplet interactions on flammability limits, which underpin understanding of when liquid fuels can sustain a flame. [1]

**Profile**

| Field | Value |
|---|---|
| Fuel type | liquid [1, 7] |
| Hardware | Combustion Integrated Rack (CIR) with the Multi-user Droplet Combustion Apparatus (MDCA). Components include fuel dispensing needles, a support fiber or fiber crosshairs for tethered droplets, and a retractable ignitor. [1, 2, 3, 8] |
| Flight platform | International Space Station (ISS); managed by Glenn Research Center (GRC) [1] |
| Dates | Investigation start 08-12-2016, end 09-30-2019; PSI data release 30-Sep-2019 [1, 5] |
| Fuels | Pure liquid fuels and bi-component fuel mixtures, including surrogate fuels meant to mimic practical fuels. The investigation card does not name the specific fuels. The PSI record lists publications on fuels such as n-heptane, n-octane, n-decane, n-butanol, methanol, methyl butanoate, methyl decanoate, Jet-A and Jet-A surrogates, but does not tie each one to FLEX-2 tests. [1, 5, 6] |
| Sample shape size | Spherical fuel droplets, either single or a pair in a binary linear array along a support fiber. Droplets were fiber-supported, freely deployed, or tethered at the intersection of two fiber crosshairs for convective tests. Droplets of 2 mm to 4 mm in diameter are cited, and the initial diameter and array spacing were varied. [2, 3, 7, 8] |
| Oxygen | O2 concentration between 0.1 and 0.4 mole fraction, with the diluent gas making up the balance [2] |
| Pressure | 0.5 atm to 3.0 atm [2] |
| Airflow | Quiescent ambient for most tests. In the convective flow tests, a known sub-buoyant flow was produced by translating the tethered droplet (moving the fiber crosshairs) through the quiescent atmosphere. Translation velocity and acceleration were varied, but their values are not stated in the corpus. [3, 7, 8] |
| Variables | Fuel type (pure fuels and bi-component mixtures) [3]; Ambient gas composition (O2 0.1 to 0.4 mole fraction, diluent balance) [2, 3]; Ambient pressure (0.5 atm to 3.0 atm) [2, 3]; Droplet initial diameter [3]; Droplet translation velocity (and acceleration) [3]; Droplet spacing and initial size in a binary linear array [3] |
| Constants | Microgravity environment on the ISS [1, 2]; Settling time of approximately 2 minutes after chamber fill, before the test starts [2]; Dwell period of at least 10 seconds after needle retraction, before ignition [2, 3]; Ignitor power applied for a selectable time of 1 second to 5 seconds, then the ignitor is retracted [3] |
| Sensors | Color camera video with near real-time downlink [3]; High speed photography for tracking flame evolution [3]; Chamber pressure and temperature recording [3] |
| Measurements | Flame evolution and burning history of single droplets and binary arrays [3, 7]; Burning to completion versus flame extinction at a finite droplet radius [7]; Soot formation, including soot volume fraction and soot-shell dynamics (stated objective) [1]; Chamber pressure and temperature [3] |

**Data for modeling** (needs extraction): FLEX-2 was designed to supply benchmark data on bi-component droplet combustion for validating numerical simulations. It comprised four groupings (pure fuel, fuel mixture, convective flow and binary droplet array), each of 30 to 60 tests. The corpus holds no test matrix or per-test outcomes. Burning histories and extinction outcomes would have to be extracted from video and photography, or taken from the listed publications. [1, 2, 3, 7, 8]

**Key findings**

- _None stated in the corpus._

**Limitations**

- The corpus holds only the PSI summary card, PSI record and a fact sheet for FLEX-2. It has no test matrix, per-test conditions, measured results or data files. [1, 5, 8]
- The investigation is oriented toward combustor and transportation fuels. Applying its extinction and flammability-limit results to spacecraft fire materials requires extrapolation. [1, 3, 6]
- All tests were in microgravity, with no partial-gravity conditions. The sub-buoyant flow velocities and the specific fuels and diluents are not stated in the corpus. [1, 2, 8]

**Review flags**

- `over_word_limit`: summary.plain has 64 words; the prompt asks for at most 60
- `over_word_limit`: summary.technical has 129 words; the prompt asks for at most 120

**Sources**

1. "Flame Extinguishment Experiment - 2 — investigation summary". FLEX-2 (PSI-68). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-68>
2. "Flame Extinguishment Experiment - 2 — investigation summary". FLEX-2 (PSI-68). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-68>
3. "Flame Extinguishment Experiment - 2 — investigation summary". FLEX-2 (PSI-68). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-68>
4. "Flame Extinguishment Experiment - 2 — investigation summary". FLEX-2 (PSI-68). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-68>
5. "Flame Extinguishment Experiment - 2 — PSI record". FLEX-2 (PSI-68). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-68>
6. "Flame Extinguishment Experiment (FLEX)", p. 2. <https://www.nasa.gov/wp-content/uploads/2025/07/flame-extinguishment-experiment-flex.pdf>
7. "Flame Extinguishment Experiment (FLEX)", p. 3. <https://www.nasa.gov/wp-content/uploads/2025/07/flame-extinguishment-experiment-flex.pdf>
8. "Flame Extinguishment Experiment (FLEX)", p. 4. <https://www.nasa.gov/wp-content/uploads/2025/07/flame-extinguishment-experiment-flex.pdf>

<a id="rank-17-psi-10"></a>
### 17. ACME Flame Design (PSI-10): Advanced Combustion via Microgravity Experiments / Flame Design

[PSI investigation page](https://psi.nasa.gov/physci/repo/data/investigations/PSI-10) · Tier 3 · Total 56.7

Evidence: own metadata 1 doc / 2 chunks; linked factsheet 1 doc / 20 chunks; pages no; retrieval hybrid.

**For students.** Flame Design burned ethylene and methane gas from a ball-shaped porous burner aboard the International Space Station. Without gravity the flames form spheres. The goal was to learn when soot (carbon particles) starts forming and when flames go out, so that clean, efficient flames can be designed. The team also tested whether flammability limits can be found for these flames. [1, 2, 6]

**For researchers.** Quasi-steady normal and inverse spherical (and, alternatively, normal and inverse coflow) laminar non-premixed C2H4 and CH4 diffusion flames, produced in the ACME hardware in the CIR on the ISS and in drop towers. Variables were flow rate, stoichiometric mixture fraction Zst, inert amount (N2 or CO2) and pressure, with oxygen-enriched atmospheres. Targets were soot-inception limits, extinction limits (radiative vs kinetic), pseudo-flammability limits, and flame temperature, size, color and soot volume fraction. The hypothesis was that spherical flames extinguish when peak temperature first decreases below 1130 K. Diagnostics: cameras, radiometers, photomultiplier tubes and thermocouples. The ACME suite adds color, CH*, OH* imaging, pyrometry, TFP and gas chromatography. Tests ran in a constant-volume chamber of about 90 liters. [1, 2, 6, 7, 9, 15]

| Criterion | Score | Reason |
|---|---|---|
| fire_safety_directness | 2 | The primary purpose is soot inception and clean flame design, but stated objectives include extinction limits and whether pseudo-flammability limits can be obtained. Fire prevention, especially for spacecraft, is a stated secondary objective of the whole ACME family. [1, 4, 6, 7] |
| habitat_relevance | 1.50 | Mean of the four habitat scores (2, 2, 1, 1) |
| predictive_modeling_data | 2 | The flames were measured quantitatively for temperature, size, soot volume fraction, and soot-inception and extinction limits, using cameras, radiometers, PMTs and thermocouples. No test-level matrix appears in the passages, so outcomes must be extracted from imagery, sensor data or the listed papers. [1, 2, 3, 9] |
| controls_and_equipment | 1 | The passages give only the ACME family's general secondary objective of fire prevention for spacecraft. Material-screening test-method goals are attributed specifically to BRE, not to Flame Design. [4, 5] |
| earth_applications | 2 | The passages name improved efficiency and lower pollutant emissions in terrestrial combustors, including contributions to novel designs of future coal power plants and improved burner designs. No specific product or standard is named. [2, 6] |

| Habitat | Score | Reason |
|---|---|---|
| Spacecraft | 2 | The tests measured extinction and flammability-type limits of flames in quiescent microgravity in oxygen-enriched atmospheres, which relates to ventilation-off conditions. Gaseous burner flames, not cabin materials, were burned, so the results need extrapolation. [1, 6, 8, 15] |
| Space station | 2 | The tests measured extinction and soot limits in quiescent microgravity, which bears on ventilation-failure scenarios. The results need extrapolation from gaseous spherical burner flames to station material fires. [1, 6, 8] |
| Moon base | 1 | Oxygen-enriched atmospheres were used, but no oxygen percentage or reduced pressure is reported, and only microgravity was tested. Relevance to lunar partial gravity is indirect. [1, 6] |
| Pressurized rover | 1 | Oxygen-enriched atmospheres were tested, but no concentration of 30 % or more and no reduced pressure is reported, and there were no partial-gravity tests. Relevance to pressurized rovers is indirect. [1, 6] |

**Contributions to the challenge objectives**

- Identify relevant: Provides microgravity extinction limits and an assessment of pseudo-flammability limits for spherical C2H4 and CH4 diffusion flames, within the ACME family whose secondary objective is spacecraft fire prevention. [1, 4, 7]
- Predictive modeling: Targets detailed measurements of flame temperature, size and soot volume fraction, plus a testable extinction criterion (peak temperature below 1130 K), within an ACME program aimed at developing and verifying computational models. [1, 2, 4]
- Controls equipment: Only a general link is stated: the ACME family names fire prevention, especially for spacecraft, as a secondary objective. [4]
- Earth applications: Aims to improve efficiency and reduce pollutant emissions in terrestrial combustors. It is described as contributing to novel coal power plant designs and possibly to less polluting burner designs. [2, 6]

**Fire safety pillars**

- Prevention: It studies extinction limits and whether stoichiometric mixture fraction can characterize flammability limits of non-premixed flames, within an ACME family that names spacecraft fire prevention as a secondary goal. [4, 7]

**Profile**

| Field | Value |
|---|---|
| Fuel type | gas [1, 4] |
| Hardware | ACME modular hardware in the Combustion Integrated Rack (CIR), including the Reconfiguration of CIR. Spherical flames are produced with a porous spherical burner as in s-Flame, with a coflow burner as the alternative for inverse tests. The ACME chamber insert carries a high-definition color camera and an avionics package. [1, 6, 7, 8] |
| Flight platform | International Space Station (ISS), with spherical diffusion flame tests also performed in drop towers. [1, 2] |
| Dates | Investigation start 01-14-1999, end 04-30-2025. PSI record release date 20-Nov-2025. [1, 3] |
| Fuels | Gaseous ethylene (C2H4) and methane (CH4), with inert diluent N2 or CO2. [1, 6] |
| Sample shape size | Normal and inverse spherical diffusion flames from a porous spherical burner. Normal and inverse coflow flames serve as an alternative, with inverse coflow injecting oxygen/inert from a central tube and fuel from a surrounding annulus. Burner dimensions are not stated in the corpus. [1, 6, 7] |
| Oxygen | Oxygen-enriched atmospheres at various concentrations, with stoichiometric mixture fraction Zst varied. Numerical O2 concentrations are not stated in the corpus. [1, 6] |
| Pressure | Pressure was a test variable. A listed publication reports ethylene spherical flames at 1 bar and another reports effects of elevated pressure. The full range is not stated in the corpus. ACME tests were constant volume, so pressure rises during a test. [1, 3, 15] |
| Airflow | No imposed chamber airflow. Spherical flames are fed by reactant flow from the burner at varied flow rates, in normal and inverse convection directions. Tests ran in a constant-volume chamber of about 90 liters for typically 0.5-2 minutes. [1, 2, 15] |
| Variables | Reactant flow rate [1, 2]; Stoichiometric mixture fraction (Zst) [1]; Amount of inert (N2 or CO2) [1]; Pressure [1, 2]; Flame configuration: normal vs inverse, spherical vs coflow [1, 6, 7]; Fuel: C2H4 or CH4 [1]; Concentration of the injected fuel and of the oxygen-enriched atmosphere [6] |
| Constants | Microgravity, laminar, gaseous, non-premixed flames [4]; Constant-volume chamber with free volume of about 90 liters [15] |
| Sensors | Cameras, radiometers, photomultiplier tubes and thermocouples [2]; ACME imaging suite: color, CH* (430-nm) and OH* (310-nm) imaging, color-ratio pyrometry with HiBMs/LCTF, and soot volume fraction by extinction [9, 10, 11, 12]; Thin Filament Pyrometry with 5 SiC fibers, and six far-field thermocouples for spherical flame experiments [11, 12]; Thermopile radiometers (0.2-11 micron), including a wide-view radiometer for spherical flames [13]; Three PMTs (230-700 nm; 310-nm and 430-nm filters), CIR gas chromatograph, chamber pressure, and SAMS-II acceleration [13, 14] |
| Measurements | Soot-inception limits and corresponding temperatures in hot regions [1]; Extinction limits, classified as radiative or kinetic extinction [1]; Flame temperature, size, color and soot volume fraction [1] |

**Data for modeling** (needs extraction): Quantitative flame temperature, size, soot volume fraction, and soot-inception and extinction limits are targeted, using imaging, radiometers, PMTs and thermocouples. No test matrix is in the corpus, so values must be extracted from imagery, sensor data or the listed publications. [1, 2, 3]

**Key findings**

- _None stated in the corpus._

**Limitations**

- The corpus holds only the summary card, the PSI record and an ACME family fact sheet. No test matrix and no reported results for Flame Design are included. [1, 3, 4]
- Numerical oxygen concentrations, the pressure range and burner dimensions are not stated, which limits comparison with Moon Base conditions. [1, 6]
- Fuels are gaseous burner flames rather than spacecraft materials, and inverse spherical testing was contingent on Payload Safety Review Panel approval. No partial-gravity tests were performed. [4, 6]

**Sources**

1. "Advanced Combustion via Microgravity Experiments / Flame Design — investigation summary". ACME Flame Design (PSI-10). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-10>
2. "Advanced Combustion via Microgravity Experiments / Flame Design — investigation summary". ACME Flame Design (PSI-10). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-10>
3. "Advanced Combustion via Microgravity Experiments / Flame Design — PSI record". ACME Flame Design (PSI-10). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-10>
4. "Advanced Combustion via Microgravity Experiments (ACME)", p. 1. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>
5. "Advanced Combustion via Microgravity Experiments (ACME)", p. 1. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>
6. "Advanced Combustion via Microgravity Experiments (ACME)", p. 5. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>
7. "Advanced Combustion via Microgravity Experiments (ACME)", p. 5. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>
8. "Advanced Combustion via Microgravity Experiments (ACME)", p. 8. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>
9. "Advanced Combustion via Microgravity Experiments (ACME)", p. 11. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>
10. "Advanced Combustion via Microgravity Experiments (ACME)", p. 13. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>
11. "Advanced Combustion via Microgravity Experiments (ACME)", p. 15. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>
12. "Advanced Combustion via Microgravity Experiments (ACME)", p. 15. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>
13. "Advanced Combustion via Microgravity Experiments (ACME)", p. 16. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>
14. "Advanced Combustion via Microgravity Experiments (ACME)", p. 18. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>
15. "Advanced Combustion via Microgravity Experiments (ACME)", p. 18. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>

<a id="rank-18-psi-21"></a>
### 18. ACME CLD Flame (PSI-21): Advanced Combustion via Microgravity Experiments / Coflow Laminar Diffusion Flame

[PSI investigation page](https://psi.nasa.gov/physci/repo/data/investigations/PSI-21) · Tier 3 · Total 56.7

Evidence: own metadata 1 doc / 3 chunks; linked factsheet 1 doc / 20 chunks; pages no; retrieval hybrid.

**For students.** On the International Space Station, this experiment burned small gas flames of methane and ethylene, sometimes diluted with nitrogen, inside a gentle surrounding stream of air. It compared very smoky flames (full of soot, tiny carbon particles) and weak flames close to going out with flames on Earth. The measurements are meant to test computer models of how flames burn and extinguish. [1, 2, 5, 6]

**For researchers.** Lifted, axially symmetric coflow laminar diffusion flames of methane and ethylene were studied in the ACME chamber insert of the CIR on the ISS. The fuel was diluted with nitrogen and issued into an air coflow. Injection velocity and fuel dilution were varied, spanning pure-fuel sooting flames to highly dilute flames near extinction, and the results were compared with normal gravity. Diagnostics included OH* and CH* chemiluminescence imaging for flame shape and lift-off height. Thin-filament pyrometry measured gas temperature in soot-free regions. Soot luminosity gave soot temperatures, and laser extinction gave soot volume fractions. The data are intended as benchmarks for verifying chemical kinetic and soot submodels. [1, 2, 5, 6, 7, 13, 14]

| Criterion | Score | Reason |
|---|---|---|
| fire_safety_directness | 2 | Its purpose is combustion science: benchmark data on sooting and near-extinction gaseous diffusion flames for model validation. The passages state that understanding flame extinction is critical to fire suppression and that the dilute-flame results have implications for fire safety in space. [1, 2, 6] |
| habitat_relevance | 1.50 | Mean of the four habitat scores (2, 2, 1, 1) |
| predictive_modeling_data | 2 | The experiment provided high-fidelity quantitative measurements with carefully measured flow boundary conditions, described as a testbed for verifying computational models. The outcomes, however, must be extracted from flame imagery and are reported in papers; no per-test matrix is described in the passages. [1, 6, 7] |
| controls_and_equipment | 1 | The passages state only a general link: understanding diffusion-flame extinction is critical to fire suppression, and the results carry implications for fire safety in space. No specific detection, suppression or material-screening hardware or standard is named for CLD Flame. [2, 6] |
| earth_applications | 2 | The passages name specific areas of benefit without a concrete product or standard: practical combustion devices, engine efficiency, fire suppression, turbulent combustion, ignition and flame stability, and soot's health and climate effects. [2, 5, 6] |

| Habitat | Score | Reason |
|---|---|---|
| Spacecraft | 2 | The flames burned in microgravity in an air coflow, and the soot and extinction behavior studied is relevant to spacecraft fires. The fuels were gaseous jet flames rather than cabin materials, so application needs extrapolation. [5, 6, 7] |
| Space station | 2 | The tests were conducted on the ISS in microgravity with an air coflow, and they studied soot production and near-extinction dilute flames. Extrapolation from gas-jet flames to station fire scenarios is required. [1, 5, 6, 7] |
| Moon base | 1 | No tests at elevated oxygen, reduced pressure or simulated partial gravity are reported; the flames burned in an air coflow. The microgravity versus normal-gravity comparisons can only bound partial-gravity behavior. [5, 6, 7] |
| Pressurized rover | 1 | No tests at elevated oxygen, reduced pressure or simulated partial gravity are reported for CLD Flame. Only the microgravity and normal-gravity comparisons give indirect bounds. [5, 6, 7] |

**Contributions to the challenge objectives**

- Identify relevant: A fundamental gaseous-flame study with stated implications for fire safety in space and for fire suppression, through its characterization of sooting flames and dilute flames near extinction in microgravity. [2, 6]
- Predictive modeling: It provides benchmark measurements of flame shape, lift-off height, temperatures, extinction limits and soot volume fraction under varied velocity and fuel dilution. These are intended to verify chemical kinetic and soot submodels, with carefully measured flow boundary conditions. [1, 2, 5, 7]
- Controls equipment: Only a general link is stated: understanding the factors that affect diffusion-flame extinction is described as critical to fire suppression. No specific equipment is informed. [2]
- Earth applications: The passages point to practical diffusion-flame combustion devices, engine efficiency, turbulent combustion, ignition and flame stability, and to improved models of soot formation, which they link to soot's health and climate effects. [2, 5, 6]

**Fire safety pillars**

- Suppression: The investigation characterizes extinction limits of dilute diffusion flames, and the passages state that understanding the factors affecting flame extinction is critical in the suppression of fires. [1, 2]

**Profile**

| Field | Value |
|---|---|
| Fuel type | gas [1, 5] |
| Hardware | Combustion Integrated Rack (CIR) with the modular ACME hardware: a chamber insert, a high-definition color camera and an avionics package. CLD Flame uses a normal coflow (gas-jet with coaxial air flow) burner. [1, 8, 9, 18] |
| Flight platform | International Space Station (ISS); managing center Glenn Research Center (GRC). [1] |
| Dates | Investigation start date 10-01-2006; end date 05-31-2022. PSI release date 15-Sep-2023. [1, 3] |
| Fuels | Methane and ethylene, ranging from pure fuel (sooting) to fuel diluted with nitrogen (inert), burning in an air coflow. [1, 5, 6] |
| Sample shape size | Lifted, axially symmetric non-premixed coflow jet flames from a coflow burner. Burner dimensions are not stated in the corpus. [5, 7, 8, 18] |
| Oxygen | Air coflow as oxidizer; no oxygen concentration values or variation are stated. [5] |
| Pressure | Test pressure values are not stated in the corpus. ACME experiments are constant volume (chamber free volume about 90 liters), with burner flows constrained to limit the pressure rise. [17] |
| Airflow | Air coflow around the fuel jet, with fuel injection velocity varied; numerical velocity values are not stated in the corpus. [1, 5] |
| Variables | Fuel injection velocity. [1, 5]; Fuel dilution with nitrogen, from pure-fuel sooting flames to highly dilute flames near extinction. [1, 5, 6]; Fuel: methane or ethylene. [1, 5]; Gravity level: microgravity results compared with normal-gravity counterparts. [6, 7] |
| Constants | Air coflow oxidizer. [5]; Lifted flames used as the basis of the research to avoid flame dependence on heat loss to the burner. [5]; ACME constant-volume chamber (about 90 liters free volume); tests typically 0.5-2 minutes. [17] |
| Sensors | ACME 12-bit high-definition digital color camera (up to 30 frames per second at 1360×1024) with a filter assembly: clear, BG7 Schott glass for color-ratio pyrometry and soot volume fraction, 430-nm bandpass for CH*, and 450-nm bandpass for soot-emission subtraction. [11, 12]; CIR Low-Light-Level Ultraviolet (LLL-UV) intensified camera with a 310-nm bandpass filter for OH* imaging (512×512, 30 fps). [12]; High-Bit Depth Multispectral (HiBMs) cameras: one with a Liquid-Crystal Tunable Filter for pyrometry, and one paired with CIR laser-diode illumination for soot extinction. [13, 14]; Thin Filament Pyrometry array of 5 silicon carbide (SiC) fibers, translatable along the flame axis. [13, 14]; ACME-wide instrumentation: thermopile radiometers, three PMTs (OH* and CH* filtered), burner surface thermocouple, chamber pressure, CIR gas chromatograph and SAMS-II accelerometers. [10, 15, 16] |
| Measurements | Flame shape and lift-off height from OH* and CH* chemiluminescence as extinction limits are approached. [1, 2]; Extinction limits of dilute flames. [1]; Gas temperatures in soot-free regions by thin-filament pyrometry. [1, 2]; Soot luminosity, soot temperatures and soot volume fractions (soot luminosity and laser extinction). [1, 2] |

**Data for modeling** (needs extraction): The experiment provided high-fidelity quantitative measurements of axially symmetric non-premixed flames over a wide range of flow conditions, with carefully measured flow boundary conditions, intended as a testbed for verifying kinetic and soot models. Outcomes such as temperature and soot concentration must be derived from flame imagery or taken from the listed publications. [1, 2, 3, 6, 7]

**Key findings**

- Sooty flames are taller, wider, cooler and far sootier in microgravity than in normal gravity. [6, 7]
- Soot volume fraction measurements indicate that microgravity flames contain five to eight times more soot than equivalent normal-gravity flames. [7]
- For highly diluted weak flames, microgravity flames are more stable than their normal-gravity counterparts. Dilution limits are extended, allowing lifted flames at lower fuel concentrations than in normal gravity. [6, 7]
- With nitrogen dilution the soot disappears and the flame lifts off as a faint blue cone. With further dilution it becomes a flat disk and finally extinguishes. [6]

**Limitations**

- The corpus holds only the PSI summary card, the PSI record and an ACME fact sheet partly written before flight; none of the investigation's own papers or data files are included. [1, 3, 4]
- Numerical test conditions (injection and coflow velocities, dilution levels, burner dimensions, pressure) are not stated in the passages. [1, 5, 17]
- The investigation studied gaseous jet flames in air coflow, not solid material flammability. No elevated-oxygen, reduced-pressure or partial-gravity tests are reported, which limits direct application to Moon base and rover atmospheres. [1, 5]

**Review flags**

- `over_word_limit`: summary.plain has 62 words; the prompt asks for at most 60

**Sources**

1. "Advanced Combustion via Microgravity Experiments / Coflow Laminar Diffusion Flame — investigation summary". ACME CLD Flame (PSI-21). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-21>
2. "Advanced Combustion via Microgravity Experiments / Coflow Laminar Diffusion Flame — investigation summary". ACME CLD Flame (PSI-21). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-21>
3. "Advanced Combustion via Microgravity Experiments / Coflow Laminar Diffusion Flame — PSI record". ACME CLD Flame (PSI-21). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-21>
4. "Advanced Combustion via Microgravity Experiments (ACME)", p. 1. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>
5. "Advanced Combustion via Microgravity Experiments (ACME)", p. 2. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>
6. "Advanced Combustion via Microgravity Experiments (ACME)", p. 3. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>
7. "Advanced Combustion via Microgravity Experiments (ACME)", p. 3. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>
8. "Advanced Combustion via Microgravity Experiments (ACME)", p. 5. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>
9. "Advanced Combustion via Microgravity Experiments (ACME)", p. 8. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>
10. "Advanced Combustion via Microgravity Experiments (ACME)", p. 10. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>
11. "Advanced Combustion via Microgravity Experiments (ACME)", p. 11. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>
12. "Advanced Combustion via Microgravity Experiments (ACME)", p. 13. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>
13. "Advanced Combustion via Microgravity Experiments (ACME)", p. 15. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>
14. "Advanced Combustion via Microgravity Experiments (ACME)", p. 15. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>
15. "Advanced Combustion via Microgravity Experiments (ACME)", p. 16. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>
16. "Advanced Combustion via Microgravity Experiments (ACME)", p. 18. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>
17. "Advanced Combustion via Microgravity Experiments (ACME)", p. 18. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>
18. Gokoglu, Dietrich, Stocker, Ferkul, Olson, Hicks (2015), "A Researcher's Guide to: Combustion Science (Combustion in Reduced Gravity), NP-2015-10-034-JSC", p. 44. <https://www.nasa.gov/wp-content/uploads/2016/05/np-2015-10-034-jsc_combustion_in_reduced_gravity-iss-mini-book-011116-508.pdf>

<a id="rank-19-psi-106"></a>
### 19. SLICE (PSI-106): Structure and Liftoff In Combustion Experiment

[PSI investigation page](https://psi.nasa.gov/physci/repo/data/investigations/PSI-106) · Tier 3 · Total 56.7

Evidence: own metadata 1 doc / 2 chunks; linked factsheet 1 doc / 4 chunks; pages no; retrieval hybrid.

**For students.** SLICE burned small gas flames of methane and ethylene, some mixed with nitrogen, inside a glovebox on the International Space Station. A gentle stream of air flowed around each flame and was sped up until the flame lifted off the burner tip. Cameras recorded how flames anchor and detach, so the results can be compared with computer models of flames. [1, 5, 6]

**For researchers.** Laminar coflow diffusion (non-premixed) flames of methane, ethylene and nitrogen-diluted mixtures of each, burning in a coflow of air. Tests ran in the SPICE fan-driven flow duct in the ISS Microgravity Science Glovebox, with exchangeable burner tubes and nozzles. Flames were manually ignited. In liftoff tests the fuel flow was fixed and the air velocity was raised incrementally until the flame detached from the nozzle. Objectives covered flame-base structure from attached to lifted conditions, liftoff velocity limits versus fuel and burner diameter, effects of N2 dilution on soot and stability, microgravity effects on flame length and radiative heat loss, and model validation. Measurements comprised more than 4,000 high-resolution still images across 13 testing experiments, plus video, with flow-rate and temperature sensor data overlaid. [1, 5, 6]

| Criterion | Score | Reason |
|---|---|---|
| fire_safety_directness | 2 | SLICE is combustion science on the structure and liftoff of laminar diffusion flames. The passages state that flame attachment to a burner or condensed-fuel surface is of essential importance to fire safety, and they list soot formation and fire-safety insights among its impacts. [1, 2, 4] |
| habitat_relevance | 1.50 | Mean of the four habitat scores (2, 2, 1, 1) |
| predictive_modeling_data | 2 | More than 4,000 high-resolution images with overlaid flow-rate and temperature sensor data were captured across 13 testing experiments, and the investigation explicitly aims to validate numerical models. Outcomes such as flame structure and liftoff limits must still be extracted from the imagery or the listed papers. [1, 3, 4] |
| controls_and_equipment | 1 | The passages state only a general benefit, insights into flame stability and behavior that enhance fire safety. They name no link to detection, suppression or material-selection hardware or standards. [2] |
| earth_applications | 2 | The passages name specific areas of benefit: cleaner, more efficient engines and industrial burners, low-emission combustion systems, and more efficient combustion technologies through improved models. They give no concrete product or standard. [2, 4] |

| Habitat | Score | Reason |
|---|---|---|
| Spacecraft | 2 | Flames were tested in microgravity in a fan-driven coflow of air whose velocity was varied, and flame attachment and stability matter to fire safety. However, the flames were gas-jet burner flames rather than burning cabin materials, and no airflow values are stated, so applying the results requires extrapolation. [1, 4, 6] |
| Space station | 2 | The tests were conducted on the ISS in a forced coflow of air, and the passages tie flame attachment to fire safety. Extending the gas-jet results to station material fires requires extrapolation. [1, 4, 5, 6] |
| Moon base | 1 | Only flames burning in a coflow of air are reported. The passages state no tests at elevated oxygen, reduced pressure or simulated partial gravity, so relevance is indirect and limited to bounding microgravity behavior. [5] |
| Pressurized rover | 1 | Only flames burning in a coflow of air are reported. The passages state no tests at elevated oxygen, reduced pressure or simulated partial gravity, so relevance to pressurized rovers is indirect. [5] |

**Contributions to the challenge objectives**

- Identify relevant: SLICE characterizes how laminar diffusion flames anchor and lift off in microgravity. The passages call flame attachment to a burner or condensed-fuel surface essential to fire safety, which makes SLICE a secondary, science-based contributor to fire safety. [2, 4]
- Predictive modeling: SLICE provides imaging of flame structure and liftoff, more than 4,000 high-resolution images across 13 testing experiments, intended for rigorous testing of numerical models with thermal radiation, soot formation and detailed chemical kinetics. Several combined computational and experimental papers are listed. [1, 3, 4]
- Controls equipment: _Not stated in the corpus._
- Earth applications: Improved flame models and soot understanding are stated to support more efficient, lower-emission combustion technologies, including cleaner engines and industrial burners. [2, 4]

**Fire safety pillars**

- None supported by the passages.

**Profile**

| Field | Value |
|---|---|
| Fuel type | gas [1, 5] |
| Hardware | SPICE hardware, itself based on the earlier ELF hardware, used without modification: a fan-driven flow duct, exchangeable burner tubes, and integrated sensors for flow rates and temperature, plus a high-resolution camera. SLICE added more fuel (gas bottles), recording media and minor elements such as new nozzle(s). Screen(s) to alter the coflow velocity profile were described as possible. [1, 5, 6] |
| Flight platform | International Space Station (ISS), inside the Microgravity Science Glovebox (MSG). Managed by Glenn Research Center (GRC). [1, 5] |
| Dates | Test dates not stated in the corpus. PSI data release date: 18-Sep-2024. [3] |
| Fuels | Methane, ethylene, and selected nitrogen dilutions of each fuel (nitrogen-diluted mixtures). The 40% ethylene flame image cited is a numerical simulation, not a test. [1, 4, 5] |
| Sample shape size | Gas-jet coflow burner with exchangeable burner tubes and nozzles. The three existing SPICE nozzles are all smaller than the nozzle planned for the CLD Flame experiment. Burner diameters are not stated in the corpus. [1, 6] |
| Oxygen | Flames burned in a coflow of air. No other oxygen concentrations are stated. [5] |
| Pressure | _Not stated in the corpus._ |
| Airflow | Controlled coflow air from a fan-driven duct. In liftoff tests, fuel flow was fixed and air velocity was increased incrementally until the flame detached and lifted off the nozzle. Numerical velocity values are not stated in the corpus. [1, 6] |
| Variables | Fuel: methane, ethylene and nitrogen dilutions of each [1, 5]; Burner (nozzle) diameter [1, 5]; Coflow air velocity / flow conditions, from attached through lifted flames [1, 5, 6]; Gravity level: microgravity results compared with normal gravity [1, 3] |
| Constants | Oxidizer: coflow of air [5]; Fuel flow held fixed while air velocity was increased in liftoff tests [6]; Same SPICE flow-duct hardware in the MSG for all tests [5] |
| Sensors | High-resolution still camera, with sensor data overlaid on the images [1]; Still and video imaging of flame structure [6]; Integrated sensors for flow rates and temperature [1] |
| Measurements | Flame structure and flame-base shape from more than 4,000 high-resolution images across 13 testing experiments [1, 6]; Liftoff velocity limits versus fuel and burner diameter [1, 5]; Soot formation (calibration tests for soot measurement were conducted) [1]; Flame length and radiative heat loss compared with normal gravity (stated objective) [1]; CH* concentration and flame heat release rate (topic of a listed publication) [3] |

**Data for modeling** (needs extraction): More than 4,000 high-resolution images with overlaid flow-rate and temperature data from 13 testing experiments are intended for validating numerical models of flame structure, soot and radiation. Liftoff limits and flame-structure metrics must be extracted from the imagery or from the listed publications. No tabulated test matrix appears in the corpus. [1, 3, 4]

**Key findings**

- Flames that look attached in images can be identified as lifted from the outward fuel-lean flare of the flame base. [6]

**Limitations**

- The corpus holds only the summary card, PSI record and a fact sheet. The results of the listed papers are not included, and burner diameters, dilution levels, flow velocities and liftoff limits are not stated numerically. [1, 3]
- Only gaseous fuel jet flames in air were tested. There are no solid materials and no tests at elevated oxygen, reduced pressure or partial gravity, which limits direct use for cabin material fires and lunar habitats. [1, 5]
- SLICE is described as a preliminary precursor to the ACME CLD Flame experiment, and its fire safety link is general rather than tied to detection, suppression or material screening. [2, 5]

**Review flags**

- `over_word_limit`: summary.technical has 123 words; the prompt asks for at most 120

**Sources**

1. "Structure and Liftoff In Combustion Experiment — investigation summary". SLICE (PSI-106). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-106>
2. "Structure and Liftoff In Combustion Experiment — investigation summary". SLICE (PSI-106). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-106>
3. "Structure and Liftoff In Combustion Experiment — PSI record". SLICE (PSI-106). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-106>
4. "Structure & Liftoff In Combustion Experiment (SLICE)", p. 1. <https://www.nasa.gov/wp-content/uploads/2025/07/structure-liftoff-in-combustion-experiment-slice.pdf>
5. "Structure & Liftoff In Combustion Experiment (SLICE)", p. 1. <https://www.nasa.gov/wp-content/uploads/2025/07/structure-liftoff-in-combustion-experiment-slice.pdf>
6. "Structure & Liftoff In Combustion Experiment (SLICE)", p. 2. <https://www.nasa.gov/wp-content/uploads/2025/07/structure-liftoff-in-combustion-experiment-slice.pdf>

<a id="rank-20-psi-142"></a>
### 20. PSI-142: Quantitative Studies of Cool Flame Transitions at Radiation / Stretch Extinction Using Counterflow Flames

[PSI investigation page](https://psi.nasa.gov/physci/repo/data/investigations/PSI-142) · Tier 3 · Total 53.3

Evidence: own metadata 1 doc / 2 chunks; linked none; pages no; retrieval hybrid.

**For students.** Cool flames are faint, low-temperature flames. This ground-based project, which built on space-station flame-extinguishment experiments, used computer simulations and lab flames formed where two opposing gas streams meet. It mapped when hot flames turn into cool flames and when each type can keep burning or goes out. Its mapped boundaries are called flammability and extinction limits. [1, 2]

**For researchers.** This ground investigation built on ISS FLEX data from PSI. It used ozone-sensitized counterflow flames in a one-dimensional geometry to map flammability and extinction limits of diffusional cool flames affected by radiation, diffusion and convection. It aimed to obtain extinction limit, flame temperature and species distribution data for validating kinetic and radiation models. Numerical work under FLEX flight conditions compared oxygen concentration effects on cool flame extinction using three schemes: (a) spark-assisted flame propagation of n-heptane/air, (b) one-dimensional freely-propagating DME flames solved with arc-length continuation, and (c) cool flame regimes and burning limits of DME/air at elevated pressure (up to 20 atm). The hypothesized variables are oxygen concentration, dilution, pressure, diffusion and convection. Diagnostics are not stated in the corpus. [1, 2]

| Criterion | Score | Reason |
|---|---|---|
| fire_safety_directness | 2 | The investigation is cool flame combustion science, listed under the Spacecraft Fire Safety sub-research area. It explicitly targets flammability limits and extinction limits of cool and hot flames. [1] |
| habitat_relevance | 1 | Mean of the four habitat scores (1, 1, 1, 1) |
| predictive_modeling_data | 2 | The objectives call for new quantitative data on extinction limit, flame temperature and species distribution for validating kinetic and radiation models. No test-level matrix is given in the passages; results appear only in listed publications. [1, 3] |
| controls_and_equipment | 1 | The only link to spacecraft safety is its classification under Spacecraft Fire Safety. No detection, suppression or material-screening hardware or standard is mentioned. [1] |
| earth_applications | 2 | The passages name real engines operating at 20-40 atm and combustion in highly turbulent flow fields as areas of relevance. No concrete product or method is named. [2] |

| Habitat | Score | Reason |
|---|---|---|
| Spacecraft | 1 | This is a ground-based counterflow and numerical study that aims to verify phenomena seen in ISS FLEX tests. Its relevance to microgravity cabin fires with ventilation is indirect. [1, 2] |
| Space station | 1 | It uses FLEX flight conditions and notes long residence times in microgravity. However, it tested no station-like ventilated microgravity conditions, so its relevance is indirect. [1, 2] |
| Moon base | 1 | Oxygen concentration effects on cool flame extinction were studied, but no oxygen values are given. Pressure was elevated (up to 20 atm) rather than reduced, and no partial-gravity tests were reported. [1, 2] |
| Pressurized rover | 1 | As for a Moon base, oxygen concentration is a studied variable without stated values. Pressures were elevated, not reduced, so relevance to rover atmospheres is indirect. [1, 2] |

**Contributions to the challenge objectives**

- Identify relevant: Classified under Spacecraft Fire Safety, it aims to build a flammability-limit diagram for diffusional cool flames. It also aims to link cool flame regions to the flammability and extinction limits of hot flames. [1]
- Predictive modeling: It targets quantitative extinction limit, flame temperature and species distribution data for validating kinetic and radiation models. It also provides simulations of cool and warm flame regimes and burning limits, including at up to 20 atm. [1, 2]
- Controls equipment: _Not stated in the corpus._
- Earth applications: Cool and warm flame regimes are described as relevant to high-pressure near-limit combustion in engines operating at 20-40 atm and to highly turbulent flow fields. [2]

**Fire safety pillars**

- Prevention: It seeks to define the flammability limits of cool flames and to relate them to hot flame flammability and extinction limits, which bound when combustion can persist. [1]

**Profile**

| Field | Value |
|---|---|
| Fuel type | gas [2] |
| Hardware | Principal Investigator Laboratory Hardware: ground-based ozone-sensitized counterflow flame experiments plus numerical modeling. [1, 2] |
| Flight platform | Ground Investigation; flight program / platform: Not Applicable. It uses FLEX flight experimental data from PSI. [1] |
| Dates | Investigation 08-01-2016 to 07-31-2021; PSI record released 18-Sep-2024. [1, 3] |
| Fuels | n-heptane/air mixture, dimethyl ether (DME) and DME/air mixtures in the modeling. Publication titles also refer to large n-alkanes and dimethyl ether/methane mixtures. [2, 3] |
| Sample shape size | Counterflow flames in a one-dimensional geometry; burner dimensions are not stated in the corpus. [1] |
| Oxygen | Oxygen concentration effects on cool flame extinction limits were studied under FLEX flight conditions; numerical O2 values are not stated in the corpus. [1, 2] |
| Pressure | Elevated pressure up to 20 atm in the DME/air simulations; other pressures are not stated in the corpus. [2] |
| Airflow | _Not stated in the corpus._ |
| Variables | Oxygen concentration, dilution, pressure, diffusion and convection transport processes (hypothesized factors in cool flame transition). [1]; Pressure up to 20 atm in DME/air cool flame regime simulations. [2]; Three numerical schemes: spark-assisted n-heptane/air propagation, 1-D freely-propagating DME flames with arc-length continuation, and elevated-pressure DME/air. [2] |
| Constants | One-dimensional counterflow geometry maintained. [1]; Modeling used the experimental conditions of FLEX flight. [2] |
| Sensors | _Not stated in the corpus._ |
| Measurements | Targeted: extinction limit, flame temperature and species distribution. [1]; Publication on quantitative measurements of HO2/H2O2 and intermediate species in low and intermediate temperature oxidation of dimethyl ether. [3] |

**Data for modeling** (needs extraction): The investigation aims to provide quantitative extinction limit, flame temperature and species distribution data for kinetic and radiation model validation. The corpus holds only the summary card and PSI record, so values must be extracted from the listed publications. [1, 3]

**Key findings**

- The warm flame has a double reaction zone structure and plays a critical role in the transition between cool flames and hot flames. [2]
- At elevated pressures, the flammable region of warm flames and cool flames expands due to increased low-temperature and intermediate-temperature reactivity with pressure. [2]

**Limitations**

- The corpus holds only the summary card and PSI record; no papers, test matrices or datasets are available for this investigation. [1, 3]
- This is a ground-based and numerical study with no microgravity or partial-gravity tests of its own; pressures studied were elevated (up to 20 atm), not reduced. [1, 2]
- The fuels are n-heptane and DME mixtures, not spacecraft solid materials, and no O2 values, flow speeds or diagnostics are stated. [1, 2]

**Review flags**

- `card_only`: The evidence is only the PSI card and the PSI record: no other document in the corpus

**Sources**

1. "Quantitative Studies of Cool Flame Transitions at Radiation / Stretch Extinction Using Counterflow Flames — investigation summary". PSI-142. <https://psi.nasa.gov/physci/repo/data/investigations/PSI-142>
2. "Quantitative Studies of Cool Flame Transitions at Radiation / Stretch Extinction Using Counterflow Flames — investigation summary". PSI-142. <https://psi.nasa.gov/physci/repo/data/investigations/PSI-142>
3. "Quantitative Studies of Cool Flame Transitions at Radiation / Stretch Extinction Using Counterflow Flames — PSI record". PSI-142. <https://psi.nasa.gov/physci/repo/data/investigations/PSI-142>

<a id="rank-21-psi-22"></a>
### 21. ACME E-FIELD Flames (PSI-22): Advanced Combustion via Microgravity Experiments Electric-Field Effects on Laminar Diffusion Flames

[PSI investigation page](https://psi.nasa.gov/physci/repo/data/investigations/PSI-22) · Tier 2 · Total 43.3

Evidence: own metadata 1 doc / 3 chunks; linked factsheet 1 doc / 20 chunks; pages no; retrieval hybrid.

**For students.** Aboard the International Space Station, this experiment burned methane and ethylene gas flames between a burner and a charged metal mesh. Flames contain ions (electrically charged molecules), so an electric field of up to 10 kV (kilovolts) can push them, changing flame shape, soot (tiny carbon particles) and stability. The goal is cleaner, controllable combustion rather than spacecraft fire safety. [1, 2, 6]

**For researchers.** Laminar non-premixed methane and ethylene flames, diluted with nitrogen from highly stable to near-extinction, burned on a gas-jet burner or the CLD Flame coflow burner (weak synthetic-air coflow) in the ACME insert of the CIR on the ISS. A circular copper mesh ~35 or ~50 mm downstream of the insulated burner, set between +10 and -10 kV, imposed fields of controlled polarity and strength. Fuel flow rate, coflow velocity, dilution and polarity were varied. Measurements: voltage-current curves (chemi-ion current from the voltage drop across a known resistor), flame response time to electric forcing, flame shape, luminosity and soot (high-resolution cameras), chemiluminescence and soot volume fraction (filtered spectral imaging), and radiant emission (thermopiles). [1, 2, 9, 10]

| Criterion | Score | Reason |
|---|---|---|
| fire_safety_directness | 1 | Its objectives are ion current, flame response to electric fields, soot formation and near-limit lifted flames, and the card states it is not conducted to serve any space applications. The fire safety link is only general, through ACME's secondary fire-prevention objective and the statement that electric fields can alter soot or flammability limits. [1, 2, 5, 6] |
| habitat_relevance | 1 | Mean of the four habitat scores (1, 1, 1, 1) |
| predictive_modeling_data | 2 | Quantitative measurements exist: voltage-current curves, ion current and response time as a function of field strength and fuel, soot volume fraction, chemiluminescence and thermopile radiant emission. The passages describe no ready test matrix of outcomes, so the values must be extracted from records, imagery or papers. [1, 2, 5] |
| controls_and_equipment | 1 | No passage ties E-FIELD Flames to detection, suppression or material-selection hardware. The only link is ACME's general secondary objective of fire prevention, especially for spacecraft. [2, 5] |
| earth_applications | 2 | The card names specific benefit areas: electric-field control of flames to reduce harmful pollutants and soot in practical terrestrial combustion, and more efficient combustion that reduces fuel consumption. It names no concrete product or standard. [2, 3] |

| Habitat | Score | Reason |
|---|---|---|
| Spacecraft | 1 | The tests were run in microgravity with gas-jet flames and a weak air coflow, but the phenomenon studied is electric-field control of flames. The passages give only an indirect link to cabin fire behavior. [1, 2] |
| Space station | 1 | Tests were conducted on the ISS in microgravity, but the investigation addresses ion-driven flame control rather than station fire hazards. The card states it does not serve space applications. [1, 2] |
| Moon base | 1 | The passages report no tests at elevated oxygen, reduced pressure or explicitly simulated partial gravity. The ion-driven convection that was imposed on microgravity flames is only indirectly relevant to buoyancy at lunar gravity. [1, 2] |
| Pressurized rover | 1 | As for the moon base, the passages report no elevated-oxygen, reduced-pressure or partial-gravity tests. The ion-driven convection studies give only indirect relevance. [1, 2] |

**Contributions to the challenge objectives**

- Identify relevant: This is a fundamental laminar gas-flame study of electric-field effects that its card says is not aimed at space applications. It belongs to ACME, whose secondary objective is fire prevention, especially for spacecraft, so its fire-safety relevance is low and indirect. [2, 5]
- Predictive modeling: It provides voltage-current curves, ion current, flame response time, soot volume fraction, chemiluminescence and radiant emission measured as functions of field strength, fuel and dilution. ACME aims to use such data to develop and verify computational models. [1, 2, 5]
- Controls equipment: _Not stated in the corpus._
- Earth applications: Electric-field flame control could reduce pollutant and soot emissions and improve combustion efficiency, lowering fuel consumption in practical terrestrial combustion. [2, 3]

**Fire safety pillars**

- Prevention: The ACME project lists fire prevention, especially for spacecraft, as a secondary objective, and the E-FIELD description notes that electric fields can alter soot or flammability limits. [5, 6]

**Profile**

| Field | Value |
|---|---|
| Fuel type | gas [1, 2] |
| Hardware | ACME modular hardware in the Combustion Integrated Rack (CIR). It used a gas-jet burner and the CLD Flame coflow burner, with a high-voltage supply and a crew-removable circular copper mesh electrode (settable between +10 and -10 kV) positioned ~35 or ~50 mm downstream of the insulated burner. [1, 2, 9] |
| Flight platform | International Space Station (ISS) [1] |
| Dates | Investigation start date 11-18-2016, end date 11-17-2020. PSI data release date 15-Apr-2019. [1, 4] |
| Fuels | Methane and ethylene, diluted with nitrogen to control flame strength. The coflow burner surrounds the fuel jet with a weak synthetic air flow. [2] |
| Sample shape size | Gas-jet burner producing a small, focused flame, and a coflow burner (same as CLD Flame) surrounding the fuel jet with an air coflow. The flat circular mesh electrode sits ~35 or ~50 mm downstream of the burner. Burner dimensions are not stated in the corpus. [1, 2, 9] |
| Oxygen | Weak synthetic air coflow (or no coflow for gas-jet tests). The oxygen concentration is not given numerically. [1, 2] |
| Pressure | ACME tests are constant-volume in a chamber with about 90 liters of free volume, with burner flows constrained to limit pressure rise. Chamber pressure is measured, but test pressure values are not stated in the corpus. [9, 10] |
| Airflow | Tests were run with and without a weak synthetic air coflow, and coflow velocity was varied. Numerical velocities are not stated in the corpus. [1, 2] |
| Variables | Electric field strength (high voltage up to 10 kV) and polarity [1, 2]; Fuel (methane or ethylene) and nitrogen dilution level, from highly stable to near-extinction flames [2]; Fuel flow rate and coflow velocity [2]; Burner configuration: gas-jet burner (no coflow) or coflow burner [1, 2]; Electrode mesh position, ~35 or ~50 mm downstream of the burner [9] |
| Constants | Microgravity aboard the ISS, in the CIR with ACME hardware [1]; Laminar, gaseous, non-premixed flames [5]; Constant-volume chamber of about 90 liters free volume; tests typically 0.5-2 minutes [10] |
| Sensors | High-resolution cameras for flame shape, luminosity and soot distribution, including ACME's 12-bit digital color camera (1360×1024, up to 30 fps) [2, 7]; Spectral imaging with filters for chemiluminescent emissions and soot volume fraction [2]; Thermopile detectors for flame radiant emissions [2, 8]; Ion current from the voltage drop across a known resistor between burner and electrode mesh (Ohm's Law) [10]; CIR gas chromatograph for pre- and post-test chamber atmosphere analysis (ACME-wide) [9] |
| Measurements | Voltage-current curves (chemi-ion current versus electric field strength) [1, 2]; Flame response time to electric forcing [1, 2]; Flame shape, luminosity and soot distribution [2]; Chemiluminescent emission and soot volume fraction [2]; Flame radiant emission [2] |

**Data for modeling** (needs extraction): Quantitative ion-current, voltage-current, response-time, soot volume fraction, chemiluminescence and radiant-emission data were recorded as functions of field strength, polarity, fuel, dilution and flow. The passages describe no processed per-test outcome table, so the values must be extracted from raw records, imagery or the listed publications. [1, 2, 4]

**Key findings**

- Voltage-current curves recorded in microgravity revealed ion-driven convection effects in the relationship between electric field strength and chemi-ion current. [2]

**Limitations**

- The corpus holds only the PSI summary card, the PSI record and an ACME-wide fact sheet for this investigation. No papers or data files are included, so burner dimensions, coflow velocities, pressures and quantitative results are not stated in the corpus. [1, 2, 4]
- The card states the research is not conducted to serve any space applications, so its contribution to spacecraft fire safety is indirect. [2]
- Only air-coflow or no-coflow tests in microgravity are reported. The passages report no tests at elevated oxygen, reduced pressure or explicitly simulated partial gravity, which limits direct use for Moon base or rover atmospheres. [1, 2]

**Sources**

1. "Advanced Combustion via Microgravity Experiments Electric-Field Effects on Laminar Diffusion Flames — investigation summary". ACME E-FIELD Flames (PSI-22). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-22>
2. "Advanced Combustion via Microgravity Experiments Electric-Field Effects on Laminar Diffusion Flames — investigation summary". ACME E-FIELD Flames (PSI-22). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-22>
3. "Advanced Combustion via Microgravity Experiments Electric-Field Effects on Laminar Diffusion Flames — investigation summary". ACME E-FIELD Flames (PSI-22). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-22>
4. "Advanced Combustion via Microgravity Experiments Electric-Field Effects on Laminar Diffusion Flames — PSI record". ACME E-FIELD Flames (PSI-22). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-22>
5. "Advanced Combustion via Microgravity Experiments (ACME)", p. 1. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>
6. "Advanced Combustion via Microgravity Experiments (ACME)", p. 3. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>
7. "Advanced Combustion via Microgravity Experiments (ACME)", p. 11. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>
8. "Advanced Combustion via Microgravity Experiments (ACME)", p. 16. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>
9. "Advanced Combustion via Microgravity Experiments (ACME)", p. 18. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>
10. "Advanced Combustion via Microgravity Experiments (ACME)", p. 18. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>

<a id="rank-22-psi-159"></a>
### 22. ACME CFI-G (PSI-159): Advanced Combustion via Microgravity Experiments / Cool Flames Investigation with Gases

[PSI investigation page](https://psi.nasa.gov/physci/repo/data/investigations/PSI-159) · Tier 2 · Total 43.3

Evidence: own metadata 1 doc / 2 chunks; linked factsheet 1 doc / 20 chunks; pages no; retrieval hybrid.

**For students.** On the International Space Station, this experiment fed propane, n-butane and n-pentane gas through a porous ball-shaped burner to create steady 'cool flames'. These are weak flames that peak at 500 – 1000 K, far cooler than ordinary flames. Without gravity the flame stays spherical. The main goal is better chemistry models for engines. The link to fire safety is indirect. [1, 2, 6]

**For researchers.** ACME CFI-G sought quasi-steady spherical cool diffusion flames (peak temperatures 500 – 1000 K) on a porous spherical burner, using ACME hardware in the CIR aboard the ISS. Fuels were the gases propane, n-butane and n-pentane, burned as normal and inverse flames. Tests spanned a range of reactant dilutions, Zst, Tad, fluent flow rates and pressures. The objectives were to determine the conditions for cool diffusion flames, extinction at reduced flow and transition to hot flames, and to validate CFD and a chemical kinetics mechanism against the ISS measurements. Flames were observed with cameras, radiometers, photomultiplier tubes and thermocouples. Specific O2 concentrations, pressures and a test matrix are not stated in the corpus. [1, 2, 6, 10, 11, 12]

| Criterion | Score | Reason |
|---|---|---|
| fire_safety_directness | 1 | CFI-G is fundamental cool-flame kinetics research motivated by engine efficiency. Its only link to fire is implied, through flame existence and extinction limits. ACME lists spacecraft fire prevention only as a secondary project goal, and the fact sheet says BRE, unlike the other ACME experiments, is the one focused on fire prevention. [1, 2, 4, 5, 6] |
| habitat_relevance | 1 | Mean of the four habitat scores (1, 1, 1, 1) |
| predictive_modeling_data | 2 | Quantitative measurements (cameras, radiometers, PMTs, thermocouples) were collected and are explicitly intended to test CFD predictions and cool flame kinetics mechanisms. No test-level matrix pairing conditions with outcomes is given in the passages. [1, 2, 6] |
| controls_and_equipment | 1 | No link to detection, suppression or material-selection hardware is stated for CFI-G. Only the ACME project's general secondary objective of fire prevention, especially for spacecraft, applies. [4, 5] |
| earth_applications | 2 | The passages name specific benefit areas: cleaner, more efficient internal combustion engines, ultra-lean combustion, and understanding of fuel octane and cetane numbers. No concrete product or standard is named. [2, 6, 7] |

| Habitat | Score | Reason |
|---|---|---|
| Spacecraft | 1 | Tests were in ISS microgravity in a constant-volume chamber, but the phenomenon studied (gaseous cool diffusion flames for engine kinetics) has only indirect relevance to cabin fires. [1, 6, 13] |
| Space station | 1 | The flames were burned aboard the ISS in microgravity, but the passages do not connect cool-flame behavior to station fire scenarios. Relevance is indirect. [1, 6] |
| Moon base | 1 | A range of pressures and reactant dilutions was planned, but no elevated-O2, reduced-pressure or partial-gravity test values are reported in the passages. Relevance is indirect. [1, 2] |
| Pressurized rover | 1 | No tests at 30 % O2 or more, at reduced pressure, or in simulated partial gravity are reported. Cool-flame kinetics bear only indirectly on pressurized-rover fire safety. [1, 2] |

**Contributions to the challenge objectives**

- Identify relevant: Provides microgravity data on gaseous cool diffusion flames, including the conditions for their occurrence and extinction. This is fundamental limit behavior, with only indirect fire-safety relevance. [1, 6]
- Predictive modeling: ISS measurements are paired with advanced CFD simulations to identify or develop a chemical kinetics mechanism that agrees with the data, advancing cool flame kinetics models. [1, 2, 6]
- Controls equipment: Only the ACME project's general secondary objective of fire prevention, especially for spacecraft, applies. No CFI-G-specific link to fire safety equipment is stated. [4, 5]
- Earth applications: Better cool flame kinetics mechanisms could lead to cleaner, more efficient internal combustion engines and inform fuel octane and cetane understanding. [2, 6, 7]

**Fire safety pillars**

- Prevention: Only at project level: ACME lists fire prevention, especially for spacecraft, as a secondary objective, while CFI-G's own passages state no fire-prevention link. [4, 5]

**Profile**

| Field | Value |
|---|---|
| Fuel type | gas [1] |
| Hardware | ACME modular hardware in the Combustion Integrated Rack (CIR), with a porous spherical burner. The ACME chamber insert provides a high-definition color camera, an avionics package, mass flow controllers and a retracting resistively heated igniter. [1, 6, 8, 9] |
| Flight platform | International Space Station (ISS). Managed by Glenn Research Center (GRC), and selected for spaceflight by CASIS and NSF. [1, 6] |
| Dates | CFI-G test dates are not stated. The PSI data release date is 20-Nov-2025. The ACME fact sheet expected on-orbit testing to begin in 2017 (project level). [3, 4] |
| Fuels | Gaseous propane, n-butane and n-pentane. [1] |
| Sample shape size | Porous spherical burner producing spherical diffusion flames. Burner dimensions are not stated in the corpus. [1, 6] |
| Oxygen | _Not stated in the corpus._ |
| Pressure | A range of pressures was tested; values are not stated. ACME tests are constant volume, with a chamber free volume of about 90 liters. [1, 13] |
| Airflow | No external airflow; fluent (burner) flow rate was varied. ACME hardware limits fuel flow to 2 slpm (on a nitrogen basis) and allows up to 10 slpm for the oxidizer and nitrogen lines. [1, 9] |
| Variables | Fuel: propane, n-butane, n-pentane [1]; Normal versus inverse flame (convection direction) [1, 2]; Zst, Tad and reactant dilution [1]; Fluent flow rate (decrease toward extinction, increase toward hot-flame transition) [1]; Pressure [1] |
| Constants | Spherical porous burner in microgravity aboard the ISS [1, 6]; Constant-volume ACME chamber (about 90 liters free volume); tests typically 0.5-2 minutes (project level) [13] |
| Sensors | Broad suite of cameras, radiometers, photomultiplier tubes and thermocouples [2]; Three PMT modules (230-700 nm), with 310-nm and 430-nm bandpass filters for OH* and CH* and one with a neutral density filter, to detect quenching of dim flames [11, 12]; Thermopile radiometers (nominally 0.2-11 micron), including a wide-view radiometer intended for the spherical flame experiments [11]; Six far-field thermocouples for the spherical flame experiments, and a burner surface thermocouple [9, 10]; CIR gas chromatograph for pre- and post-test chamber atmosphere analysis, and SAMS-II acceleration measurements [12] |
| Measurements | Conditions for cool diffusion flame occurrence, extinction, and transition to hot flames [1]; Flame imaging, thermal radiation, OH*/CH* chemiluminescence, and far-field thermal field [2, 10, 11, 12]; Chamber pressure and chamber gas composition [12] |

**Data for modeling** (needs extraction): Quantitative flame measurements were collected expressly to test CFD predictions and cool flame kinetics mechanisms. The corpus holds no test matrix or processed outcomes, so data must be extracted from the PSI dataset or the cited papers. [1, 2, 3, 6]

**Key findings**

- _None stated in the corpus._

**Limitations**

- The corpus holds only the summary card, the PSI record and the ACME fact sheet for CFI-G. No papers or reports with results are included, so no findings can be reported. [1, 3]
- Numerical O2 concentrations, pressures, flow rates and burner size are not stated, which prevents direct comparison with lunar habitat atmospheres. [1, 2]
- The primary motivation is engine efficiency, and no direct fire-safety application of CFI-G is stated. [2, 5, 6]

**Review flags**

- `over_word_limit`: summary.plain has 61 words; the prompt asks for at most 60

**Sources**

1. "Advanced Combustion via Microgravity Experiments / Cool Flames Investigation with Gases — investigation summary". ACME CFI-G (PSI-159). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-159>
2. "Advanced Combustion via Microgravity Experiments / Cool Flames Investigation with Gases — investigation summary". ACME CFI-G (PSI-159). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-159>
3. "Advanced Combustion via Microgravity Experiments / Cool Flames Investigation with Gases — PSI record". ACME CFI-G (PSI-159). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-159>
4. "Advanced Combustion via Microgravity Experiments (ACME)", p. 1. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>
5. "Advanced Combustion via Microgravity Experiments (ACME)", p. 1. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>
6. "Advanced Combustion via Microgravity Experiments (ACME)", p. 6. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>
7. "Advanced Combustion via Microgravity Experiments (ACME)", p. 7. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>
8. "Advanced Combustion via Microgravity Experiments (ACME)", p. 8. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>
9. "Advanced Combustion via Microgravity Experiments (ACME)", p. 10. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>
10. "Advanced Combustion via Microgravity Experiments (ACME)", p. 15. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>
11. "Advanced Combustion via Microgravity Experiments (ACME)", p. 16. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>
12. "Advanced Combustion via Microgravity Experiments (ACME)", p. 18. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>
13. "Advanced Combustion via Microgravity Experiments (ACME)", p. 18. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>

<a id="rank-23-psi-23"></a>
### 23. ACME s-Flame (PSI-23): Advanced Combustion via Microgravity Experiments-Structure and Response of Spherical Diffusion Flames

[PSI investigation page](https://psi.nasa.gov/physci/repo/data/investigations/PSI-23) · Tier 3 · Total 43.3

Evidence: own metadata 1 doc / 3 chunks; linked factsheet 1 doc / 20 chunks; pages no; retrieval hybrid.

**For students.** On the International Space Station, this experiment burned hydrogen, methane and ethylene gas flowing out of a porous ball-shaped burner. Without gravity, this makes round flames. Researchers watched the flames grow, pulse and go out, including sooty (smoke-forming) ones, and compared what they saw with computer models of how fuels burn. [1, 2, 7]

**For researchers.** ACME s-Flame used a porous spherical burner with the ACME hardware in the CIR on the ISS to establish nominally one-dimensional spherical diffusion flames. The flames burned H2/CH4/diluent (soot-free) and C2H4/diluent (sooty) mixtures issued into an oxidizing environment, with nitrogen, helium and carbon dioxide diluents. Flames were ignited at non-steady conditions and allowed to transition toward extinction. The goals were to characterize transient structure (temperature, species), radiative and convective extinction limits (high and low system Damköhler numbers), and pulsating instabilities above a critical Lewis number. Planned synchronized measurements: spectrally resolved images, flame and burner temperatures, radiative flux, reactant flow rates, pressures and acceleration levels, for comparison with transient detailed-chemistry simulations that include radiation. Oxygen and pressure values are not stated. [1, 2, 3, 7]

| Criterion | Score | Reason |
|---|---|---|
| fire_safety_directness | 1 | s-Flame's stated purpose is fundamental diffusion-flame structure, extinction and instability science, and its own impacts cite only combustion engines and devices. The fire-safety link comes only from ACME's family-level secondary objective of fire prevention, while the fact sheet singles out BRE as the ACME experiment focused on fire prevention. [1, 3, 5, 6] |
| habitat_relevance | 1 | Mean of the four habitat scores (1, 1, 1, 1) |
| predictive_modeling_data | 2 | Synchronized quantitative measurements are described: images, flame and burner temperatures, radiative flux, flow rates, pressures and acceleration. They are explicitly intended for comparison with detailed numerical simulations, but no per-test outcome table is given in the passages. [2] |
| controls_and_equipment | 1 | Nothing ties s-Flame to detection, suppression or material-screening hardware. Only the general ACME secondary objective of fire prevention, especially for spacecraft, is stated. [5] |
| earth_applications | 2 | The card names combustion engines and devices (power, efficiency, pollutant emissions, reliability) as areas of benefit. The ACME fact sheet adds reduced combustor design time and cost, but no concrete product or standard is named. [3, 6] |

| Habitat | Score | Reason |
|---|---|---|
| Spacecraft | 1 | Microgravity gaseous spherical flames and their extinction limits are only indirectly relevant to cabin fires. No materials, cabin ventilation flows or fire-safety application are stated for s-Flame. [1, 7] |
| Space station | 1 | The tests ran on the ISS in microgravity, but they address fundamental gaseous diffusion-flame structure and extinction rather than station fire scenarios, so relevance is indirect. [1, 7] |
| Moon base | 1 | No elevated-oxygen, reduced-pressure or partial-gravity tests are reported for s-Flame. Its microgravity extinction data could only indirectly bound lunar conditions. [1, 7] |
| Pressurized rover | 1 | No elevated-oxygen, reduced-pressure or partial-gravity tests are reported for s-Flame, so relevance to pressurized rovers is indirect. [1, 7] |

**Contributions to the challenge objectives**

- Identify relevant: s-Flame is a fundamental gaseous-flame investigation that determines radiative and convective extinction limits of soot-free and sooty spherical diffusion flames. It belongs to ACME, whose secondary objective is fire prevention, especially for spacecraft. [1, 5, 7]
- Predictive modeling: Measured flame structure, flame front velocities, and the conditions of extinction, instabilities and soot suppression limits are intended as a rigorous test of transient detailed chemical-kinetic, transport and radiation models. [1, 2]
- Controls equipment: Only a general relevance is stated, through ACME's secondary objective of fire prevention, especially for spacecraft. No specific detection, suppression or screening hardware is linked to s-Flame. [5]
- Earth applications: Better understanding of diffusion-flame dynamics and chemistry is stated to improve combustion engines and devices in power, efficiency, pollutant emissions and reliability. ACME's improved modeling capability could reduce combustor design time and cost. [3, 6]

**Fire safety pillars**

- Prevention: At the family level, ACME lists fire prevention, especially for spacecraft, as a secondary objective, and s-Flame contributes extinction-limit measurements. [5, 7]

**Profile**

| Field | Value |
|---|---|
| Fuel type | gas [1, 2] |
| Hardware | Combustion Integrated Rack (CIR) with the ACME modular hardware: a chamber insert, a high-definition color camera and an avionics package. Flames were produced on a porous spherical burner with a retracting, resistively heated igniter. [1, 2, 7, 8, 9] |
| Flight platform | International Space Station (ISS); managed by Glenn Research Center (GRC). [1] |
| Dates | Investigation start date 02-05-2015; end date 11-24-2019. The PSI record release date is 05-Apr-2018. [1, 4] |
| Fuels | Hydrogen and methane (H2/CH4/diluent mixtures) for soot-free flames, and ethylene (C2H4/diluent) for sooty flames. Diluents are nitrogen and helium to adjust mixture diffusivities, and carbon dioxide to influence flame radiation. Inert diluents were used in both the fuel and the chamber atmosphere. [1, 2, 3, 7] |
| Sample shape size | Porous spherical burner producing a nominally spherical, one-dimensional flame. Burner dimensions are not stated in the corpus. [2, 7] |
| Oxygen | _Not stated in the corpus._ |
| Pressure | Chamber pressure value not stated. All ACME experiments are constant-volume, with about 90 liters of chamber free volume and burner flows generally constrained to limit the pressure rise. Chamber pressure is measured. [2, 15, 16] |
| Airflow | No ambient forced flow is stated. The flow is the fuel/diluent mixture issued from the spherical porous burner at different flow rates. The ACME maximum fuel flow is 2 slpm (on a nitrogen basis). [1, 2, 9] |
| Variables | H2/CH4/diluent ratios (soot-free) and C2H4/diluent ratios (sooty) [1]; Fuel/diluent flow rates [1]; Inert diluent type and placement (nitrogen, helium, carbon dioxide; in the fuel and the chamber atmosphere) [3, 7]; Fuel/diluent mixtures chosen to vary Zeldovich number and Damköhler number, above a critical Lewis number for instability tests [1] |
| Constants | Porous spherical burner geometry in microgravity on the ISS [1, 7]; Flames ignited at non-steady conditions and allowed to transition naturally toward extinction [7]; Constant-volume ACME chamber (about 90 liters free volume); tests typically 0.5-2 minutes [16] |
| Sensors | Spectrally resolved imaging; ACME digital color camera with BG7 and CH* (430-nm) filters; CIR LLL-UV camera for OH* (310 nm); HiBMs cameras [2, 10, 11, 12]; Flame and burner temperatures: burner surface thermocouple, six far-field thermocouples for the spherical flame experiments, and Thin Filament Pyrometry with SiC fibers [2, 9, 12, 13]; Radiometers (thermopile, nominally 0.2-11 micron), including a wide-view radiometer primarily for the spherical flame experiments [2, 14]; Photomultiplier tubes for OH* and CH* emission and the quenching of dim flames [14, 15]; Gas chromatograph, chamber pressure, burner internal pressure, mass flow controllers and SAMS-II acceleration [2, 9, 15] |
| Measurements | Transient flame structure (temperature and species distribution) [1]; Quasi-steady convective/chemical-kinetic and radiative/chemical-kinetic extinction limits [1, 7]; Existence, onset and nature (mode, frequency, amplitude) of pulsating instabilities [1]; Flame growth or flame front velocities, steady-state conditions and soot suppression limits [2]; System operating conditions: reactant flow rates, ambient temperatures, pressures and acceleration levels [2] |

**Data for modeling** (needs extraction): Synchronized images, temperatures, radiative flux and operating conditions are intended for comparison with transient detailed-chemistry, transport and radiation simulations. Outcomes such as extinction conditions must be extracted from the raw measurements, and no test matrix with results is given in the corpus. [2]

**Key findings**

- _None stated in the corpus._

**Limitations**

- The corpus holds only s-Flame's summary card and PSI record plus an ACME-wide fact sheet. No papers or data files with s-Flame results are included, so no findings can be reported. [1, 4, 5]
- Oxygen concentration, chamber pressure and burner size are not stated for s-Flame. No elevated-oxygen, reduced-pressure or partial-gravity tests are reported. [1, 7, 16]
- Gaseous fuels on a porous burner only. The fire-safety link is family-level (ACME's secondary fire-prevention objective), not an s-Flame objective. [2, 5, 6]

**Sources**

1. "Advanced Combustion via Microgravity Experiments-Structure and Response of Spherical Diffusion Flames — investigation summary". ACME s-Flame (PSI-23). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-23>
2. "Advanced Combustion via Microgravity Experiments-Structure and Response of Spherical Diffusion Flames — investigation summary". ACME s-Flame (PSI-23). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-23>
3. "Advanced Combustion via Microgravity Experiments-Structure and Response of Spherical Diffusion Flames — investigation summary". ACME s-Flame (PSI-23). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-23>
4. "Advanced Combustion via Microgravity Experiments-Structure and Response of Spherical Diffusion Flames — PSI record". ACME s-Flame (PSI-23). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-23>
5. "Advanced Combustion via Microgravity Experiments (ACME)", p. 1. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>
6. "Advanced Combustion via Microgravity Experiments (ACME)", p. 1. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>
7. "Advanced Combustion via Microgravity Experiments (ACME)", p. 5. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>
8. "Advanced Combustion via Microgravity Experiments (ACME)", p. 8. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>
9. "Advanced Combustion via Microgravity Experiments (ACME)", p. 10. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>
10. "Advanced Combustion via Microgravity Experiments (ACME)", p. 11. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>
11. "Advanced Combustion via Microgravity Experiments (ACME)", p. 13. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>
12. "Advanced Combustion via Microgravity Experiments (ACME)", p. 15. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>
13. "Advanced Combustion via Microgravity Experiments (ACME)", p. 15. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>
14. "Advanced Combustion via Microgravity Experiments (ACME)", p. 16. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>
15. "Advanced Combustion via Microgravity Experiments (ACME)", p. 18. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>
16. "Advanced Combustion via Microgravity Experiments (ACME)", p. 18. <https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf>

<a id="rank-24-psi-39"></a>
### 24. CFI (PSI-39): Cool Flames Investigation

[PSI investigation page](https://psi.nasa.gov/physci/repo/data/investigations/PSI-39) · Tier 3 · Total 43.3

Evidence: own metadata 1 doc / 2 chunks; linked none; pages no; retrieval hybrid.

**For students.** On the International Space Station, CFI burned tiny droplets of liquid fuels such as n-dodecane to study 'cool flames'. These are faint, low-temperature flames driven by different chemistry than ordinary fire. Researchers varied pressure, fuel mixture and helium dilution, and filmed the droplets and flames to learn how droplet size and pressure relate to when these flames go out. [1, 2]

**For researchers.** Isolated droplets of n-dodecane, n-dodecane/iso-dodecane mixtures and farnesane were burned in the MDCA within the CIR on the ISS. Droplets were suspended between hypodermic needles or tethered on silicon-carbide fibers and ignited by a retractable hot-wire igniter. Pressure is given as 0.25 atm to 5 atm in the objectives and 0.25 to 0.5 atm in the approach. Fuels were 'diluted with molecular oxygen, atomic nitrogen, and helium'; O2 fractions are not stated. Objectives cover low-temperature kinetics, helium dilution, droplet size–pressure–extinction relations and soot formation. Diagnostics were a black-and-white camera for droplet size, a UV camera for OH* emission and flame size, narrow-band and wide-band radiometers, and documentation cameras. [1, 2]

| Criterion | Score | Reason |
|---|---|---|
| fire_safety_directness | 1 | CFI is fundamental cool-flame droplet combustion research on low-temperature chemical kinetics. Its only stated fire-safety link is general: it will 'support the design of safer spacecraft systems by refining knowledge of combustion in microgravity environments'. [1, 2] |
| habitat_relevance | 1 | Mean of the four habitat scores (1, 1, 1, 1) |
| predictive_modeling_data | 2 | Quantitative imagery and radiometer data were collected (droplet size, OH* emission, flame size, flame radiation) and must be processed into outcomes. CFI is described as providing 'critical validation for complex chemical kinetic mechanisms'. [2] |
| controls_and_equipment | 1 | The passages state only a general contribution to 'the design of safer spacecraft systems'. They name no link to detectors, suppressants or material screening. [2] |
| earth_applications | 2 | The card names specific areas of benefit: new fuel development and selection, HCCI engine design, and how cool flame reactivity determines octane and cetane number in spark ignition and diesel engines. It names no concrete product or standard. [2] |

| Habitat | Score | Reason |
|---|---|---|
| Spacecraft | 1 | Droplet cool flames were tested in microgravity on the ISS, but no airflow is stated and the phenomenon relates only indirectly to cabin fire safety. [1, 2] |
| Space station | 1 | The tests were conducted aboard the ISS in microgravity. However, cool-flame droplet chemistry is only indirectly relevant to station fire scenarios, and no ventilation flow is reported. [1, 2] |
| Moon base | 1 | Pressures down to 0.25 atm were tested, but no elevated oxygen concentration or partial gravity is reported. The cool-flame droplet phenomenon is only indirectly relevant to habitat fires. [1] |
| Pressurized rover | 1 | Reduced pressure (from 0.25 atm) is reported, but oxygen fractions are not stated. The liquid-droplet cool-flame focus relates only indirectly to rover cabin fire safety. [1] |

**Contributions to the challenge objectives**

- Identify relevant: CFI is a microgravity liquid-droplet combustion study of cool flames, flame extinction and soot formation. Its stated relevance to crew fire safety is general. [1, 2]
- Predictive modeling: CFI targets critical parameters such as droplet extinction diameters. It is described as validating complex chemical kinetic mechanisms and helping develop new computational combustion models. [1, 2]
- Controls equipment: The card states only that CFI supports the design of safer spacecraft systems by refining knowledge of microgravity combustion. [2]
- Earth applications: Cool-flame understanding is stated to inform fuel and fuel-additive ignition, new fuel selection, HCCI engine design, and the link between cool flame reactivity and octane and cetane numbers. [2]

**Fire safety pillars**

- None supported by the passages.

**Profile**

| Field | Value |
|---|---|
| Fuel type | liquid [1, 2] |
| Hardware | Multi-User Droplet Combustion Apparatus (MDCA) in the Combustion Integrated Rack (CIR). Gas bottles and fuel syringes supply the chamber; droplets are held between hypodermic needles or tethered on silicon-carbide fibers; a hot-wire igniter is retracted after ignition. [1] |
| Flight platform | International Space Station (ISS); managed by Glenn Research Center (GRC). [1] |
| Dates | Investigation start 10-01-2020, end 10-20-2021. PSI data release 18-Sep-2024 (DOI 10.60555/m6pj-a914, CC0-1.0). [1, 3] |
| Fuels | n-dodecane, farnesane (spelled 'faresane' in the hypothesis), and mixtures of n-dodecane/iso-dodecane. [1, 2] |
| Sample shape size | Fuel droplets suspended between hypodermic needles or tethered using silicon-carbide fibers. Droplet sizes are not stated in the corpus. [1, 2] |
| Oxygen | Oxygen concentrations are not given. The card states fuels were 'diluted with molecular oxygen, atomic nitrogen, and helium' to study flame extinction and dynamics. [2] |
| Pressure | The objectives give pressures ranging from 0.25 atm to 5 atm, while the approach gives a chamber gas mixture ranging from 0.25 to 0.5 atm. [1] |
| Airflow | _Not stated in the corpus._ |
| Variables | Fuel composition: n-dodecane, n-dodecane/iso-dodecane mixtures, farnesane. [1, 2]; Ambient pressure (0.25 atm to 5 atm per objectives; 0.25 to 0.5 atm per approach). [1]; Helium dilution of the atmosphere. [1, 2]; Droplet size, in relation to pressure and flame extinction. [1]; Droplet deployment: suspended between hypodermic needles or tethered on silicon-carbide fibers. [1, 2] |
| Constants | Microgravity aboard the ISS using the MDCA in the CIR. [1]; Hot-wire ignition near the droplet, with the wire retracted after ignition. [1, 2] |
| Sensors | Black-and-white camera for droplet size measurements. [2]; UV camera capturing OH* radical emissions and flame size. [2]; Other high resolution cameras for monitoring and documentation. [2]; Narrow-band and wide-band radiometers for flame radiation. [2] |
| Measurements | Droplet size history. [2]; OH* radical emission and flame size. [2]; Flame radiation. [2]; Droplet extinction diameters and flame dynamics (targeted parameters). [1] |

**Data for modeling** (needs extraction): The PSI dataset (DOI 10.60555/m6pj-a914) holds measurements from black-and-white and UV cameras and narrow-band and wide-band radiometers. Droplet size, flame size, OH* emission and radiation must be extracted from these channels. The data is described as intended to validate complex chemical kinetic mechanisms. No test matrix pairing conditions with extinction outcomes appears in the passages. [2, 3]

**Key findings**

- _None stated in the corpus._

**Limitations**

- The corpus holds only the PSI summary card and PSI record for CFI. No test matrix, per-test conditions or results are available, so findings cannot be reported; the listed publications are not included as passages. [1, 2, 3]
- The stated pressure range is inconsistent (0.25 atm to 5 atm in the objectives vs 0.25 to 0.5 atm in the approach). Oxygen concentrations, droplet sizes and airflow are not stated. [1, 2]
- CFI studies cool flames of liquid fuel droplets for low-temperature kinetics and engine applications. Its relevance to cabin material fires, detection or suppression is general and not demonstrated in the passages. [1, 2]

**Review flags**

- `card_only`: The evidence is only the PSI card and the PSI record: no other document in the corpus

**Sources**

1. "Cool Flames Investigation — investigation summary". CFI (PSI-39). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-39>
2. "Cool Flames Investigation — investigation summary". CFI (PSI-39). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-39>
3. "Cool Flames Investigation — PSI record". CFI (PSI-39). <https://psi.nasa.gov/physci/repo/data/investigations/PSI-39>

## Comparison by hardware

FLEX (PSI-69) leads with 96.7. Its records are the only ones with per-test data (272 test sheets) rated ready for modeling. It maps droplet flammability limits against oxygen, pressure and CO2 or helium suppressants, which serves both prevention and suppression. Eight investigations share 86.7. Six cover solid-material flame spread and extinction (BASS PSI-26, BASS-II PSI-25, Saffire-I to -III PSI-98, PSI-99, PSI-100) or smoke detection (SAME PSI-102, SAME-R PSI-101). The eighth, ACME-BRE (PSI-20), is the one record stating Moon-base-like atmospheres (34% O2 at 8.2 psia). Gaseous-flame and cool-flame studies score lowest (43.3), for example s-Flame (PSI-23), CFI-G (PSI-159) and CFI (PSI-39). Their records state fundamental or engine motivations rather than fire safety. (PSI-69, PSI-26, PSI-25, PSI-98, PSI-99, PSI-100, PSI-102, PSI-101, PSI-20, PSI-23, PSI-159, PSI-39)

### ACME gaseous-flame experiments

Hardware: Modular ACME hardware (chamber insert, high-definition color camera, avionics package) in the Combustion Integrated Rack (CIR) on the ISS. Investigations: PSI-20, PSI-10, PSI-21, PSI-22, PSI-159, PSI-23.

Similarities:

- All six burn gaseous fuels in the same constant-volume ACME chamber of about 90 liters of free volume, so chamber pressure rises during a test. None imposes a chamber-wide airflow. Any flow comes from the burner itself: a porous surface, a fuel jet, or a coaxial (coflow) air stream around the jet. (PSI-20, PSI-10, PSI-21, PSI-22, PSI-159, PSI-23)
- Methane and ethylene, usually diluted with nitrogen, are the shared fuels: BRE uses CH4/N2 and C2H4/N2, and Flame Design, CLD Flame and E-FIELD use methane and ethylene. s-Flame uses H2/CH4 and C2H4 mixtures. CFI-G is the exception, burning propane, n-butane and n-pentane. (PSI-20, PSI-10, PSI-21, PSI-22, PSI-23, PSI-159)
- Extinction is a common target. BRE reduces fuel flow until the flame goes out. Flame Design and s-Flame seek radiative versus kinetic or convective extinction limits. CLD Flame and E-FIELD dilute flames down to near-extinction. CFI-G lowers flow toward extinction of cool flames. (PSI-20, PSI-10, PSI-23, PSI-21, PSI-22, PSI-159)
- Burners are shared within the family. Flame Design, CFI-G and s-Flame use a porous spherical burner, which gives nominally one-dimensional spherical flames. E-FIELD reuses the CLD Flame coflow burner, and Flame Design lists coflow as an alternative configuration. (PSI-10, PSI-159, PSI-23, PSI-21, PSI-22)
- Except for BRE, the records give no numerical oxygen concentrations or test pressures. Pressure is listed as a variable for Flame Design and CFI-G but without values. (PSI-10, PSI-21, PSI-22, PSI-159, PSI-23)

Differences:

- ACME-BRE alone emulates solid materials such as PMMA and Nylon. Fuel mixtures were chosen to match heat of combustion, smoke point and heat of gasification, and they were fed through a flat porous burner of 25 or 50 mm diameter carrying heat flux transducers and a surface thermocouple. It alone states three atmospheres: 21% O2 at 14.7 psia, 26.5% at 10.2 psia and 34% at 8.2 psia. Its record reports sustained burning without airflow only in the elevated-oxygen atmospheres. (PSI-20)
- ACME Flame Design varies the stoichiometric mixture fraction (Zst, a measure of how the fuel and oxidizer streams are diluted relative to each other) in oxygen-enriched atmospheres. It also varies the inert diluent (N2 or CO2), pressure, and normal versus inverse configurations (an inverse flame issues oxidizer from the burner). It targets soot-inception and extinction limits and tests the hypothesis that spherical flames go out when peak temperature first drops below 1130 K. (PSI-10)
- ACME CLD Flame studies lifted coflow jet flames, varying fuel injection velocity and nitrogen dilution from sooting to near-extinction flames, with normal-gravity comparisons. It is the only ACME record here with findings: microgravity sooty flames held five to eight times more soot, and dilute microgravity flames stayed stable at lower fuel concentrations. (PSI-21)
- ACME E-FIELD Flames adds an electric field. A copper mesh electrode placed about 35 or 50 mm downstream was set between +10 and -10 kV, and the investigation varied field strength, polarity and electrode position while measuring voltage-current curves of the flame's ions. Its card states the research is not aimed at space applications. (PSI-22)
- ACME CFI-G targets cool diffusion flames (peak temperatures of 500 to 1000 K) of propane, n-butane and n-pentane. It studies their extinction at reduced flow and their transition to hot flames at increased flow. Engine efficiency is its stated motivation. (PSI-159)
- ACME s-Flame varies diluent type and placement (nitrogen and helium to change diffusivity, CO2 to change radiation) in both the fuel and the chamber. It compares soot-free H2/CH4 flames with sooty C2H4 flames and studies pulsating instabilities above a critical Lewis number (the ratio of heat to mass diffusivity). (PSI-23)

### MDCA droplet combustion

Hardware: Multi-user Droplet Combustion Apparatus (MDCA) in the Combustion Integrated Rack (CIR) on the ISS. Investigations: PSI-69, PSI-68, PSI-39.

Similarities:

- All three burn isolated liquid-fuel droplets, deployed free or held on needles or fibers, ignited by a retractable igniter, mostly in a still (quiescent) ambient. (PSI-69, PSI-68, PSI-39)
- Ambient pressure is a test variable in all three, and all study extinction of the droplet flame. None reports partial-gravity tests. (PSI-69, PSI-68, PSI-39)

Differences:

- FLEX burns methanol and heptane droplets of 2 to 5 mm in O2/N2 atmospheres with CO2 or helium suppressants. It aims to find the Limiting Oxygen Index (LOI, the lowest oxygen level that sustains burning) as a function of pressure and suppressant. Test sheets span 0.15 to 0.30 O2 and 0.70 to 3.05 atm. Per-test outputs are the initial diameter (D0), the burning-rate constant (kavg, mm2/s) and the extinction diameter (Dext, mm). (PSI-69)
- FLEX-2 moves to pure and bi-component surrogate fuels meant to mimic practical fuels, at 0.1 to 0.4 O2 mole fraction and 0.5 to 3.0 atm. It alone adds binary droplet arrays, varying the spacing between droplets, and translates tethered droplets at varied velocity and acceleration to impose a sub-buoyant flow. Its targets include soot-shell dynamics. (PSI-68)
- CFI burns n-dodecane, n-dodecane/iso-dodecane mixtures and farnesane, with helium dilution, to study cool flames and low-temperature chemistry. Its lower pressure bound of 0.25 atm is the lowest stated in the group, but its record gives conflicting ranges (0.25 to 5 atm versus 0.25 to 0.5 atm) and no oxygen fractions. (PSI-39)

### SPICE flow duct in the MSG

Hardware: Fan-driven flow duct built for SPICE, used inside the Microgravity Science Glovebox (MSG) on the ISS. Investigations: PSI-26, PSI-25, PSI-107, PSI-106.

Similarities:

- All four use the same small fan-driven wind tunnel, so imposed flow speed is a controlled variable in every one. Video and still cameras are common diagnostics, and none reports elevated-oxygen, reduced-pressure or partial-gravity tests. (PSI-26, PSI-25, PSI-107, PSI-106)
- The group splits by fuel. BASS and BASS-II burn solid samples with flow along the surface in concurrent (same direction as spread) or opposed directions. SPICE and SLICE burn gaseous jet flames from exchangeable nozzles in a coflow of air. (PSI-26, PSI-25, PSI-107, PSI-106)

Differences:

- BASS is the broadest materials survey: 41 samples and 89 test points. Materials were SIBAL cotton-fiberglass fabric, Nomex, Ultem, PMMA slabs and 1 and 2 cm spheres, wax-saturated fiberglass, and paraffin and Japan-wax candles. It alone adds a nozzle of nitrogen suppressant at 0 to 500 cc/min and varies ignition location on spheres. (PSI-26)
- BASS-II adds oxygen as a variable by lowering it below 21% through nitrogen vitiation (diluting the working volume with nitrogen). It burns acrylic films, sheets, rods and a large spherical section. Its record reports a thin-to-thick fuel transition formula and model spread rates higher than observed. (PSI-25)
- SPICE varies gaseous fuel (methane, ethylene, propane, propylene and mixtures), nozzle diameter (0.41, 0.76 and 1.6 mm), co-flow speed (5.4 to 65 cm/s) and fuel flow. The aim is to locate the smoke point, the onset of soot emission; more than 70 smoke points were reported. (PSI-107)
- SLICE burns methane, ethylene and their nitrogen dilutions. It holds fuel flow fixed and raises air velocity until the flame lifts off the nozzle, recording more than 4,000 still images over 13 testing experiments. Its record describes it as a precursor to ACME CLD Flame. (PSI-106, PSI-21)

### Saffire large-scale tests aboard Cygnus

Hardware: Saffire flow-duct enclosure (fans, flow straighteners, central sample card) in the Cygnus vehicle after it deberthed from the ISS. Investigations: PSI-98, PSI-99, PSI-100.

Similarities:

- All three burn samples on a card in the middle of a large fan-driven air duct, uncrewed, after Cygnus left the ISS. They share the same diagnostics: two cameras, thermocouples, two radiometers, solid-state sensors for pressure, CO2 and O2, and two anemometers. (PSI-98, PSI-99, PSI-100)
- All three share the objectives of measuring large-scale low-gravity fire growth rate and comparing low-gravity flammability limits with NASA's normal-gravity material screening test. No ambient O2 or pressure set-points and no measured findings appear in the records. (PSI-98, PSI-99, PSI-100)

Differences:

- Saffire-I burned a single large SIBAL fabric sheet, about 0.94 m by 0.4 m, at one air speed of 20 cm/s. (PSI-98)
- Saffire-II burned nine smaller samples, each 5 cm by 29 cm, of SIBAL, silicone, structure PMMA, flat PMMA and PMMA with Nomex. Air speed was 20 or 30 cm/s, concurrent or opposed depending on material. It is the only one of the three to vary material. (PSI-99)
- Saffire-III returned to SIBAL at a higher flow of 30 cm/s, concurrent or opposed. Its sample dimensions are not stated. (PSI-100)

### SAME smoke-detection hardware in the Glovebox

Hardware: Comparative Soot Diagnostic Hardware in the ISS Glovebox, with spacecraft smoke detectors and thermophoretic samplers. Investigations: PSI-102, PSI-101.

Similarities:

- Both heat spacecraft materials (Teflon, Kapton, silicone rubber, and cellulose or cotton) until they pyrolyze or smolder. They then measure the resulting smoke with thermophoretic sampling for electron-microscope (TEM) sizing and with ISS and Space Shuttle smoke detectors, and both compare un-aged and aged smoke. (PSI-102, PSI-101)
- Neither record states oxygen, pressure or flow-speed values, and neither reports measured particle sizes or detector responses. (PSI-102, PSI-101)

Differences:

- SAME varies igniter on-time (15 to 60 s) and determines 1-g conditions with the same mass loss, for comparison with flight. It tests the hypothesis that weaker mixing in microgravity yields larger smoke droplets at lower number density, which could affect alarms. (PSI-102)
- SAME-R (66 test points, Expedition 24) adds cotton and Pyrell, a fire-retardant foam that its record says replaced SAME's DBP samples. It extends tests to higher heating temperatures and to no-flow heating, and swaps in the GRC-built M-pass instrument. Its size moments rely on a lognormal assumption that was checked in post-flight ground tests. (PSI-101)

### Other

Hardware: No shared flight hardware: an aerosol-instrument test (DAFT) and ground computational or laboratory studies that reuse flight data from other investigations. Investigations: PSI-47, PSI-62, PSI-115, PSI-60, PSI-117, PSI-142.

Similarities:

- Each builds on another investigation in this ranking: DAFT was a risk-mitigation test for SAME, PSI-115 simulates a SAME-like geometry, PSI-62 post-processes BASS and BASS-II imagery, PSI-60 analyzes SPICE images, and PSI-117 and PSI-142 use FLEX flight data. (PSI-47, PSI-115, PSI-62, PSI-60, PSI-117, PSI-142)
- None of them produced new microgravity combustion measurements: DAFT burned nothing, and the other five are ground investigations. (PSI-47, PSI-62, PSI-115, PSI-60, PSI-117, PSI-142)

Differences:

- DAFT verified on the ISS that a modified P-Trak particle counter works in microgravity, comparing it with a DustTrak, using Arizona Red Dust and cabin air. It reports low ISS particulate levels and larger on-orbit particle sizes. (PSI-47)
- PSI-62 simulates concurrent flame spread over PMMA sheets, spheres and rods and over wax cylinders, using a reduced-chemistry (flamelet) model coupled to the solid. It reconstructs 3D soot and temperature fields from BASS/BASS-II camera images by two-color tomography. (PSI-62, PSI-26, PSI-25)
- PSI-115 numerically simulates DBP smoke-particle formation in Earth gravity versus microgravity at two low cross-flow speeds. It assesses how thermophoresis, settling and geometry shape particle size distributions. (PSI-115)
- PSI-60 decoded over 1600 SPICE DSLR images into soot temperature and volume fraction fields. It compared them with a soot model for Yale and ACME burners in normal and microgravity. (PSI-60, PSI-107)
- PSI-117 is a 3-D CFD model of n-alkane droplet cool flames, validated against FLEX. It sweeps drift-like convection, heat flux, droplet size, ambient composition and pressure to build cool-flame stability maps. (PSI-117, PSI-69)
- PSI-142 uses ground counterflow flames sensitized with ozone, plus modeling of n-heptane and DME, to map cool-flame extinction under FLEX conditions. It studies elevated pressure up to 20 atm rather than reduced pressure. (PSI-142, PSI-69)

## Gaps

- No record reports partial-gravity combustion tests. FLEX, FLEX-2 and ACME-BRE state microgravity only, and E-FIELD reports no explicitly simulated partial gravity. The closest bounding data are paired microgravity and normal-gravity comparisons in CLD Flame, SLICE and several ground studies. (PSI-69, PSI-68, PSI-20, PSI-22, PSI-21, PSI-106, PSI-115, PSI-60)
- Elevated oxygen at reduced pressure, the expected Moon-base and rover atmosphere, is stated only for ACME-BRE, and there with gaseous emulators of solids. The real solid-material tests either give no oxygen set-point or only lower oxygen below 21% (BASS-II). Saffire-II's record attributes varied-oxygen and varied-pressure tests to Saffire IV, which is not in this ranking. (PSI-20, PSI-26, PSI-25, PSI-98, PSI-99, PSI-100)
- Test-level suppression data exist only for FLEX, which tested CO2 and helium on liquid droplets. On solids, the only suppressant described is BASS's nitrogen nozzle, with no flight results in its record. No record describes any other suppression agent. (PSI-69, PSI-26)
- The detection pillar rests on smoke and aerosol work whose records contain no measured particle sizes or detector responses (SAME, SAME-R). The remaining detection entries are an instrument check that burned nothing (DAFT) and a purely numerical study (PSI-115). None states the oxygen or pressure of the smoke tests. (PSI-102, PSI-101, PSI-47, PSI-115)
- Five investigations rest only on their summary card and PSI record, with no fact sheet or papers. One of them, CFI, is a flight experiment, and its pressure range is internally inconsistent. (PSI-62, PSI-115, PSI-117, PSI-142, PSI-39)
- Only FLEX has data rated ready for modeling. Every other combustion investigation needs extraction, including the flame-spread flights BASS, BASS-II and Saffire-I to -III, whose records hold no test-level results. Source discrepancies would also need resolving: airflow is given as up to 40 cm/s versus 5 to 50 cm/s for BASS, and SPICE reports 526 flames versus 250 tests. (PSI-69, PSI-26, PSI-25, PSI-98, PSI-99, PSI-100, PSI-107)
