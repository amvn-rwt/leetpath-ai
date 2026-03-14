# LeetPath AI — High-Level System Design

Technical interview prep SaaS: AI-generated questions, coding workspace with execution, AI code scoring, and simulated interviews.

---

## 1. Overview

| Aspect | Description |
|--------|-------------|
| **Product** | LeetPath AI — SaaS for technical interview preparation |
| **Core value** | AI question generation, real-time code execution, AI code scoring, and interview simulation |
| **Deployment** | Vercel (free tier) |
| **Database** | PostgreSQL via Supabase |
| **Auth** | Supabase Auth (email + social) |

---

## 2. Architecture Diagram

```mermaid
graph TB
    subgraph client["Client (Browser)"]
        Landing[Landing / Marketing]
        Auth[Sign In / Sign Up]
        Dashboard[Dashboard]
        Practice[Practice — Question Bank & Workspace]
        Interview[Interview Sim]
        Analytics[Analytics]
    end

    subgraph next["Next.js App (Vercel)"]
        API[API Routes]
        SSR[Server Components / Pages]
    end

    subgraph api_routes["API Layer"]
        QGen[/api/questions]
        Execute[/api/execute]
        Score[/api/score]
        InterviewAPI[/api/interview]
        SignOut[/api/auth/signout]
    end

    subgraph external["External Services"]
        Supabase[(Supabase — DB + Auth)]
        Groq[Groq — Llama 3.3]
        Judge0[Judge0 — Code Execution]
    end

    Landing --> SSR
    Auth --> Supabase
    Dashboard --> API
    Practice --> QGen
    Practice --> Execute
    Practice --> Score
    Interview --> InterviewAPI
    Interview --> Execute
    Interview --> Score
    Analytics --> API

    QGen --> Groq
    Score --> Groq
    InterviewAPI --> Groq
    Execute --> Judge0
    API --> Supabase
```

---

## 3. Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | Next.js 15 (App Router) | Full-stack, SSR, API routes, Vercel-native |
| **Database** | PostgreSQL (Supabase) | Users, questions, submissions, scores, sessions |
| **ORM** | Prisma | Type-safe DB access, migrations |
| **Auth** | Supabase Auth | Email + Google/GitHub, JWT sessions |
| **AI** | Vercel AI SDK + Groq (Llama 3.3) | Question generation, code scoring, interviewer chat |
| **Code execution** | Judge0 (RapidAPI) | Run/submit code, 40+ languages |
| **Editor** | Monaco (@monaco-editor/react) | In-browser code editing |
| **UI** | Tailwind v4 + shadcn/ui | Styling and components |

---

## 4. Request & Data Flow

### 4.1 Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Next.js (Middleware)
    participant S as Supabase Auth
    participant P as Protected Page

    U->>C: Request /dashboard
    C->>S: getUserId (cookie/session)
    alt Not authenticated
        S-->>C: null
        C->>U: Redirect /sign-in?redirect=/dashboard
    else Authenticated
        S-->>C: user
        C->>P: Allow request
        P->>U: Render dashboard
    end
```

### 4.2 Practice Flow (Run Code → Submit → Score)

```mermaid
sequenceDiagram
    participant U as User
    participant W as Workspace (Monaco)
    participant API as Next.js API
    participant J as Judge0
    participant G as Groq (AI)
    participant DB as Supabase/Prisma

    U->>W: Write code, click Run
    W->>API: POST /api/execute (code, lang, questionId)
    API->>J: Submit execution
    J-->>API: stdout, stderr, runtime
    API-->>W: Execution result
    W->>U: Show output

    U->>W: Click Submit
    W->>API: POST /api/execute (with test cases)
    API->>J: Run against tests
    J-->>API: passed/total, status
    API->>DB: Create Submission
    API->>G: POST /api/score (code + results)
    G-->>API: Structured score + feedback
    API->>DB: Create Score
    API-->>W: Score + feedback
    W->>U: Show results & AI feedback
```

### 4.3 Interview Simulation Flow

```mermaid
sequenceDiagram
    participant U as User
    participant Setup as Interview Setup
    participant Session as Interview Session Page
    participant API as /api/interview
    participant Groq as Groq (AI)
    participant DB as Supabase

    U->>Setup: Configure duration, difficulty, topics
    Setup->>DB: Create InterviewSession (SETUP)
    U->>Session: Start interview
    Session->>DB: Update status IN_PROGRESS

    loop Chat + coding
        U->>Session: Message or code
        Session->>API: Stream chat / hints
        API->>Groq: streamText (interviewer prompt)
        Groq-->>API: Stream tokens
        API-->>Session: SSE stream
        Session->>DB: Store InterviewMessage
    end

    U->>Session: End / time up
    Session->>API: Final score request
    API->>Groq: Evaluate session
    Groq-->>API: Report + score
    API->>DB: Update session (COMPLETED, report)
    Session->>U: Show report
