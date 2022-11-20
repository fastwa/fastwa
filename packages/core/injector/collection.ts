import { ICommand } from "@playwa/common";

export class CollectionContainer {
  private readonly _events = new Map<string, ICommand>();
  private readonly _buttons = new Map<string, ICommand>();
  private readonly _commands = new Map<string, ICommand>();

  get events() {
    return this._events;
  }

  get commands() {
    return this._commands;
  }

  get buttons() {
    return this._buttons;
  }

  public addEvent(
    name: string,
    event: ICommand
  ) {
    this._events.set(name, event);
    return event
  }

  public addCommand(
    name: string,
    command: ICommand
  ) {
    if (this._commands.has(name)) {
      throw new Error(`Command ${name} already exists`);
    }

    this._commands.set(name, command);
    return command
  }

  public addButton(
    name: string,
    command: ICommand
  ) {
    if (this._buttons.has(name)) {
      throw new Error(`Button ID ${name} already exists`);
    }

    this._buttons.set(name, command);
    return command
  }
}
