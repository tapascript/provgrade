# Full Speaker Script — "The Next User of Your React App May Not Be a Human"

## Timing map

| Time | Slide(s) | Beat |
| ------ | ---------- | ------ |
| 0:00–1:00 | 1 | Hook + promise |
| 1:00–2:00 | 2 | About me |
| 2:00–5:00 | 3–4 | Two users, the shift |
| 5:00–8:00 | 5–6 | The mismatch + reframe |
| 8:00–13:30 | 7–9 | LIVE DEMO + money shot |
| 13:30–16:00 | 10 | Coexistence / approval |
| 16:00–21:00 | 11–12 | Patterns + takeaways |
| 21:00–22:30 | 13 | Close |
| 22:30–30:00 | 14 | Thank you + Q&A |

---

## Slide 1 · Title (0:00–1:00)

> "Good morning, everyone. I'm Tapas, and I want to open with a confession.
>
> Every app we've ever built — every single one — was built for a *person*. A person with eyes, and fingers, and a mouse. We designed buttons for them to click. Forms for them to fill. Wizards for them to step through. We agonized over the loading spinner, and whether the dropdown opened in the right direction.
>
> And that was correct. For twenty years, our only user *was* a human.
>
> But I want to plant one idea in your head, and I want you to hold it for the next thirty minutes:
>
> **The next user of your React app may not be a human.**
>
> It may not click. It may not read. It may not have a mouse. But it *will* use your app — and I'm going to show you how to be ready for it."

---

## Slide 2 · About Me (1:00–2:00)

> "Quick hello before the how. I'm Tapas. Twenty-plus years writing software, most of it building UI for *human* users — which means I've already made every mistake I'm about to warn you against.
>
> I run a company called Creowis, I teach developers under the name tapaScript, I founded ReactPlay and the React Kolkata and Siliguri communities, and I make videos on YouTube.
>
> So I've spent a lot of hours staring at the relationship between a developer and their user. And that's the only thing this talk is about."

---

## Slide 3 · Who Is Your User? (2:00–3:30)

> "Let's start with a simple question: **who is your user?**
>
> Today there are two very different creatures standing at the door of your application.
>
> On the left — the human. Reads your text. Clicks your buttons. Fills your forms. Waits patiently for your loader.
>
> On the right — the agent. An AI agent reasons about *intent*, calls *tools*, acts, then checks the result. It never touches your DOM. It will never see your beautiful button.
>
> And here's the punchline: **both are users. Only one has a mouse.**
>
> Here's the mistake almost all of us are about to make — we keep building for the one with the mouse."

---

## Slide 4 · The Shift (3:30–5:00)

> "So what changed?
>
> Software is no longer just *answering*. It's learning to *act*.
>
> Copilot, Claude, ChatGPT — they started as chat. But look at what they're becoming: agentic workflows. Systems that don't stop at a reply — they go and *do* things. They book the meeting. They file the pull request. They provision the server.
>
> And here's why that matters to you, the React developer in this room:
>
> Your app's next user isn't going to read your UI. **It's going to call your capabilities.**
>
> So the question nobody's asking yet is this: when that agent walks up to your app — what does it see? A door it can't open… or an interface it can actually use?"

---

## Slide 5 · The Mismatch (5:00–6:30)

> "Here's the mismatch, and it's a little brutal.
>
> *This* — this button, this form, this wizard — is completely invisible to an agent. It can't see it. It can't click it. To an AI, your gorgeous UI is a wall.
>
> But *this* — a structured tool call — this is perfect. A name. A database type. A region. Clean. Unambiguous. Machine-readable.
>
> So we have a choice. We can pretend our users will only ever be human… or we can accept reality and design for both.
>
> And that's the reframe. Let me show you."

---

## Slide 6 · The Reframe (6:30–8:00)

