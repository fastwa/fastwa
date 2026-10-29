import { generateText, stepCountIs, type UserContent } from 'ai';
import { anthropic, type AnthropicProviderOptions } from '@ai-sdk/anthropic';

import { Injectable } from 'fastwa';
import type { WAMessage, WASocket } from '@whiskeysockets/baileys';

import { createTools } from './ai.tools';

const INSTRUCTIONS = `You are a helpful assistant answering messages on WhatsApp.
Keep answers short and conversational. Use WhatsApp formatting only:
*bold*, _italic_, ~strikethrough~ and plain lists. Never use Markdown headings, tables or links syntax.`;

interface AskOptions {
  prompt: string;
  image?: { data: Buffer; mediaType: string };
  socket: WASocket;
  message: WAMessage;
}

@Injectable()
export class AiService {
  async ask({ prompt, image, socket, message }: AskOptions) {
    const content: UserContent = [{ type: 'text', text: prompt }];

    if (image) {
      content.unshift({ type: 'file', ...image });
    }

    const { text } = await generateText({
      model: anthropic('claude-opus-5-5'),
      instructions: INSTRUCTIONS,
      messages: [{ role: 'user', content }],
      tools: createTools({ socket, message }),
      stopWhen: stepCountIs(5),
      providerOptions: {
        anthropic: {
          // Chat answers rarely need deep reasoning; keeps replies fast
          effort: 'low',
          // If the model declines, retry on a fallback model in the same call
          fallbacks: 'default'
        } satisfies AnthropicProviderOptions
      }
    });

    return text;
  }
}
