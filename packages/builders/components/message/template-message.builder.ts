import { ComponentBuilder } from '../component';
import { ITemplateButton, ITemplateMessage } from '../../interfaces';

export class TemplateMessageBuilder extends ComponentBuilder<ITemplateMessage> {
  public readonly templateButtons = new Array<ITemplateButton>();

  constructor(data?: ITemplateMessage) {
    super(data || {} as ITemplateMessage);
  }

  setText(text: string) {
    this.data.text = text;
    return this
  }

  setFooter(footer: string) {
    this.data.footer = footer;
    return this
  }

  addComponents(...buttons: ITemplateButton[]) {
    this.templateButtons.push(...buttons);
    return this;
  }

  toJSON() {
    return {
      ...this.data,
      templateButtons: this.templateButtons
    };
  }
}
