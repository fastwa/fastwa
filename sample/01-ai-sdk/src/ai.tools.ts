import { tool } from 'ai';
import { z } from 'zod';

import type { WAMessage, WASocket } from '@whiskeysockets/baileys';

interface ToolsContext {
  socket: WASocket;
  message: WAMessage;
}

export function createTools({ socket, message }: ToolsContext) {
  return {
    getCurrentDateTime: tool({
      description: 'Get the current date and time.',
      inputSchema: z.object({
        timeZone: z
          .string()
          .optional()
          .describe(
            'IANA time zone, e.g. "America/Sao_Paulo". Defaults to UTC.'
          )
      }),
      execute: async ({ timeZone = 'UTC' }) => ({
        timeZone,
        dateTime: new Date().toLocaleString('en-US', {
          timeZone,
          dateStyle: 'full',
          timeStyle: 'long'
        })
      })
    }),

    reactToMessage: tool({
      description:
        "React with an emoji to the user's WhatsApp message, e.g. to acknowledge it or express a feeling.",
      inputSchema: z.object({
        emoji: z.string().describe('A single emoji, e.g. "👍"')
      }),
      execute: async ({ emoji }) => {
        await socket.sendMessage(message.key.remoteJid!, {
          react: { text: emoji, key: message.key }
        });

        return { reacted: emoji };
      }
    })
  };
}
