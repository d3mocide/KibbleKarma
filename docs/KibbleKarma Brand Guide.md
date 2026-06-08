# KibbleKarma — Brand Guide (agent reference)

> Single-file, copy-paste-ready brand spec for building on-brand KibbleKarma
> screens, components, and copy. Companion to `KibbleKarma Brand Guide.html`.
> When in doubt: **a hug from a golden retriever — warm, rounded, cozy, never clinical.**

---

## 1. What it is

KibbleKarma is a **self-hosted pet wellness tracker** — a cozy, non-clinical
companion for logging meals, weight, and health events for the furry members of
the family. It is **not** a vet app and **not** a spreadsheet; it's a digital pet
scrapbook that happens to do smart calorie math.

**Tagline:** *Feed good. Feel good. Repeat.*
**Tagline alts:** *"Good vibes start in the bowl." · "Because every good pup deserves good karma."*

**Three brand pillars:**
1. **Nourish** — "Know what goes in the bowl." Meals, foods, barcode scan, calorie math. Icon: `bone`.
2. **Thrive** — "Watch them grow (in all the right ways)." Weight trends, health events, charts. Icon: `trending-up`.
3. **Private & Yours** — "Your furball's data. Your home server. No one else's business." Self-hosted, no subscription, no surveillance. Icon: `home`.

---

## 2. Voice & tone (the most distinctive thing)

Warm · encouraging · playful · calm · a little silly. **Never** clinical, cold,
or anxiety-inducing.

- **Person:** second person, possessive and affectionate — "**your** sleepy
  snackers," "add **your** first furry friend." The app refers to itself as "we"
  ("we'll fetch the details from Open Food Facts").
- **Casing:** sentence case **everywhere** — titles, buttons, labels. Never ALL
  CAPS, never Title Case Headlines. Headings are friendly fragments, not commands.
- **Encouragement:** progress is celebrated, never scolded. On-target gets a
  cheer; over-target is softened ("A little over today" — never "EXCEEDED LIMIT").
  Health = wellbeing, not diagnosis.

### Lexicon — use these, they carry the brand
| Plain word | KibbleKarma says |
|---|---|
| Pets | buddies · furry friends · sleepy snackers · your crew |
| Meal / feeding | a **meal** ("Log a meal", "meal history", "Today's meals") |
| Weigh-in | a **weigh-in** ("Log a weigh-in") |
| Add a pet | "Add a new buddy" |
| Loading… | "Fetching the cuddles…" · "Fetching your crew…" · "Snuggling in…" |
| Empty state | "No buddies yet" · "your pet is patiently waiting" |
| Mid-action | "Snuggling in…" · "Logging…" · "Saving…" |

### Say / Never
| ✅ We say | 🚫 Never |
|---|---|
| They're right on track! | WARNING: LIMIT EXCEEDED |
| A little over today. | You overfed your animal. |
| Logged 312 kcal 🎉 | Entry recorded: 312 calories. |
| Good kibble karma incoming. | Caloric intake within parameters. |

**Emoji:** deprecated as functional icons (use Lucide). May appear *sparingly*
in celebratory microcopy only — a lone 🎉 in a streak toast. Never in headings,
labels, or buttons.

---

## 3. Color tokens

Warm and earthy. Everything skews warm — peachy, sunlit, golden. **No cool
greys, no high-contrast B&W, no neon, never a pure/alarming red.**

### Terracotta — primary (buttons, active nav, key numbers, links)
| Token | Hex |
|---|---|
| `--terracotta-700` | `#B95A40` |
| `--terracotta-600` | `#CF6A4C` (primary hover) |
| **`--terracotta-500`** | **`#E07A5F` ← brand primary** |
| `--terracotta-400` | `#E89379` |
| `--terracotta-300` | `#F0B3A1` |
| `--terracotta-200` | `#F7D4C9` |
| `--terracotta-100` | `#FBE8E1` |
| `--terracotta-50`  | `#FDF3EF` |

