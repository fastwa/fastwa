import { ITemplateButton } from "./template-button.interface";

export interface ITemplateMessage {
  text: string;
  footer: string;
  templateButtons: ITemplateButton[];
}
