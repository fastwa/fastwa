# Create Fastwa App

The easiest way to get started with [Fastwa](https://github.com/fastwa/fastwa) is by using `create-fastwa-app`. It sets up a WhatsApp bot with TypeScript, a module, a controller and a service, ready to pair with your account.

```bash
npx create-fastwa-app@latest
# or
pnpm create fastwa-app
# or
yarn create fastwa-app
# or
bunx create-fastwa-app
```

You will be asked for the name of your project. To create it in a specific directory, pass the name as an argument:

```bash
npx create-fastwa-app@latest my-bot
```

## Options

| Option | Description |
|---|---|
| `--use-npm` | Bootstrap the application using npm |
| `--use-pnpm` | Bootstrap the application using pnpm |
| `--use-yarn` | Bootstrap the application using Yarn |
| `--use-bun` | Bootstrap the application using Bun |
| `--skip-install` | Skip installing dependencies |
| `--disable-git` | Skip initializing a git repository |
| `-y, --yes` | Use the defaults for any missing answer |
| `-v, --version` | Output the current version |
| `-h, --help` | Display the help message |

Without a `--use-*` option, the package manager that ran the command is used.

## Requirements

- Node.js >= 20.19.0