### Sage — secondary (healthy / on-track / calm, charts, success)
| Token | Hex |
|---|---|
| `--sage-700` | `#5C8C74` |
| `--sage-600` | `#6FA088` (= success) |
| **`--sage-500`** | **`#81B29A` ← brand secondary** |
| `--sage-400` | `#9AC2AE` |
| `--sage-300` | `#B7D4C6` |
| `--sage-200` | `#D5E6DD` |
| `--sage-100` | `#E8F2EC` |
| `--sage-50`  | `#F3F8F5` |

### Butter — accent (highlights, badges, streaks, karma score)
| Token | Hex |
|---|---|
| `--butter-600` | `#E9B86A` (= caution) |
| **`--butter-500`** | **`#F2CC8F` ← brand accent** |
| `--butter-400` | `#F6D9A8` |
| `--butter-300` | `#FAE6C4` |
| `--butter-200` | `#FCF0DC` |
| `--butter-100` | `#FEF7EC` |

### Oat / Cream — ground
| Token | Hex | Use |
|---|---|---|
| `--oat-white` | `#FFFFFF` | card surface |
| `--oat-100` | `#FAF7F0` | **app background** |
| `--oat-200` | `#F3EAD9` | **sand** — sunken/secondary fill |
| `--oat-300` | `#EFE6D6` | hairline / divider |

### Charcoal — warm ink (text)
| Token | Hex | Use |
|---|---|---|
| `--charcoal-900` | `#2B2D40` | strong text |
| `--charcoal-700` | `#3D405B` | **body text** |
| `--charcoal-500` | `#5B5E78` | muted |
| `--charcoal-300` | `#8C8FA3` | faint |

### Status (kept soft & non-clinical)
| Role | Token | Hex | Soft bg |
|---|---|---|---|
| Success (on-track, healthy) | `--success` | `#6FA088` (sage-600) | `#E8F2EC` |
| Caution (gentle heads-up) | `--caution` | `#E9B86A` (butter-600) | `#FCF0DC` |
| Alert (warm coral, never red) | `--alert` | `#D97455` | `#FBE8E1` |

### Semantic aliases
```
--color-primary: #E07A5F;  --color-primary-hover: #CF6A4C;  --color-primary-press: #B95A40;
--color-secondary: #81B29A;  --color-accent: #F2CC8F;
--surface-app: #FAF7F0;  --surface-card: #FFFFFF;  --surface-sunken/fill: #F3EAD9;
--text-strong: #2B2D40;  --text-body: #3D405B;  --text-muted: #5B5E78;  --text-faint: #8C8FA3;
--text-on-primary: #FFFFFF;  --text-link: #CF6A4C;
--border-soft: #EFE6D6;  --border-input: #F3EAD9;  --border-focus: #E89379;
--ring-primary: rgba(224,122,95,.32);  --ring-sage: rgba(129,178,154,.4);
```

---

## 4. Typography

Two faces, both rounded and friendly. **Sentence case everywhere.**

- **Nunito** — the workhorse for headings *and* body. Self-hosted variable font.
  Headings lean heavy: **ExtraBold (800)** is the house weight for titles. Body
  400, labels 700.
- **Fredoka** — chunky rounded display face. Reserved for brand/hero moments:
  the wordmark, hero headlines, oversized stat numbers. Use sparingly.

```
--font-display: "Fredoka", "Nunito", ui-rounded, system-ui, sans-serif;  /* hero / wordmark / big numbers */
--font-rounded: "Nunito", ui-rounded, system-ui, sans-serif;             /* headings + UI */
--font-body:    "Nunito", ui-rounded, system-ui, sans-serif;             /* body */
```

**Weights:** regular 400 · medium 600 · bold 700 (labels) · **extrabold 800 (titles)**.

