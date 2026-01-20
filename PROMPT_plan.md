# Planning Mode - Voqo

You are planning the implementation of Voqo, an AI voice agent platform for real estate.

## Phase 0: Orient

0a. Study `specs/*` with up to 250 parallel Sonnet subagents to learn the application specifications. Each spec file describes a feature or component of the system.

0b. Study @IMPLEMENTATION_PLAN.md (if present) to understand the plan so far and what has been completed.

0c. Study `src/lib/*` with up to 250 parallel Sonnet subagents to understand shared utilities & components (if they exist).

0d. For reference, the application source code is in `app/*` and `components/*` (Next.js App Router structure).

0e. Study @AGENTS.md to understand how to build and validate the project.

## Phase 1: Gap Analysis & Planning

1. Study @IMPLEMENTATION_PLAN.md (if present; it may be incorrect or outdated). Use up to 500 Sonnet subagents to study existing source code in `app/*`, `components/*`, `lib/*` and compare it against `specs/*`.

2. Use an Opus subagent to analyze findings, prioritize tasks, and create/update @IMPLEMENTATION_PLAN.md as a bullet point list sorted in priority of items yet to be implemented. Ultrathink.

3. Consider searching for: TODO comments, minimal implementations, placeholders, skipped/flaky tests, inconsistent patterns, missing API routes, incomplete UI components.

4. Study @IMPLEMENTATION_PLAN.md to determine starting point for research and keep it up to date with items considered complete/incomplete using subagents.

## Critical Rules

IMPORTANT: Plan only. Do NOT implement anything. Do NOT make any code changes. Do NOT commit.

IMPORTANT: Do NOT assume functionality is missing; confirm with code search first using Sonnet subagents. Search before adding to the plan.

IMPORTANT: Treat `lib/` as the project's standard library for shared utilities and components. Prefer consolidated, idiomatic implementations there over ad-hoc copies.

IMPORTANT: When spawning subagents, always use Sonnet subagents for file reads, searches, and analysis. Reserve Opus subagents only for complex reasoning tasks like architectural decisions or synthesizing findings.

## Dependency Order Guidance

When prioritizing tasks, consider this dependency order:

1. **Foundation** - Project setup, database schema, core utilities, API clients
2. **Core Features** - Agents, Telephony/Webhooks, Call Logs, Contacts & Memories
3. **Automation** - Post-Call SMS, Custom Functions
4. **Batch Operations** - Campaigns, Batch Outbound
5. **UI Polish** - Dashboard Home, Landing Page

Features should generally be built as vertical slices (schema → API → UI) to reach working state quickly.

## Ultimate Goal

We want to build a complete, working AI voice agent platform with:
- Landing page (marketing)
- Dashboard with agents, contacts, calls, campaigns management
- ElevenLabs integration for voice AI
- Twilio integration for telephony and SMS
- SQLite database with Drizzle ORM

Consider missing elements and plan accordingly. If an element is missing, search first to confirm it doesn't exist, then add it to the plan. If you discover a spec is incomplete or ambiguous, note it in the plan for clarification.

When updating @IMPLEMENTATION_PLAN.md, use a subagent to keep the main context clean.
