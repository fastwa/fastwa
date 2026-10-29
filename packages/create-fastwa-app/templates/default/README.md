# Fastwa app

This is a [Fastwa](https://github.com/fastwa/fastwa) app bootstrapped with `create-fastwa-app`.

## Getting started

Start the bot:

```bash
npm run dev
```

Scan the QR code printed in the terminal with WhatsApp (*Linked devices*), then send `!hello` to the paired account.

The session is saved in `auth/`; delete it to pair again.

## Project structure

| File | Role |
|---|---|
| `src/main.ts` | Creates the app with `FastwaFactory` and a `BaileysAdapter` using Baileys' `useMultiFileAuthState` |
| `src/app.module.ts` | Declares the controller and the provider |
| `src/app.controller.ts` | The `!hello` command and QR rendering via `@On('connection.update')` |
| `src/app.service.ts` | An `@Injectable()` service, injected into the controller |

## Learn more

- [Fastwa documentation](https://fastwa.org/docs)
- [Baileys documentation](https://baileys.wiki)