**Type scale (16px base):**
| Token | px | Use |
|---|---|---|
| `--text-2xs` | 11 | micro / chip |
| `--text-xs` | 12 | chip |
| `--text-sm` | 14 | label |
| `--text-base` | 16 | body default |
| `--text-lg` | 18 | card title |
| `--text-xl` | 20 | |
| `--text-2xl` | 24 | page title |
| `--text-3xl` | 30 | |
| `--text-4xl` | 36 | |
| `--text-5xl` | 48 | hero |
| `--text-6xl` | 60 | |

**Line height:** tight `1.12` on headings, `1.5` body, `1.65` relaxed.
**Tracking:** `-0.02em` on big titles; `0.08em` uppercase eyebrow/overline.

**Semantic roles:**
```
--font-page-title: 800 1.5rem/1.12 Nunito;
--font-card-title: 800 1.125rem/1.3 Nunito;
--font-body-default: 400 1rem/1.5 Nunito;
--font-label: 700 0.875rem/1.3 Nunito;
```

---

## 5. Spacing, radii, shadow, motion

### Spacing — 4px base
`--space-1`…`-16` = 4, 8, 12, 16, **20 (card padding)**, 24 (modal padding), 32,
40, 48, 64 px. Layout: centered **1024px** (`--container-max`) column,
comfortable gutters, spaced with `gap` — never crammed. Whitespace is a feature.

### Radii — round all the way down (core to the brand, nothing is square)
| Token | Value | Use |
|---|---|---|
| `--radius-sm` | 8px | chip inner |
| `--radius-md` | 12px | inputs, soft tiles |
| `--radius-lg` | 16px | nested cards |
| `--radius-card` | **20px** | **the signature card radius** |
| `--radius-pill` | 9999px | **buttons, nav, chips, avatars** |

### Shadows — one warm, low, cocoa-tinted family (never neutral grey)
| Token | Value |
|---|---|
| `--shadow-cozy-sm` | `0 2px 10px rgba(91,74,66,.06)` |
| **`--shadow-cozy`** | **`0 4px 20px rgba(91,74,66,.08)` ← the signature** |
| `--shadow-cozy-lg` | `0 10px 34px rgba(91,74,66,.14)` (interactive hover) |
| `--shadow-press` | `inset 0 2px 6px rgba(91,74,66,.12)` (sunken/pressed) |

Cards have **no border** — the cozy shadow does the lifting. Inner sunken tiles
use a translucent sand fill (`bg-sand/60`) instead of a shadow.

### Motion — gentle, brief (120–200ms), respect `prefers-reduced-motion`
```
--ease-cozy:   cubic-bezier(.22,.61,.36,1);   /* soft settle — house easing for everything */
--ease-bounce: cubic-bezier(.34,1.56,.64,1);  /* playful overshoot — delight only (wiggle, badge pop) */
--dur-fast: 120ms;  --dur-base: 200ms;  --dur-slow: 320ms;
```
No long sweeping animations, no infinite loops on content.

---

## 6. Iconography — Lucide line icons (not emoji)

~2px stroke, rounded caps/joins, warm-tinted. One icon per label, leading the
text. Default 18–20px inline, 24px standalone. Tint: terracotta for primary/brand
actions, sage for health/on-track, charcoal-500 for neutral glyphs.

```html
<i data-lucide="paw-print"></i>
<script src="https://unpkg.com/lucide@0.469.0/dist/umd/lucide.min.js"></script>
<script>lucide.createIcons();</script>
```

**Canonical mapping:**
- **Species:** `dog` · `cat` · `rabbit` · `paw-print` (fallback).
- **Health events:** `stethoscope` (vet) · `thermometer` (symptom) · `pill` (med) · `flask-conical` (lab) · `notebook-pen` (note).
- **Actions/status:** `bone` (log meal) · `scale` (weigh-in) · `scan-barcode` · `sparkles` (karma) · `flame` (streak) · `trophy` (milestone) · `party-popper` (success) · `target` (on-target).
- **UI glyphs:** `arrow-left` · `trending-up` · `plus` · `x` · `download` · `chevron-down`.

Never draw bespoke clinical/medical icons, or use sharp, thin, or cool-grey icons.