> "Here's the idea that changes everything:
>
> **An agent is just another user.**
>
> The human doesn't talk to your database. The agent doesn't either. They both talk to the same *capability*. The only difference is the *interface*.
>
> The human uses a wizard — buttons and forms. The agent uses a chat — words and tools. But underneath, they hit the **same function**.
>
> Once you see it that way, the scary question becomes a boring engineering question:
>
> **How do I build one app that serves both — without writing everything twice?**
>
> And the answer, I promise you, is already in your toolbox. Let me prove it with a live demo."

---

## Slide 7 · Demo — The Human Path (8:00–10:00) ⚙️ live

**DO** — click "+ Provision manually" → run the 3-step wizard → provision PostgreSQL in `ap-south-1` → point at the dashboard as the row appears live.

**SHOW** — `src/routes/new/step-3.tsx` → `provisionEnvironmentFn` → `src/server/capabilities.ts` → `src/lib/schemas.ts`.

> "This is a real app I built for this talk. It provisions cloud infrastructure — *fake* cloud, real everything else.
>
> First, the human path. A person wants a database. They click 'Provision manually.' Name. Engine. Region. Review. Provision.
>
> Boom — there it is in the dashboard, live.
>
> Now, here's what actually happened under the hood. That wizard didn't talk to the database. It called a **server function** — `provisionEnvironmentFn`. And before that function runs, it validates the input against a **Zod schema**.
>
> Let me say it again, because it's the whole talk: **the wizard is just a UI for one function.**
>
> Now — the fun part. What happens when the *next* user shows up?"

---

## Slide 8 · Demo — The Agent Path (10:00–12:00) ⚙️ live

**DO** — type *"spin up a MongoDB cluster in us-east-1"* → watch the tool run → dashboard updates live.

**SHOW** — `src/routes/api/chat.ts` → the `provision_environment` tool.

> "Same app. But now the user is an agent.
>
> I type: *'spin up a MongoDB cluster in us-east-1.'*
>
> Watch. The agent doesn't click anything. It calls a **tool**. The tool runs… and the environment appears in the dashboard, live — exactly like the human's did.
>
> Look at the code. The agent's tool has a name, a schema, and an `execute` function. And what does `execute` do?
>
> It calls `provisionEnvironment`. **The same function the wizard called.**
>
> The agent didn't get a special API. It didn't get a backdoor. It used the same door the human used."

---

## Slide 9 · The Money Shot (12:00–13:30)

**SHOW** — the architecture diagram. This is the slide they'll remember.

**SAY** *(slow down, land every word)*

> "Let me slow down, because this is the slide I want you to remember when you leave this room.
>
> **One capability. Two clients.**
>
> Human wizard over here. AI agent over here. Both converge on one function — `provisionEnvironment`.
>
> One Zod contract, shared by the form *and* the tool. One source of truth in Supabase. One live dashboard that reflects both.
>
> **That** is what it looks like to design for non-human users. Not a separate AI feature bolted onto the side — the same architecture, the same code, the same contract, two different users.
>
> And here's the part that should make you breathe easy: this isn't exotic. It's server functions. It's typed schemas. It's React. **You already know how to do this.**"

---

## Slide 10 · Coexistence / Approval (13:30–16:00) ⚙️ live

**DO** — type *"upgrade me to Pro"* → show the amber approval card → click **Approve**. Then *"delete staging-db"* → click **Deny**.

**SHOW** — the approval UI + `toolApproval` in `src/routes/api/chat.ts`.

> "But the moment the agent becomes a real user, you start asking *harder* questions.
>
> Like: **what is the agent allowed to do on its own?**
>
> Watch. I'll ask it to upgrade my plan. *'Upgrade me to Pro.'*
>
> The agent *proposes* the change — but it does **not** execute it. Instead, a human gets a card: *'Approval required — change plan. Tier: Pro. Cost: $50 a month.'* And a human has to click Approve.
>
> Money? Needs a human. Deleting an environment? Irreversible — needs a human.
>
> This is the part most people skip when they talk about AI agents. The agent doesn't replace the human — **it feeds the human.**
>
> And notice — I didn't write that rule twice. I wrote it **once**. The agent and the human hit the same capability, so they inherit the same guardrails automatically."

