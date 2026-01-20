# Building Mode - Voqo

You are implementing Voqo, an AI voice agent platform for real estate.

## Phase 0: Orient

0a. Study `specs/*` with up to 500 parallel Sonnet subagents to learn the application specifications.

0b. Study @IMPLEMENTATION_PLAN.md to understand what needs to be done and what's already completed.

0c. For reference, the application source code is in `app/*`, `components/*`, and `lib/*`.

0d. Study @AGENTS.md to understand how to build, run, and validate the project.

## Phase 1: Select & Investigate

1. Your task is to implement functionality per the specifications using parallel subagents. Follow @IMPLEMENTATION_PLAN.md and choose the **most important item** to address.

2. Before making changes, **search the codebase** (don't assume not implemented) using Sonnet subagents. The feature may already exist or be partially implemented.

3. You may use up to 500 parallel Sonnet subagents for searches/reads and **only 1 Sonnet subagent for build/tests** (to avoid race conditions).

4. Use Opus subagents when complex reasoning is needed (debugging, architectural decisions, resolving ambiguity).

## Phase 2: Implement

5. Implement the selected task completely. No placeholders, no stubs, no "TODO: implement later". Placeholders waste time redoing the same work.

6. If functionality is missing that you need, it's your job to add it as per the application specifications. Ultrathink.

## Phase 3: Validate

7. After implementing, run validation commands specified in @AGENTS.md:
   - TypeScript: `pnpm tsc --noEmit`
   - Lint: `pnpm lint`

8. If validation fails, fix the issues before proceeding. Do not commit broken code.

## Phase 3.5: UI Validation (For UI Tasks Only)

If the task involves UI components or pages, perform visual validation using Chrome tools:

9. **Design Reference**: When implementing UI, reference the Square design system on Mobbin:
   - URL: `https://mobbin.com/apps/square-web-27dbb23c-0771-4959-b035-674d5726eab3/68aba88b-fa98-4d7f-98ee-2ef35b1c91dd/screens`
   - Use Chrome tools to navigate and extract design patterns, colors, spacing, typography
   - Match the Square-inspired aesthetic specified in `specs/10-ui-design.md`

10. **Visual Testing**: After implementing UI:
    - Start the dev server if not running (`pnpm dev`)
    - Use Chrome tools to navigate to the implemented page/component
    - Take screenshots and verify:
      - **Functionality**: All buttons, links, forms work correctly
      - **Responsiveness**: Test at desktop (1280px), tablet (768px), mobile (375px) widths
      - **Colors**: Match the design system (primary black #171717, muted gray #737373, etc.)
      - **Error states**: Test error handling, empty states, loading states
      - **Accessibility**: Check contrast, focus states, semantic HTML

11. **Iterate if needed**: If visual issues found, fix them before proceeding to commit. The UI must match the design system quality.

## Phase 4: Update & Commit

9. When you discover issues or complete tasks, immediately update @IMPLEMENTATION_PLAN.md with your findings using a subagent. Mark completed items, note discoveries, add new bugs found.

10. When the validation passes:
    - Update @IMPLEMENTATION_PLAN.md to mark the task complete
    - `git add -A`
    - `git commit` with a descriptive message
    - After the commit, `git push`

## Guardrails (Higher number = More critical)

99. Important: When authoring documentation, capture the why — tests and implementation importance.

999. Important: Single sources of truth, no migrations/adapters. If tests unrelated to your work fail, resolve them as part of the increment.

9999. As soon as there are no build or test errors create a git tag. If there are no git tags start at 0.0.0 and increment patch by 1 (e.g., 0.0.1).

99999. You may add extra logging if required to debug issues.

999999. Keep @IMPLEMENTATION_PLAN.md current with learnings using a subagent — future work depends on this to avoid duplicating efforts. Update especially after finishing your turn.

9999999. When you learn something new about how to run the application, update @AGENTS.md using a subagent but keep it brief. For example if you run commands multiple times before learning the correct command then that file should be updated.

99999999. For any bugs you notice, resolve them or document them in @IMPLEMENTATION_PLAN.md using a subagent even if it is unrelated to the current piece of work.

999999999. Implement functionality completely. Placeholders and stubs waste efforts and time redoing the same work.

9999999999. When @IMPLEMENTATION_PLAN.md becomes large, periodically clean out the items that are completed from the file using a subagent.

99999999999. If you find inconsistencies in the `specs/*` then use an Opus subagent with 'ultrathink' requested to update the specs.

999999999999. IMPORTANT: Keep @AGENTS.md operational only — status updates and progress notes belong in `IMPLEMENTATION_PLAN.md`. A bloated AGENTS.md pollutes every future loop's context.

9999999999999. IMPORTANT: When spawning subagents for file reads/searches, use Sonnet subagents. Reserve Opus subagents only for complex reasoning.