**Logo:** a paw print nestled in a bowl with a butter "karma" halo, as a
terracotta/sage yin-yang. The mark (not an emoji) is the favicon. See
`assets/logo-mark.svg` and `assets/logo-wordmark.svg`.

---

## 7. Components

All backed by tokens. Press = a tiny settle `translateY(1px) scale(.99)` (never a
harsh shrink). Focus = soft 3px terracotta ring (`--ring-primary`), never a hard
outline. Disabled = 50% opacity + not-allowed.

### Button (`primary | secondary | ghost`, `sm | md`, optional leading icon, `fullWidth`)
- **Primary:** terracotta fill, white text → hover `--terracotta-600`.
- **Secondary:** sand fill, charcoal text → hover warms to `--terracotta-100`.
- **Ghost:** transparent, terracotta text → hover gets a sand fill.
- Always a **pill**. Padding `.5rem 1rem` (md), `.32rem .7rem` (sm).

### Card (`interactive`, `as`)
White, `--radius-card` (20px), padding `--space-5`, `--shadow-cozy`, no border.
`interactive` lifts to `--shadow-cozy-lg` on hover + pointer cursor.

### Chip (`tone: neutral | sage | terracotta | butter | alert`, optional icon)
Pill badge, `--text-xs`, weight 700, soft tinted bg + matching text. e.g.
sage = `#E8F2EC`/`#5C8C74`.

### Avatar (`species: dog|cat|rabbit|other`, `tone: sand|sage|terracotta|butter`, `size` px=56, `icon`)
Round tile (pill radius) holding a Lucide species glyph on a tinted ground.

### TextField (`label`, `hint`, all native input attrs)
Label (700, 14px) + rounded input (`--radius-md`, sand border on `--surface-app`).
Focus → terracotta border + soft ring. Hint in muted below.

### Select (`label`, `options[]` or `<option>` children)
Same field styling, native select, soft `chevron-down` glyph.

### Tabs (`tabs[]`, `value`, `onChange`) — controlled
Underline row (Overview · Diet · Meals · Weigh-ins · Health). Active = terracotta
text + 2px terracotta underline; idle muted, hover charcoal.

### NavPill (`active`, `as`)
Pill nav link. Active = terracotta fill + white; idle = muted with sand hover.

### StatMeter (`value`, `max`, `tone`)
Rounded sage fill on a sand track. When `value > max`, fill softens to `--alert`
(never alarming).

### Toast (`tone: success | caution | alert | info`, optional icon)
Soft status pill — the brand **celebrates rather than warns**. success = sage,
caution = butter, alert = warm coral, info = terracotta.

### EmptyState (`icon`, `title`, `hint`, `action`)
Centered cozy card: friendly icon on a sand tile, warm title, hint, optional
action button. Copy stays patient — "No buddies yet · your pet is patiently waiting."

### Modal (`open`, `onClose`, `title`)
Centered cream dialog over a soft charcoal scrim. Scrim or × to close.

---

## 8. Quick "is it on-brand?" checklist

- [ ] Sentence case, second person, warm + a little silly. No ALL CAPS, no clinical tone.
- [ ] Uses the lexicon (meal, buddy, crew, weigh-in).
- [ ] Terracotta/sage/butter on oat-cream; warm charcoal ink. No cool grey / neon / pure red.
- [ ] Nunito everywhere (ExtraBold titles); Fredoka only for brand/hero/big numbers.
- [ ] Cards = white, 20px radius, single `cozy` shadow, no border. Buttons/nav/chips = pills.
- [ ] Lucide icons, warm-tinted, one per label. Emoji only in sparing celebratory microcopy.
- [ ] Gentle motion (120–200ms, ease-cozy); generous whitespace; 1024px centered column.
- [ ] Status is soft: success = sage, caution = butter, alert = warm coral.

---

*Reference build: `KibbleKarma Brand Guide.html`. Full design-system source lives
in `tokens/`, `components/`, `guidelines/`, and `assets/`.*
