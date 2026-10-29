# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, Cursor, etc.) when working with code in this repository.

## Project

Fastwa is a NestJS-style framework for building WhatsApp chatbots. The framework itself is platform-independent; it reaches WhatsApp through adapters, currently [Baileys](https://github.com/WhiskeySockets/Baileys) (`@whiskeysockets/baileys@7.0.0-rc14`). It is a Lerna/npm-workspaces monorepo publishing these packages from `packages/*`:

| Package | Directory | Role |
|---|---|---|
| `fastwa` | `packages/fastwa` | The framework: DI, modules, decorators, guards, pipes, collectors, `FastwaFactory`, the adapter contract and the `FastwaMessage` model. Must not import Baileys or other `@fastwa/*` packages. |
| `@fastwa/baileys` | `packages/baileys` | The Baileys adapter (`BaileysAdapter`) and Baileys-specific APIs: message decorators, `@Socket()`, `WAEvent` and WhatsApp enums. |
| `@fastwa/builders` | `packages/builders` | Message-content builders (stickers via sharp/node-webpmux, contacts, formatters). |
| `@fastwa/schedule` | `packages/schedule` | `@Cron` decorator + explorer/service, a port of `@nestjs/schedule`. |
| `create-fastwa-app` | `packages/create-fastwa-app` | Scaffolding CLI (`npx create-fastwa-app`), with no runtime dependencies. |

A future `@fastwa/meta` adapter (WhatsApp Cloud API) is planned, so keep platform code out of `fastwa`.

Requirements: Node.js >= 20.19.0. Baileys 7 is ESM-only and is loaded from the CommonJS packages through `require()`.

## Commands

```bash
npm run build          # prebuild + tsc -b -v packages (composite project references)
npm run prebuild       # scripts/clean.js (removes every build output) + scripts/check-fastwa-imports.js
npm run format         # prettier over **/*.ts
npm run publish        # prebuild + build + lerna publish
```

- There is no test suite and no lint script (ESLint config exists; run `npx eslint` directly if needed). Verify changes by building, by running scripts against the built packages, and by packing tarballs (`npm pack -w <package>`) and installing them in a fresh project.
- `npm run build` fails when `packages/fastwa` imports `@whiskeysockets/baileys` or any `@fastwa/*` package (`scripts/check-fastwa-imports.js`).
- `start:dev` points to a sample that no longer exists; run the samples instead.

Packages build in place (`.js` and `.d.ts` next to the sources, git-ignored) via TypeScript project references: `packages/tsconfig.json` references each package's `tsconfig.build.json`. Packages import each other by their published names (`fastwa`, `@fastwa/baileys`), mapped to `packages/*` by `paths` in the root and package tsconfigs. Inside `packages/fastwa`, imports are relative.

Each package publishes only compiled files (`files`: `**/*.js`, `**/*.d.ts`) and exposes only its entry point (`exports`), so everything public must be exported from the package's `index.ts` barrels.

## Architecture

The design deliberately mirrors NestJS: modules, controllers, providers, decorator-driven metadata (`reflect-metadata`, loaded by `fastwa`'s `index.ts`), a DI container, guards, and pipes. `packages/fastwa` has two folders: `common` (decorators, interfaces, enums, utils, `Logger`, pipes) and `core` (container, injector, scanner, interaction, guards and pipes consumers, collectors, adapters).

**Bootstrap flow:** `FastwaFactory.create(AppModule, new BaileysAdapter(options))` (`fastwa/core/fastwa-factory.ts`) builds a `FastwaContainer`, stores the adapter, scans the module graph (`core/scanner`) and instantiates providers/controllers (`core/injector`). `app.listen()` (`core/fastwa-application.ts`) runs the `InteractionExplorer`, calls `adapter.listen()` with an `InteractionDispatcher`, and fires the `onModuleInit` / `onBootstrap` lifecycle hooks. `app.close()` closes the adapter.

**Adapters:** an adapter extends `AbstractAdapter` (`core/adapters`): `listen(host)`, `reply(message, response)` and `close()`. It converts platform events into calls to its `AdapterHost` (`handleMessage`, `handleReaction`, `handleEvent`), passing each message as a `FastwaMessage` (`common/interfaces/message.interface.ts`: `chatId`, `chatIdAlt`, `senderId`, `text`, `quoted`, `reaction`, `raw`...). `BaileysAdapter` (`packages/baileys/adapters/baileys.adapter.ts`) creates the socket, maps messages with `toFastwaMessage()` (`packages/baileys/helpers`), only dispatches `notify` upserts, reconnects after any close except `loggedOut` (as Baileys recommends), and sends handler return values with `reply()` (strings become `{ text }`, builders are converted with `toJSON()`).

**Interaction dispatch:** controller methods are decorated with `@Command(name|regex)`, `@Reaction(emoji)` or `@On(event)` (`fastwa/common/decorators/interaction`). `InteractionExplorer` registers them in the container by type. `InteractionDispatcher` (`core/interaction/interaction-dispatcher.ts`) hands each message to the active collectors first (an `exclusive` collector suppresses commands in its chat), then finds the matching command and runs it through `InteractionProxy`, which applies guards (`@UseGuards`) and pipes before invoking the handler. Guards read the message and adapter with `context.switchToAdapter().getMessage()` / `getAdapter()`.

**Parameter decorators:** `fastwa` only provides `@Args()` (command params) and `createParamDecorator()`. Decorators that read the message belong to the adapter, built with `createParamDecorator()`, so each platform returns its own types: `@fastwa/baileys` exports `@Message()` (the `WAMessage`), `@Content()`, `@Quoted()` (`proto.IMessage`), `@RemoteJid()` and `@RemoteJidAlt()`. Controller properties exposed by an adapter use `createAdapterPropertyDecorator()`; `@Socket()` is one, defined as a getter so it follows the socket after a reconnect.

**Collectors:** `CollectorModule` / `CollectorService` (`core/collectors`) wait for messages in a chat (`awaitMessage`, `awaitMessages`, `create`), matching `chatId` or `chatIdAlt`.

**Validation:** `ValidationPipe` loads `class-validator` and `class-transformer` with `loadPackage()` when it is created; both are optional peer dependencies.

## Samples

`sample/00-basics` and `sample/01-ai-sdk` are standalone projects (own `package.json`, CommonJS, depending on the packages through `file:../../packages/*`). Build the packages first (`npm run build` at the root), then `npm install && npm run dev` in the sample. Other directories under `sample/` are git-ignored. `sample/*/auth` holds a real WhatsApp session: do not run samples that would connect with it unless asked.

`MIGRATION.md` documents the changes from 1.x to 2.0; update it when changing public APIs.

## Conventions

- Prettier: single quotes, no trailing commas (`.prettierrc`); ESLint with `@typescript-eslint` + prettier config.
- In the packages, `strictNullChecks` and `noImplicitAny` are off; decorators and `emitDecoratorMetadata` are on. The published `.d.ts` files must type-check in apps with `strict` on.
- File naming follows NestJS style: `*.decorator.ts`, `*.interface.ts`, `*.enum.ts`, `*.service.ts`, with barrel `index.ts` files re-exporting each directory.
- Lerna versions all packages in lockstep (`lerna.json` version, currently 1.1.0; 2.0 is in preparation). Internal peer ranges (e.g. `fastwa` in `@fastwa/baileys`) must be updated by hand on major bumps.
- Code, comments, commits, PRs and docs are written in English.
- Commits follow Conventional Commits, are atomic, and end with the PR number (`fix(core): ... (#42)`). Breaking changes use `!` and a `BREAKING CHANGE:` footer. Samples are added in a single `chore(sample): ...` commit. Do not add co-author trailers.
- The default branch is `canary`.
