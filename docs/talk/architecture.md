# Architecture — "One capability, two clients"

This is the diagram to put on your **money-shot slide** (slide 8). It shows the entire thesis in one picture: a human and an AI agent are two different interfaces to the **same** capability, validated by the **same** contract, writing to the **same** store.

## The core diagram (Mermaid — renders on GitHub)

```mermaid
flowchart LR
    H["👤 Human user<br/><i>3-step wizard</i>"] -->|"server fn<br/>provisionEnvironmentFn"| C["⚙️ Shared capability<br/><i>provisionEnvironment()</i>"]
    A["🤖 AI agent<br/><i>chat + tools</i>"] -->|"tool call<br/>provision_environment"| C
    C -->|"validated by"| Z["🧾 Zod schema<br/><i>single contract</i>"]
    C --> DB[("🗄️ Supabase<br/>Postgres + Realtime")]
    DB -->|"realtime"| DASH["📊 Live dashboard"]
```

## ASCII version (for slides / terminal)

```
        👤 Human user                  🤖 AI agent
      (3-step wizard)             (chat sidebar + tools)
             │                            │
             │ provisionEnvironmentFn     │ provision_environment (tool)
             │                            │
             └────────────┬───────────────┘
                          ▼
             ⚙️ Shared capability: provisionEnvironment()
             (validated by ONE Zod schema)
                          │
                          ▼
             🗄️ Supabase (Postgres + Realtime)
                          │
                          ▼
             📊 Live dashboard (updates in realtime)
```

## The full diagram (all capabilities)

```mermaid
flowchart TB
    subgraph USERS["Two users"]
        H["👤 Human<br/>(3-step wizard)"]
        A["🤖 Agent<br/>(chat sidebar)"]
    end

    subgraph SF["Server functions (human path)"]
        PF["provisionEnvironmentFn"]
        UF["upgradePlanFn"]
        DF["deleteEnvironmentFn"]
    end

    subgraph TOOLS["AI tools (agent path)"]
        PT["provision_environment"]
        CT["change_plan"]
        DT["delete_environment"]
        AP["toolApproval<br/>(human-in-the-loop)"]
    end

    subgraph CAP["Shared capabilities"]
        P["provisionEnvironment()"]
        U["upgradePlan()"]
        D["deleteEnvironment()"]
        L["listEnvironments() / getSubscription()"]
    end

    subgraph CONTRACT["Shared contract"]
        Z["Zod schemas"]
    end

    subgraph STORE["Supabase"]
        E["environments"]
        S["subscriptions"]
        RT["Realtime"]
    end

    DASH["📊 Live dashboard"]

    H --> PF --> P
    H --> UF --> U
    H --> DF --> D

    A --> PT --> P
    A --> CT --> U
    A --> DT --> D
    CT --> AP
    DT --> AP

    P --> Z
    U --> Z
    D --> Z

    P --> E
    U --> S
    D --> E
    L --> E
    L --> S

    E --> RT
    S --> RT
    RT --> DASH
```

## File map (what lives where)

| Concern | File |
|---------|------|
| Shared contract (Zod) | `src/lib/schemas.ts` |
| Shared capabilities (one source of truth) | `src/server/capabilities.ts` |
| Human entry points (server fns) | `src/server/capabilities.ts` (bottom) |
| Agent entry points (tools + approval) | `src/routes/api/chat.ts` |
| Human wizard | `src/routes/new/step-1/2/3.tsx` |
| Agent chat UI + approval UI | `src/routes/__root.tsx` |
| Live dashboard (realtime) | `src/routes/index.tsx` |
| Browser realtime client | `src/lib/supabase-browser.ts` |
| Server admin client | `src/server/supabase.ts` |
| Schema + realtime + RLS | `supabase/migrations/0001_init.sql` |

## Why this matters (the 3 talking points)

1. **One function, two clients** — the wizard's server function and the AI tool both call `provisionEnvironment()`. No divergence possible.
2. **One contract** — the same Zod schema validates the human form AND the model's tool input. TypeScript type safety for humans, runtime validation for agents.
3. **One source of truth** — both write to the same Supabase tables, and the dashboard reflects both in realtime.
