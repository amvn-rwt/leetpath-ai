# LeetPath AI — Diagrams Reference

Standalone Mermaid diagrams for architecture and flows. See [system-design.md](./system-design.md) for full context.

---

## System Context (Users & External Systems)

```mermaid
graph LR
    User[User — Developer]
    App[LeetPath AI — SaaS]
    Supabase[Supabase — DB + Auth]
    Groq[Groq — LLM]
    Judge0[Judge0 — Code execution]

    User -->|Uses via browser| App
    App -->|Data, auth| Supabase
    App -->|AI requests| Groq
    App -->|Run/submit code| Judge0
```

---

## Component Overview (Simplified)

```mermaid
graph TB
    subgraph Frontend
        Pages[App Router Pages]
        Editor[Monaco Editor]
        UI[shadcn/ui]
    end

    subgraph Backend
        API[API Routes]
        Lib[lib/ — AI, Judge0, Supabase]
    end

    subgraph Data
        Prisma[Prisma Client]
        Supabase[(Supabase)]
    end

    Pages --> API
    Pages --> Editor
    Pages --> UI
    API --> Lib
    Lib --> Prisma
    Lib --> Groq[Groq]
    Lib --> Judge0[Judge0]
    Prisma --> Supabase
```

---

## Question Generation → Workspace → Score (End-to-End)

```mermaid
flowchart LR
    A[User profile + stats] --> B[POST /api/questions]
    B --> C[Groq: generate question]
    C --> D[Save question / return]
    D --> E[Practice workspace]
    E --> F[User writes code]
    F --> G[POST /api/execute]
    G --> H[Judge0]
    H --> I[Test results]
    I --> J[POST /api/score]
    J --> K[Groq: score + feedback]
    K --> L[Save Score, show to user]
```

---

## File Layout (Docs)

```
docs/
├── README.md          # Index and quick links
├── system-design.md   # Full high-level design + embedded diagrams
└── diagrams.md        # Standalone diagram reference (this file)
```
