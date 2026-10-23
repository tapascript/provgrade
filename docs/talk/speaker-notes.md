# Speaker Notes — "The Next User of Your React App May Not Be a User"

> React India · 30 min (27 + 3 buffer) · Demo app: **DashFlow Infrastructure** (`provgrade`)

## The thesis (say at the start AND the end)

> "An agent is just another user interface. The wizard is the UI for humans;
> the chat + tools is the UI for agents — and they both walk through the same door."

## Timing map

| Time | Beat | Goal |
|------|------|------|
| 0:00–3:00 | Cold open | Hook + promise |
| 3:00–7:00 | The shift | Why agents can't use your UI |
| 7:00–17:00 | Live demo | "Same action, two users" |
| 17:00–23:00 | The 4 patterns | Generalize |
| 23:00–27:00 | Takeaways + close | Land it |
| 27:00–30:00 | Q&A | Buffer |

## Slide list (keep to ~12, code-light)

1. Title
2. "Who is your user?" (👤 + 🤖 side by side)
3. The shift (3 bullets)
4. The mismatch — "agents don't click"
5. The reframe — "an agent is just a user"
6. Demo: the human path
7. Demo: the agent path
8. **MONEY SHOT** — one function, two clients
9. Coexistence — approval / human-in-the-loop
10. The 4 patterns
11. Takeaways
12. Closing + repo link

---

## Full script

### 0:00–3:00 · Cold open

**SAY** (no intro, just start):
> "How many of you built your React app for *users*? Buttons, forms, wizards, dropdowns — all designed for a human with a mouse.
> Here's my question: **what happens when your next user isn't a human?**"

**DO** — put the dashboard on screen (already seeded with 2–3 environments).

**SAY**:
> "In the next 25 minutes I'll show you a human and an AI agent doing the *exact same thing* in the *same React app* — through the *same code*."

**SHOW** — slide 2 (👤 + 🤖). Then reveal title (slide 1).

---

### 3:00–7:00 · The shift

**SAY** (slides 3–5, fast):
> "We're in an agentic wave — Copilot, Claude, ChatGPT, agentic workflows. But here's the mismatch: **agents don't click.** They reason, then act through *tools*."

**SAY** (the reframe — this is the talk's core idea):
> "So here's the reframe: **an agent is just another user.** It's a different interface to the same capabilities.
> The question becomes — how do I build one React app that serves both, without writing everything twice?"

---

### 7:00–17:00 · THE DEMO ("same action, two users")

**Beat 1 — the human (2 min)**

- **DO**: click **"+ Provision manually"** → run the 3-step wizard → provision PostgreSQL in `ap-south-1`.
- **DO**: point at the **live dashboard** as the row appears (Supabase Realtime).
- **SHOW**: `src/routes/new/step-3.tsx` → it calls `provisionEnvironmentFn`.
- **SHOW**: `src/server/capabilities.ts` → `provisionEnvironment`.
- **SHOW**: `src/lib/schemas.ts` → the Zod schema.
- **SAY**: "The wizard is just a UI for this one function."

**Beat 2 — the agent (2 min)**

- **DO**: type *"spin up a MongoDB cluster in us-east-1"*.
- **DO**: watch the chat call the `provision_environment` tool, render the ✅ card, and the dashboard update **live**.
- **SHOW**: `src/routes/api/chat.ts` → the tool definition.
- **SAY**: "The agent didn't get a special API. It called the **same function**."

**Beat 3 — THE MONEY SHOT (1 min)**

- **SHOW**: `provisionEnvironment` side-by-side with its two callers (wizard server fn + AI tool).
- **SHOW**: the architecture diagram (see `architecture.md`).
- **SAY** (slowly, verbatim):
> "One capability. Two clients. One Zod contract. **That** is how you design for non-human users."

**Beat 4 — coexistence / approval (2 min)**

- **DO**: type *"upgrade me to Pro"* → show the **amber approval card** → the human clicks **Approve**.
- **SAY**: "The agent doesn't replace the human — **it asks the human.**"

**Beat 5 — business rules live once (2 min)**

- **DO**: from Enterprise, ask *"downgrade me to Free"* → show it's **rejected** (sequential rule).
- **SHOW**: `canTransition` in `src/server/capabilities.ts`.
- **SAY**: "I wrote this rule **once**. The human wizard and the agent both get it for free — they can never drift apart."

**Beat 6 — destructive needs a human (1 min)**

- **DO**: type *"delete staging-db"* → approval card → click **Deny**.
- **SAY**: "The most important design decision for agent users: **what are they NOT allowed to do on their own?**"

---

### 17:00–23:00 · The 4 patterns

**SAY** (slide 10):
> "Four patterns fell out of this demo:"

1. **Capabilities, not screens** — expose intent as functions, not pages.
2. **One contract** — a Zod schema is the shared language for human UI *and* tool input.
3. **Human-in-the-loop by default** — for irreversible / high-stakes actions (money, deletes).
4. **Observe the agent like a user** — realtime dashboard, telemetry, cost.

**SHOW**: flash the relevant file for each pattern (`capabilities.ts`, `schemas.ts`, `__root.tsx` approval UI, dashboard).

---

### 23:00–27:00 · Takeaways + close

**SAY** (slide 11):
> 1. The next user of your React app may not be human — **but it's still a user.**
> 2. **You already have what you need** — server functions, typed schemas, React. Add tools + a contract + guardrails.
> 3. The agent doesn't replace your UI — **it feeds it.**

**SAY** (closing, slide 12):
> "The question isn't *whether* your app will have non-human users. It's whether you'll **design for them** — or bolt them on later."

**DO**: drop the repo link + stack (TanStack Start, AI SDK, Supabase).

---

## Demo cheat-sheet (print this)

| # | Say | Do | Point at |
|---|-----|----|----------|
| 1 | "Here's the human path." | wizard → provision | `step-3.tsx` → `provisionEnvironmentFn` |
| 2 | "Here's the agent." | chat "spin up a MongoDB…" | `chat.ts` tool → live dashboard |
| 3 | "Same function. One contract." | side-by-side | `capabilities.ts` + `schemas.ts` |
| 4 | "Money needs a human." | "upgrade me to Pro" → Approve | approval card |
| 5 | "The rule lives once." | Enterprise → Free rejected | `canTransition` |
| 6 | "Deletion is guarded." | "delete staging-db" → Deny | approval card |

---

## Pre-show checklist

- [ ] Supabase project **resumed** (free plan pauses after ~1 week idle).
- [ ] Migration `0001_init.sql` applied; anon key in `.env`.
- [ ] **Pre-seed 2–3 environments** so the dashboard isn't empty.
- [ ] **Pre-warm the model** — send one chat message before going on stage (avoid cold start).
- [ ] `npm run dev` running; test realtime on venue Wi-Fi.
- [ ] Plan set to **Pro** (so the Enterprise→Pro→Free demo starts from a known state).

## Fallbacks (if the model misbehaves)

- The **architecture story survives even if one agent call goes sideways** — carry the demo with the human wizard and the code walkthrough.
- If a tool call stalls: refresh the page, clear the chat, re-type the prompt slowly.
- If realtime doesn't fire: just refresh the dashboard manually and say "and it's persisted to Supabase."
