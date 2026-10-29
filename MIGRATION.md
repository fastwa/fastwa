# Migrating from 1.x to 2.0

Fastwa 2.0 separates the framework from the WhatsApp library it runs on. The framework is now the `fastwa` package, which has no Baileys dependency, and Baileys support lives in an adapter package, `@fastwa/baileys`. This is what lets other platforms, such as Meta's WhatsApp Cloud API, be added as adapters later.

## Requirements

- Node.js >= 20.19.0
- [Baileys](https://github.com/WhiskeySockets/Baileys) 7 (`@whiskeysockets/baileys@7.0.0-rc14`). Read the official [v7 migration guide](https://baileys.wiki/migration/v7#v7-migration); for Fastwa apps, the main change is LIDs (see [JIDs and LIDs](#jids-and-lids)).

## Packages

| 1.x | 2.0 |
|---|---|
| `@fastwa/common` | `fastwa` |
| `@fastwa/core` | `fastwa` |
| `@fastwa/client` | `@fastwa/baileys` |
| `@fastwa/builders` | `@fastwa/builders` (unchanged) |
| `@fastwa/schedule` | `@fastwa/schedule` (unchanged) |

```bash
npm uninstall @fastwa/common @fastwa/core @fastwa/client
npm install fastwa @fastwa/baileys @whiskeysockets/baileys@7.0.0-rc14
```

Packages only expose their entry point, so deep imports such as `@fastwa/core/guards` no longer work. Import everything from `fastwa` or `@fastwa/baileys`.

New projects can start from `npx create-fastwa-app@latest`.

## Bootstrap

`FastwaFactory.create()` takes an adapter instead of Baileys socket options. The adapter takes the same options, and `saveCreds` replaces `app.useSaveCreds()`.

```ts
// 1.x
import { FastwaFactory } from '@fastwa/core';

const app = await FastwaFactory.create(AppModule, {
  auth: state,
  saveCreds,
  version
});

// 2.0
import { FastwaFactory } from 'fastwa';
import { BaileysAdapter } from '@fastwa/baileys';

const app = await FastwaFactory.create(
  AppModule,
  new BaileysAdapter({ auth: state, saveCreds, version })
);
```

- `app.useSaveCreds()` was removed; pass `saveCreds` to `BaileysAdapter`.
- `app.close()` closes the connection.
- `SocketOptions` is now `BaileysAdapterOptions`.
- Fastwa does not render QR codes, and Baileys deprecated `printQRInTerminal`. Handle the `qr` field of `connection.update` yourself, e.g. with `qrcode-terminal`:

```ts
@On('connection.update')
onConnectionUpdate({ qr }: { qr?: string }) {
  if (qr) qrcode.generate(qr, { small: true });
}
```

## Messages

Adapters convert what they receive into a `FastwaMessage`, the same shape on every platform. Guards, pipes, collectors and custom parameter decorators receive it instead of Baileys' `WAMessage`:

| Field | Description |
|---|---|
| `id` | Message ID |
| `chatId` | Chat the message belongs to: the user in private chats, the group otherwise. JIDs are normalized (no device suffix). |
| `chatIdAlt` | The same chat in the other JID format (LID or phone number), when known |
| `senderId` | Author of the message; the participant in groups |
| `senderName` | Author's display name (Baileys' `pushName`) |
| `fromMe`, `isGroup` | |
| `text` | Text, media caption or reaction emoji |
| `quoted` | Message being replied to: `{ id, senderId, text, raw }` |
| `reaction` | Set for reactions: `{ emoji, targetId }` |
| `timestamp` | Unix time in milliseconds |
| `platform` | `'baileys'` |
| `raw` | The original `WAMessage` |

## Decorators

Decorators that read the message now come from the adapter, so each platform returns its own types. `fastwa` keeps the framework decorators (`@Module()`, `@Controller()`, `@Injectable()`, `@Command()`, `@Reaction()`, `@On()`, `@UseGuards()`, `@Args()`).

| 1.x | 2.0 |
|---|---|
| `@Message()`, `@Content()`, `@Quoted()` | Same names and values, imported from `@fastwa/baileys` |
| `@RemoteJid()`, `@RemoteJidAlt()` | Same names, imported from `@fastwa/baileys` |
| `@Socket()` | Imported from `@fastwa/baileys`. The property now follows the socket after a reconnect |
| `@On(event)` | Unchanged. It accepts any event name; `WAEvent` is imported from `@fastwa/baileys` |
| `@Poll()`, `@Vote()` | Removed; they were never wired |

