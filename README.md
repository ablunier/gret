# Apertus CLI

Terminal-based AI agent powered by Apertus LLM via public.ai API.

## Quick Start

### Installation

```bash
npm install
npm run build
```

### Setup

Initialize the configuration:

```bash
npm run cli -- init
```

Or set the API key directly:

```bash
npm run cli -- config set-key <your-api-key>
```

### Usage

Send a message:

```bash
npm run cli -- "Hello, can you help me with my code?"
```

## Development

This is a monorepo using npm workspaces and Turborepo.

### Project Structure

```
apertus-cli/
├── packages/
│   ├── core/      # API clients and business logic
│   └── cli/       # Terminal interface
```

### Scripts

- `npm run build` - Build all packages
- `npm run test` - Run all tests
- `npm run dev` - Watch mode for development
- `npm run typecheck` - Type checking
- `npm run clean` - Clean build artifacts

### Testing

```bash
npm test
```

## Configuration

Configuration is stored at:
- Unix: `~/.config/apertus/config.json`
- Windows: `%APPDATA%\apertus\config.json`

## License

MIT
