# @fastwa/baileys

[Baileys](https://github.com/WhiskeySockets/Baileys) adapter for [fastwa](https://www.npmjs.com/package/fastwa): connects a fastwa app to WhatsApp through the WhatsApp Web protocol.

```bash
npm install fastwa @fastwa/baileys @whiskeysockets/baileys@7.0.0-rc14
```

## Usage

```ts
import { useMultiFileAuthState } from '@whiskeysockets/baileys';
import { FastwaFactory } from 'fastwa';
import { BaileysAdapter } from '@fastwa/baileys';

const { state, saveCreds } = await useMultiFileAuthState('auth');

const app = await FastwaFactory.create(
  AppModule,
  new BaileysAdapter({ auth: state, saveCreds })
);

await app.listen();
```

`BaileysAdapter` takes [Baileys' socket options](https://baileys.wiki) plus `saveCreds`, called on every `creds.update`. It does not render QR codes: handle the `qr` field of `connection.update` with `@On('connection.update')`.

## Decorators and APIs

| API | Description |
|---|---|
| `@Message(property?)` | The `WAMessage` as received, or one of its properties |
| `@Content()` | Text, media caption or reaction emoji |
| `@Quoted()` | The message being replied to (`proto.IMessage`) |
| `@RemoteJid()`, `@RemoteJidAlt()` | The chat JID as received and its alternate format (LID or phone number) |
| `@Socket()` | Controller property with the current Baileys socket; it follows the socket after a reconnect |
| `WAEvent` | Baileys event names, for `@On()` |
| `toFastwaMessage()` | Converts a `WAMessage` into a `FastwaMessage` |

Framework decorators (`@Controller()`, `@Command()`, `@On()`, `@UseGuards()`, `@Args()`...) come from `fastwa`.

## License

[MIT](https://github.com/fastwa/fastwa/blob/canary/LICENSE)