---

## Slide 11 · The Four Patterns (16:00–19:00)

> "Everything we just did collapses into four patterns you can steal today:
>
> **One — Capabilities, not screens.** Expose intent as functions, not pages. The agent can't use your screen; it *can* use your function.
>
> **Two — One contract.** A Zod schema is the shared language between your UI and your agent's tools. Type safety for the human, runtime validation for the AI.
>
> **Three — Human-in-the-loop by default.** Anything irreversible, anything that costs money — a human approves. Every time.
>
> **Four — Observe the agent like a user.** Real-time dashboards, telemetry, cost. You'd never ship a human-facing feature without monitoring it. Don't do it for your AI users either."

---

## Slide 12 · Takeaways (19:00–21:00)

> "Let me leave you with three things:
>
> **One.** The next user of your app may not be human — **but it's still a user.** Design for it like one.
>
> **Two.** **You already have the tools.** Server functions, typed schemas, React. Add a tool definition and a contract, and you're done.
>
> **Three.** The agent doesn't replace your UI — **it feeds it.** Build the capability once, then put whatever interface you want on top: a wizard for the human, a chat for the agent."

---

## Slide 13 · Closing (21:00–22:30)

> "So here's my closing thought.
>
> The question isn't *whether* your app will have non-human users. The agents are already here — and they're already trying to use your software, awkwardly, blindly, through the wrong door.
>
> The question is whether you'll **design for them** — or **bolt them on later.**
>
> Because I promise you: the teams that treat the agent as a first-class user today are the ones whose apps the agents will prefer tomorrow.
>
> Design for both. The human will thank you — and the agent will too, in its own way."

---

## Slide 14 · Thank You (22:30 → Q&A)

> "Thank you so much.
>
> I'd love to hear what you're building — and what *you* think your app's next user might be. Scan the code, come say hi, or find me at tapaScript.io and CreoWis.com.
>
> And now — let's talk. Questions?"

---

## Fallbacks (if the model misbehaves)

- The **architecture story survives even if one agent call goes sideways** — carry the demo with the human wizard + code walkthrough.
- Tool call stalls → refresh, clear the chat, re-type the prompt slowly.
- Realtime doesn't fire → refresh the dashboard manually, say "…and it's persisted to Supabase."

---

## FAQs

1. **"How do you secure the agent endpoint?"**
   The same way you secure any API. Add auth, rate limiting, and scoped permissions. Today the demo uses a service-role key for writes — that's the one thing you'd lock down first in production: give the agent a *scoped* identity, never admin.

2. **"Does the agent have access to everything the human does?"**
   No — by design. The capability is shared, but *authorization* is layered on top (approval for money/deletes). The point is one code path, with per-user guardrails, not two code paths.

3. **"What about hallucinations / the agent doing the wrong thing?"**
   The Zod schema is your boundary. The model can only call a tool with structured, validated input — or the call is rejected. High-stakes actions are gated behind human approval, and observability catches what slips through.

4. **"Isn't this just what MCP / A2A is doing?"**
   Same idea — tools as the interface to capabilities. The difference this talk makes is architectural: don't build a *separate* agent API; make your existing functions the tools, so human and agent can't drift apart.

5. **"How do you test agent flows?"**
   Treat the tool layer as a tested contract — unit-test the capabilities, test the schema, then the chat is just one thin client over the same functions you already test.

6. **"Why TanStack Start / Supabase?"**
   Server functions + realtime fit the 'capability' model perfectly — but the pattern is framework-agnostic. Next.js server actions, a plain API route, whatever: the lesson is the *contract*, not the stack.

7. **"What about cost / rate limiting?"**
   A public chat endpoint is an open cost meter. Add auth + rate limits + token telemetry before it goes anywhere near production — exactly like you'd instrument any user-facing API.
