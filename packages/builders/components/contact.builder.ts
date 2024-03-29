import { IContactOptions } from '../interfaces';
import { ComponentBuilder } from './component';

export class ContactBuilder extends ComponentBuilder<IContactOptions> {
  constructor(options?: IContactOptions) {
    super(options || ({} as IContactOptions));
  }

  setId(id: string) {
    this.data.id = id;
    return this;
  }

  setOrg(org: string) {
    this.data.org = org;
    return this;
  }

  setFullName(fullName: string) {
    this.data.fullName = fullName;
    return this;
  }

  setPhoneNumber(phoneNumber: string) {
    this.data.phoneNumber = phoneNumber;
    return this;
  }

  get vcard() {
    const vcard =
      'BEGIN:VCARD\n' +
      'VERSION:3.0\n' +
      `FN:${this.data.fullName}\n` +
      `ORG:${this.data.org};\n` +
      `TEL;type=CELL;type=VOICE;` +
      `waid=${this.data.id}` +
      `:${this.data.phoneNumber}\n` +
      `END:VCARD`;

    return vcard;
  }

  toJSON() {
    return {
      contacts: {
        displayName: this.data.fullName,
        contacts: [{ vcard: this.vcard }]
      }
    };
  }
}
