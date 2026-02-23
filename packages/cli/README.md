# @ablunier/apertus-cli

Command-line interface for Apertus AI assistant.

## Commands

### Single Message Mode

Send a single message and get a response:

```bash
npm run cli -- "Your message here"
```

### Initialize Configuration

Set up your API key and preferences:

```bash
npm run cli -- init
```

### Configuration Management

Set API key:
```bash
npm run cli -- config set-key <api-key>
```

Set default model:
```bash
npm run cli -- config set-model <model-name>
```

Show current configuration:
```bash
npm run cli -- config show
```

### Help

View all available commands:

```bash
npm run cli -- --help
```

## Examples

```bash
# Initialize configuration
npm run cli -- init

# Ask a question
npm run cli -- "What is TypeScript?"

# Check configuration
npm run cli -- config show
```

## Phase 1 Features

- Single message mode
- Interactive configuration setup
- Config management commands
- Color-coded output
- Token usage display
- Error handling

## License

MIT
