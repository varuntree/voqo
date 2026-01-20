#!/bin/bash
set -euo pipefail

# ============================================================================
# Ralph Loop Script for Voqo
# ============================================================================
# Usage:
#   ./loop.sh              # Build mode, unlimited iterations
#   ./loop.sh 20           # Build mode, max 20 iterations
#   ./loop.sh plan         # Plan mode, unlimited iterations
#   ./loop.sh plan 5       # Plan mode, max 5 iterations
#
# Modes:
#   plan  - Gap analysis, generates/updates IMPLEMENTATION_PLAN.md (no code)
#   build - Implements tasks from plan, commits on success
# ============================================================================

# Parse arguments
MODE="build"
PROMPT_FILE="PROMPT_build.md"
MAX_ITERATIONS=0

if [ "${1:-}" = "plan" ]; then
    MODE="plan"
    PROMPT_FILE="PROMPT_plan.md"
    MAX_ITERATIONS=${2:-0}
elif [[ "${1:-}" =~ ^[0-9]+$ ]]; then
    MAX_ITERATIONS=$1
fi

ITERATION=0
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "main")

# Display configuration
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  RALPH LOOP - Voqo"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Mode:   $MODE"
echo "  Prompt: $PROMPT_FILE"
echo "  Branch: $CURRENT_BRANCH"
[ $MAX_ITERATIONS -gt 0 ] && echo "  Max:    $MAX_ITERATIONS iterations"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verify prompt file exists
if [ ! -f "$PROMPT_FILE" ]; then
    echo "Error: $PROMPT_FILE not found"
    echo "Make sure you're in the project root directory."
    exit 1
fi

# Main loop
while true; do
    # Check iteration limit
    if [ $MAX_ITERATIONS -gt 0 ] && [ $ITERATION -ge $MAX_ITERATIONS ]; then
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "  Reached max iterations: $MAX_ITERATIONS"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        break
    fi

    ITERATION=$((ITERATION + 1))
    echo ""
    echo "╔══════════════════════════════════════════════════════════════════════╗"
    echo "║  ITERATION $ITERATION - $MODE mode"
    echo "╚══════════════════════════════════════════════════════════════════════╝"
    echo ""

    # Run Claude with the prompt
    # -p: Headless mode (non-interactive, reads from stdin)
    # --dangerously-skip-permissions: Auto-approve all tool calls
    # --model opus: Use Opus for main agent (subagents use Sonnet per prompt instructions)
    # --verbose: Detailed logging
    cat "$PROMPT_FILE" | claude -p \
        --dangerously-skip-permissions \
        --model claude-sonnet-4-20250514 \
        --verbose

    # Push changes after each iteration
    CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "main")
    if git diff --quiet && git diff --cached --quiet; then
        echo "No changes to push."
    else
        git push origin "$CURRENT_BRANCH" 2>/dev/null || {
            echo "Creating remote branch..."
            git push -u origin "$CURRENT_BRANCH" 2>/dev/null || echo "Push failed - may need manual intervention"
        }
    fi

    echo ""
    echo "════════════════════════════════════════════════════════════════════════"
    echo "  Completed iteration $ITERATION"
    echo "════════════════════════════════════════════════════════════════════════"
done

echo ""
echo "Ralph loop finished."
