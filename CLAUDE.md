# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Apertus CLI is a terminal-based AI coding agent (similar to Claude Code) powered by the `swiss-ai/apertus-8b-instruct` model via the public.ai API. It uses React + Ink for terminal UI and follows a monorepo structure with two packages: `core` (business logic) and `cli` (terminal UI).

## Commands

### Root (runs across all packages via Turborepo)
```bash
npm run build          # Build all packages
npm run dev            # Watch mode
npm run lint           # Lint all packages
npm run test           # Run all tests
npm run test:watch     # Watch mode tests
npm run test:coverage  # Tests with v8 coverage
npm run typecheck      # TypeScript type checking
npm run clean          # Clean all build artifacts + node_modules
npm run cli            # Run the CLI (npm run start --workspace=@ablunier/apertus-cli)
```

### Single package
```bash
# Run tests for only one package
npm run test --workspace=packages/core
npm run test --workspace=packages/cli

# Run a single test file (from the package directory)
cd packages/core && npx vitest run src/tools/registry/ToolRegistry.test.ts
```

## Architecture

### Monorepo Structure
- **`packages/core/`** (`@ablunier/apertus-core`) — All business logic: API clients, tool system, config management, types
- **`packages/cli/`** (`@ablunier/apertus-cli`) — Terminal UI using React + Ink, CLI command routing

### Core Package (`packages/core/src/`)

**API Layer (`api/`)**
- `BaseProvider.ts` — Abstract base with HTTP error handling and retry logic
- `PublicAIProvider.ts` — Sends chat completions to `https://api.publicai.co/v1/chat/completions` using the OpenAI-compatible format with bearer token auth
- `errors/` — Typed error classes: `ApiError`, `AuthenticationError`, `RateLimitError`, `NetworkError`

**Tool System (`tools/`)**
- `registry/ToolRegistry.ts` — Registers tools, provides `getToolDefinitions()` for LLM function calling
- `executor/ToolExecutor.ts` — Executes tool calls: registry lookup → param validation → safety check → execution
- `safety/SafetyGuard.ts` — Path validation (relative to cwd), directory whitelist, confirmation handlers
- `implementations/` — 5 tools: `ReadFileTool`, `WriteFileTool`, `ListDirectoryTool`, `SearchFilesTool`, `RunCommandTool` (stub)
- `utils/createToolRegistry.ts` — Factory that creates a pre-populated registry

**Config (`config/`)**
- `ConfigStore.ts` — Uses `conf` library; persists to `~/.config/apertus/config.json`
- `schema.ts` — Zod validation schemas for all config types
- Default model: `swiss-ai/apertus-8b-instruct`, default `maxTokens: 483`

### CLI Package (`packages/cli/src/`)

**Entry Point:** `cli.ts` — Commander-based routing to commands

**Commands (`commands/`):**
- `chat.ts` — Multi-turn conversation loop (max 10 turns): sends messages → handles `tool_calls` finish reason → executes tools → continues
- `interactive.ts` — Interactive React + Ink mode
- `init.ts` — First-run configuration wizard
- `config-cmd.ts` — Config management subcommands

**React Components (`components/`):** `App.tsx` → `ChatDisplay`, `InputPrompt`, `StatusBar`, `ToolExecutionView`, `ConfirmationPrompt`, `DiffPreview`, `ErrorDisplay`

**Hooks (`hooks/`):** `useConversation.ts` (conversation state + tool flow), `useToolExecution.ts`, `useConfig.ts`

### Conversation Flow

1. User message added to history
2. Provider sends all messages + tool definitions to LLM
3. If `finish_reason === 'tool_calls'` → execute tools → append `ToolMessage` results → loop
4. If `finish_reason === 'stop'` → display response and exit loop
5. Max 10 turns per conversation

### LLM API Format

Uses OpenAI-compatible function calling. Tools are passed as `tools: ToolDefinition[]` and results returned as messages with `role: 'tool'` and `tool_call_id`.

## Tech Stack

- **TypeScript** (strict mode, target ES2022, module: esnext)
- **Build:** tsdown per package, orchestrated by Turborepo
- **Testing:** vitest with v8 coverage
- **UI:** React 19 + Ink 6 (terminal React renderer)
- **Validation:** Zod for config and tool parameter schemas
- **CLI parsing:** Commander

## Current Status

The project implements PRD Phases 1–2 (foundation + tool system). Phase 3–4 features (streaming, full interactive UI, `RunCommandTool` execution, session persistence) are pending. `RunCommandTool` currently returns an error stub.
