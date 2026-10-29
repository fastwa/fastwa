# Fastwa basics

The smallest [Fastwa](https://github.com/fastwa/fastwa) app: a module, a controller and a service injected into it.

## Requirements

- Node.js >= 22.12

## Setup

```bash
npm install
npm run dev   # builds and starts the bot
```

Scan the QR code printed in the terminal with WhatsApp (*Linked devices*). The session is saved in `auth/`; delete it to pair again.

> This sample uses the local fastwa packages (`file:../../packages/*`), so build them first with `npm run build` at the repository root. In your own project, depend on the published `fastwa` and `@fastwa/baileys` packages instead.

## Usage

Send `hello` to the paired account. The bot answers with a greeting using your WhatsApp name.

## How it works

| File | Role |
|---|---|
| `src/main.ts` | Creates the app with `FastwaFactory` and a `BaileysAdapter` using Baileys' `useMultiFileAuthState` |
| `src/greeting.module.ts` | Declares the controller and the provider |
| `src/greeting.controller.ts` | The `hello` command, which reads the sender's name with `@Message('pushName')`, and QR rendering via `@On('connection.update')` |
| `src/greeting.service.ts` | An `@Injectable()` service, injected into the controller's constructor |
