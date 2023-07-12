import { Interaction } from '@fastwa/common';

export class CollectionContainer {
  private readonly _events = new Map<string, Interaction>();
  private readonly _commands = new Map<string, Interaction>();
  private readonly _reactions = new Map<string, Interaction>();

  get events() {
    return this._events;
  }

  get reactions() {
    return this._reactions;
  }

  get commands() {
    return this._commands;
  }

  public addEvent(name: string, event: Interaction) {
    this._events.set(name, event);
    return event;
  }

  public addReaction(name: string, command: Interaction) {
    if (this._reactions.has(name)) {
      throw new Error(`Command ${name} already exists`);
    }

    this._reactions.set(name, command);
    return command;
  }

  public addCommand(name: string, command: Interaction) {
    if (this._commands.has(name)) {
      throw new Error(`Command ${name} already exists`);
    }

    this._commands.set(name, command);
    return command;
  }
}
