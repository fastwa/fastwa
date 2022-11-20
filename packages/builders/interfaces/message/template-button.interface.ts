export interface IURLButton {
  displayText: string;
  url: string;
}

export interface ICallButton {
  displayText: string;
  phoneNumber: string;
}

export interface IQuickReplyButton {
  id: string;
  displayText: string;
}

export interface ITemplateButton {
  index: number;
  urlButton?: IURLButton;
  callButton?: ICallButton;
  quickReplyButton?: IQuickReplyButton;
}
