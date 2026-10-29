# Fastwa + Vercel AI SDK

A WhatsApp assistant built with [Fastwa](https://github.com/fastwa/fastwa) and the [Vercel AI SDK](https://ai-sdk.dev), answering with Claude.

It answers **every message received in a private chat** and shows how to:

- answer messages with `generateText` from the AI SDK;
- give the model **tools**, including one that acts on WhatsApp (reacting to the message);
- send **images** to the model, either with a caption or by replying to one;
- show the **"typing…"** indicator while the model answers;
- filter messages with **guards**: only private chats and messages with text are answered.

## Requirements

- Node.js >= 22.12
- An [Anthropic API key](https://console.anthropic.com)

## Setup

```bash
cp .env.example .env   # then fill in ANTHROPIC_API_KEY
npm install
npm run dev            # builds and starts the bot
```

Scan the QR code printed in the terminal with WhatsApp (*Linked devices*). The session is saved in `auth/`; delete it to pair again.

> This sample uses the local fastwa packages (`file:../../packages/*`), so build them first with `npm run build` at the repository root. In your own project, depend on the published `fastwa` and `@fastwa/baileys` packages instead.

## Usage

Send any message to the paired account from **another number, in a private chat**:

| Message | What happens |
|---|---|
| `What is the capital of France?` | Answers with Claude |
| `What time is it in Tokyo?` | The model calls the `getCurrentDateTime` tool |
| `React to this with a heart` | The model calls the `reactToMessage` tool, which reacts to your message |
| An image with the caption `What is in this picture?` | The image is downloaded and sent to the model |
| A reply to an image with `What is in this picture?` | Same, using the quoted image |

Two guards decide which messages are answered, with `@UseGuards(DMGuard, ContentGuard)`:

- `DMGuard` ignores groups, broadcasts, channels and the bot's own messages. Without the last check the bot would answer its own replies forever, since WhatsApp also delivers the messages you send.
- `ContentGuard` ignores messages without text: reactions, stickers, audio, and images or videos without a caption.

## How it works

| File | Role |
|---|---|
| `src/main.ts` | Creates the app with `FastwaFactory` and a `BaileysAdapter` using Baileys' `useMultiFileAuthState` |
| `src/ai.module.ts` | Declares the controller and the provider |
| `src/ai.controller.ts` | A catch-all `@Command` that reads the text (or caption) with `@Content()` and the replied-to message with `@Quoted()`, shows the typing indicator, and renders the QR via `@On('connection.update')` |
| `src/ai.service.ts` | Calls `generateText` with the instructions, tools and Anthropic provider options |
| `src/ai.tools.ts` | AI SDK tools, created per request so they can act on the current message |
| `src/dm.guard.ts` | Guard that only lets messages from others in private chats through |
| `src/content.guard.ts` | Guard that only lets messages with text (or a caption) through |

The model is `claude-opus-5-5` with `effort: 'low'` for fast chat replies. `fallbacks: 'default'` retries on a fallback model in the same call if Claude declines a request.

## Using another provider

The AI SDK makes the provider a one-line change. For example, with OpenAI:

```bash
npm install @ai-sdk/openai
```

```ts
// src/ai.service.ts
import { openai } from '@ai-sdk/openai';

model: openai('<model-id>'),
```

Then drop the `providerOptions.anthropic` block, which is Anthropic-specific.

## Limitations

- Each message is answered independently: there is no conversation memory.
- Only images are sent to the model. For videos and documents, only the caption is.
