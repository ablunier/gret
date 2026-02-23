# @ablunier/apertus-core

Core business logic and API clients for Apertus CLI.

## Features

- **PublicAI API client** - Full integration with public.ai API
- **Configuration management** - Persistent storage with conf library
- **Type-safe** - Built with TypeScript and Zod validation
- **Error handling** - Custom error classes for different failure scenarios
- **Tested** - Comprehensive unit tests with vitest

## Usage

```typescript
import { PublicAIProvider, ConfigStore } from '@ablunier/apertus-core';

// Create a provider
const provider = new PublicAIProvider({ apiKey: 'your-key' });

// Send a message
const response = await provider.sendMessage([
  { role: 'user', content: 'Hello!' }
]);

console.log(response.message.content);

// Use ConfigStore
const config = new ConfigStore();
config.setApiKey('your-api-key');
```

## API

### PublicAIProvider

Provider implementation for public.ai API.

```typescript
const provider = new PublicAIProvider({
  apiKey: string,
  model?: string,        // Default: 'apertus-1'
  baseUrl?: string,      // Default: 'https://api.publicai.co'
  maxTokens?: number,    // Default: 4096
  temperature?: number   // Default: 0.7
});
```

### ConfigStore

Manages application configuration.

```typescript
const config = new ConfigStore();

config.setApiKey(apiKey: string, providerName?: string)
config.setModel(model: string, providerName?: string)
config.getConfig(): ApertusConfig
config.getProvider(name?: string): ProviderConfig
config.isConfigured(): boolean
config.getConfigPath(): string
config.reset(): void
```

## License

MIT