```

---

## 5. Data Model (Entity Relationship)

```mermaid
erDiagram
    users ||--o{ skill_assessments : has
    users ||--o{ submissions : makes
    users ||--o{ interview_sessions : has
    users ||--o| user_statistics : has

    questions ||--o{ submissions : receives

    submissions ||--o| scores : has

    interview_sessions ||--o{ interview_messages : contains

    users {
        uuid id PK
        string email
        string fullName
        experience_level experienceLevel
        string[] targetCompanies
        string[] preferredLanguages
        boolean onboardingComplete
    }

    skill_assessments {
        uuid id PK
        uuid user_id FK
        string topic
        skill_level selfLevel
        skill_level aiLevel
    }

    questions {
        uuid id PK
        string title
        text description
        json examples
        difficulty difficulty
        string[] topics
        json testCases
        json hiddenTestCases
    }

    submissions {
        uuid id PK
        uuid user_id FK
        uuid question_id FK
        string language
        text code
        submission_status status
        int passedTests
        int totalTests
    }

    scores {
        uuid id PK
        uuid submission_id FK
        int correctness
        string timeComplexity
        int codeQuality
        int overallScore
        text feedback
    }

    interview_sessions {
        uuid id PK
        uuid user_id FK
        difficulty difficulty
        string[] topics
        interview_status status
        int finalScore
        json report
    }

    interview_messages {
        uuid id PK
        uuid session_id FK
        string role
        text content
    }

    user_statistics {
        uuid id PK
        uuid user_id FK
        int problemsSolved
        float averageScore
        int currentStreak
        string[] weakTopics
    }
```

---

## 6. Application Structure (Routes)

```mermaid
graph LR
    subgraph public["Public"]
        /["/"]
        /pricing["/pricing"]
        /signin["/sign-in"]
        /signup["/sign-up"]
    end

    subgraph protected["Protected (Auth Required)"]
        /dashboard["/dashboard"]
        /practice["/practice"]
        /practice_id["/practice/[id]"]
        /interview["/interview"]
        /interview_id["/interview/[id]"]
        /analytics["/analytics"]
    end

    subgraph api["API Routes"]
        /api_questions["/api/questions"]
        /api_execute["/api/execute"]
        /api_score["/api/score"]
        /api_interview["/api/interview"]
        /api_signout["/api/auth/signout"]
    end

    middleware["Middleware"] --> protected
    middleware --> public
```

- **Middleware** refreshes Supabase session and redirects unauthenticated users from `/dashboard`, `/practice`, `/interview`, `/analytics` to `/sign-in`.
- **Auth routes** (`/sign-in`, `/sign-up`): redirect authenticated users to `/dashboard`.

---

## 7. External Integrations

| Service | Usage | Config |
|---------|--------|--------|
| **Supabase** | Auth (JWT, cookies), PostgreSQL | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| **Groq** | Question generation, code scoring, interviewer chat | `GROQ_API_KEY` |
| **Judge0** | Code run/submit | `JUDGE0_API_KEY`, `JUDGE0_API_URL` |

---

## 8. Deployment (Vercel)

```mermaid
graph TB
    subgraph vercel["Vercel"]
        Edge[Edge Network]
        Fn[Serverless Functions]
        Static[Static / ISR]
    end

    subgraph external["External"]
        Supabase[(Supabase)]
        Groq[Groq]
        Judge0[Judge0]
    end

    User[Users] --> Edge
    Edge --> Fn
    Edge --> Static
    Fn --> Supabase
    Fn --> Groq
    Fn --> Judge0
```

- **Next.js** is deployed as a Vercel project; API routes run as serverless functions.
- **Env vars** (Supabase, Groq, Judge0, `NEXT_PUBLIC_APP_URL`) are set in Vercel.
- **Database** lives in Supabase; Prisma migrations are run outside Vercel (e.g. CI or local).

---

## 9. Security Considerations

- **Auth**: All protected routes validated by middleware via Supabase session; no server-side role key on client.
- **API**: Question, execute, score, and interview routes should resolve the current user from Supabase (server) and scope data by `userId` / `sessionId`.
- **Secrets**: `GROQ_API_KEY`, `JUDGE0_*`, `SUPABASE_SERVICE_ROLE_KEY` only in server env; never exposed to client.
- **Rate limits**: Consider Vercel rate limiting or upstream (Groq/Judge0) limits for abuse control.

---

## 10. Diagram Index

| Diagram | Section | Description |
|---------|---------|-------------|
| Architecture | §2 | High-level boxes: Client, Next.js, API routes, external services |
| Auth flow | §4.1 | Sequence: request → middleware → Supabase → redirect or allow |
| Practice flow | §4.2 | Sequence: run/submit → execute → score → DB |
| Interview flow | §4.3 | Sequence: setup → session → chat/code → report |
| Data model | §5 | ER diagram: users, questions, submissions, scores, interviews, stats |
| Routes | §6 | Public vs protected routes and API routes |
| Deployment | §8 | Vercel → serverless + external services |

All diagrams are in Mermaid and render in GitHub, VS Code (with Mermaid support), and most modern Markdown viewers.