```ts
// 1.x
import { Command, Controller, Message, RemoteJid } from '@fastwa/common';

// 2.0
import { Command, Controller } from 'fastwa';
import { Message, RemoteJid } from '@fastwa/baileys';
```

Custom parameter decorators can be created with `createParamDecorator()`, which receives the `FastwaMessage`:

```ts
import { createParamDecorator, FastwaMessage } from 'fastwa';

export const Words = createParamDecorator(
  (_, message: FastwaMessage) => message.text?.split(/\s+/) ?? []
);
```

`WAEvent`, `BaileysMimetype`, `WAPresence`, `MuteExpression`, `SocketConnectionState` and `ReactionMessage` moved to `@fastwa/baileys`.

`WAEvent` was synced with Baileys 7: `CHATS_SET`, `CONTACTS_SET`, `MESSAGES_SET` and `CONTACTS_DELETE` were removed (use `MESSAGING_HISTORY_SET`), the receipt event is now `MESSAGE_RECEIPT_UPDATE` (`MESSAGES_RECEIPT_UPDATE` is a deprecated alias), and the missing Baileys 7 events were added.

## Guards

`switchToAdapter().getMessage()` returns the `FastwaMessage`, and `getSocket()` was replaced by `getAdapter()`:

```ts
// 1.x
const { remoteJid, fromMe } = context.switchToAdapter().getMessage().key;
const socket = context.switchToAdapter().getSocket();

// 2.0
const { chatId, fromMe } = context.switchToAdapter().getMessage<FastwaMessage>();
const { socket } = context.switchToAdapter().getAdapter<BaileysAdapter>();
```

All guards in `@UseGuards()` are now evaluated, in order; in 1.x only the first one decided.

## Collectors

`createMessageCollector()` was replaced by `CollectorService`. Import `CollectorModule` and inject the service:

```ts
import { CollectorModule, CollectorService, Command, Controller, Module } from 'fastwa';
import { RemoteJid } from '@fastwa/baileys';

@Module({ imports: [CollectorModule], controllers: [AppController] })
export class AppModule {}

@Controller()
export class AppController {
  constructor(private readonly collector: CollectorService) {}

  @Command('!name')
  async askName(@RemoteJid() jid: string) {
    const reply = await this.collector.awaitMessage(jid, { time: 30_000 });
    return reply ? `Hello, ${reply.text}!` : 'Time is up.';
  }
}
```

- `awaitMessage()` resolves with the next message, or `undefined` on timeout; `awaitMessages()` resolves with the collected messages.
- `create()` returns a collector with `collect` and `end` events, and the `filter`, `time`, `idle`, `max` and `exclusive` options. While an `exclusive` collector is active, messages from its chat do not trigger commands.
- Collectors take the chat JID (e.g. from `@RemoteJid()`) and match either format, LID or phone number.

## Dependency injection

- Circular dependencies fail with a `CircularDependencyException` that shows the cycle. Declare intentional cycles with `forwardRef()`.
- Undefined constructor dependencies (e.g. a type-only import) fail with an `UnknownDependencyException`.
- `@Inject()` works on any constructor parameter, including the first one.
- Bootstrap errors are reported instead of aborting the process.

## JIDs and LIDs

With Baileys 7, the chat JID (`@RemoteJid()`) may be a LID (`123@lid`) instead of a phone number JID. `@RemoteJidAlt()` and `chatIdAlt` hold the other format, and collectors match both. Compare JIDs with Baileys' `areJidsSameUser()`, or compare `chatId`/`chatIdAlt`, which are normalized. Custom auth stores must support the `lid-mapping`, `device-list` and `tctoken` keys; `useMultiFileAuthState` already does.

## Other behavior changes

- `BaileysAdapter` reconnects after any disconnection except a logout, as Baileys recommends. In 1.x it reconnected only when a restart was required, and also after a logout.
- Only messages received while connected (`messages.upsert` with type `notify`) trigger commands; messages from history sync no longer do.
- Messages without text, e.g. stickers or media without a caption, no longer match commands.
- Commands without named params (e.g. `!help`) no longer crash.
- Message text is read from ephemeral, view-once and edited messages and from captions.
- The startup banner shows the Fastwa version.
