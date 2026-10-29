# fastwa

A framework for building WhatsApp chatbots with modules, controllers, providers and dependency injection, in the style of NestJS.

`fastwa` is platform-independent: it connects to WhatsApp through an adapter, such as [`@fastwa/baileys`](https://www.npmjs.com/package/@fastwa/baileys).

## Getting started

```bash
npx create-fastwa-app@latest
```

Or add it to an existing project:

```bash
npm install fastwa @fastwa/baileys @whiskeysockets/baileys@7.0.0-rc14 reflect-metadata
```

```ts
import 'reflect-metadata';

import { useMultiFileAuthState } from '@whiskeysockets/baileys';
import { Command, Controller, FastwaFactory, Module } from 'fastwa';
import { BaileysAdapter, Message } from '@fastwa/baileys';

@Controller()
class AppController {
  @Command('!hello')
  hello(@Message('pushName') name?: string) {
    return `Hello, ${name ?? 'there'}!`;
  }
}

@Module({ controllers: [AppController] })
class AppModule {}

async function bootstrap() {
  const { state, saveCreds } = await useMultiFileAuthState('auth');

  const app = await FastwaFactory.create(
    AppModule,
    new BaileysAdapter({ auth: state, saveCreds })
  );

  await app.listen();
}

bootstrap();
```

Enable `experimentalDecorators` and `emitDecoratorMetadata` in your `tsconfig.json`.

## Learn more

- [Documentation](https://fastwa.org/docs)
- [Migrating from 1.x](https://github.com/fastwa/fastwa/blob/canary/MIGRATION.md)

## License

[MIT](https://github.com/fastwa/fastwa/blob/canary/LICENSE)
