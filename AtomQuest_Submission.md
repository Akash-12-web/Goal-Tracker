# AtomQuest Hackathon 2026 - Submission

## 1. Working Application Link
**Live Demo:** [Insert Vercel/Netlify Deployment Link Here]
*(Note: If you haven't deployed yet, run `npx vercel` in your terminal to get a live link instantly!)*

## 2. Source Code Repository
**GitHub Repository:** [Insert GitHub Repository Link Here]

## 3. Demo Video
**Watch the Full Walkthrough:** [Insert YouTube or Google Drive Video Link Here]

---

## 4. Architecture Diagram
The AtomQuest Portal is built using a modern Next.js App Router architecture, leveraging React Server Components for performance, and integrating simulated AI intelligence for gamified goal tracking.

```mermaid
graph TD
    %% User Interfaces
    subgraph "Frontend (Next.js Client Components)"
        UI_Dash[Employee Dashboard]
        UI_Team[Manager Team View]
        UI_Admin[Admin Analytics]
        UI_Cmd[Command Palette Cmd+K]
        UI_Graph[Constellation SVG Graph]
    end

    %% Application Logic / Server
    subgraph "Backend (Next.js Server Actions)"
        SA_Goals[Goal Management Logic]
        SA_Approve[Approval Workflow]
        SA_AI[AI Mock Services]
    end

    %% Data Layer
    subgraph "Data Storage"
        DB[(Local JSON Database)]
    end

    %% Connections
    UI_Dash <-->|Creates/Submits Goals| SA_Goals
    UI_Team <-->|Reviews/Approves| SA_Approve
    UI_Admin -->|Reads Data| DB

    %% AI Integrations
    UI_Dash -->|Requests Sub-goals| SA_AI
    SA_AI -.->|Generates Atoms| UI_Dash
    
    UI_Team -->|Triggers Sentiment Analysis| SA_AI
    SA_AI -.->|Returns Mood (Positive/Negative)| UI_Team

    %% DB Connections
    SA_Goals <--> DB
    SA_Approve <--> DB
    SA_AI -->|Saves AI Results| DB
    
    %% Styling
    classDef frontend fill:#3b82f6,stroke:#2563eb,stroke-width:2px,color:#fff
    classDef backend fill:#10b981,stroke:#059669,stroke-width:2px,color:#fff
    classDef db fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#fff
    
    class UI_Dash,UI_Team,UI_Admin,UI_Cmd,UI_Graph frontend
    class SA_Goals,SA_Approve,SA_AI backend
    class DB db
```

## 5. Key Differentiators & Features
*   **Gamification (XP & Leveling):** Employees earn XP and level up by consistently updating their atomic sub-goals.
*   **AI "Atomizer":** Automatically breaks down massive, intimidating quarterly goals into 3 actionable micro-quests.
*   **AI Sentiment Analysis:** Managers get an instant read on employee morale based on their check-in comments.
*   **Constellation Visualizer:** An interactive, physics-based visualization of how every employee's goal orbits the core company thrust areas.
*   **Developer-Grade UX:** Includes a global Command Palette (`Ctrl+K`), Glassmorphism UI, and dark mode optimizations.
