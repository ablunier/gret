# Gret

An animated ASCII cat terminal agent powered by Ollama.

```
  ╱|、
 (˚ˎ 。7
  |、˜〵
  じしˍ,)ノ

Gret is watching you...

>
```

## Requirements

- [Bun](https://bun.com) (runtime)
- [Ollama](https://ollama.ai) (local LLM server)

## Setup

### 1. Install Ollama

```bash
# macOS / Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Or download from https://ollama.ai
```

### 2. Pull the default model

```bash
ollama pull mistral
```

### 3. Start Ollama

```bash
ollama serve
```

### 4. Install dependencies and run Gret

```bash
bun install
bun run dev
```

## Usage

Type anything and press Enter. Gret responds with an animated reaction and a short cat reply.

Special commands:
- `exit` or `quit` — leave the app
- `Ctrl+C` — force quit

## CLI Options

```bash
bun run dev                        # defaults: mistral, localhost:11434
bun run dev -- --model llama3.2    # use a different model
bun run dev -- --host ollama.local # remote Ollama server
bun run dev -- --port 11435        # custom port
```

## Environment Variables

```bash
GRET_MODEL=mistral
GRET_OLLAMA_HOST=localhost
GRET_OLLAMA_PORT=11434
```

## Troubleshooting

**Gret can't reach Ollama:**
```
Make sure Ollama is running: ollama serve
```

**Model not found:**
```bash
ollama pull mistral
# or use a faster/smaller alternative:
ollama pull phi
ollama pull gemma:2b
```

## Development

```bash
bun test        # run tests
bun run dev     # start with hot reload
```

## Animations

Gret has 15 built-in animations the LLM chooses from:
`idle`, `thinking`, `purr`, `stretch`, `pounce`, `hiss`, `sleep`, `curious`, `loaf`, `knock`, `groom`, `zoomies`, `blep`, `scared`, `love`
