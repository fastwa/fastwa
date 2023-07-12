import { AnyMessageContent } from '@whiskeysockets/baileys';

export abstract class ComponentBuilder<APIComponent> {
  public readonly data: APIComponent;

  public constructor(data?: APIComponent) {
    this.data = data;
  }

  abstract toJSON(): AnyMessageContent;
}
