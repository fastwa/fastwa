import { 
  DownloadableMessage,
  downloadContentFromMessage
} from "@adiwajshing/baileys";

import { ExifFactory } from "./exif-factory";
import { IWAStickerOptions } from "../../interfaces";

export class StickerBuilder {
  private data: DownloadableMessage;
  private options: IWAStickerOptions = {};

  constructor(data: DownloadableMessage) {
    this.data = data
  }
  
  public setPack(pack: string) {
    this.options.pack = pack;
    return this;
  }
  
  public setAuthor(author: string) {
    this.options.author = author;
    return this;
  }
  
  public setId(id: string) {
    this.options.id = id;
    return this;
  }
  
  public async build() {
    const exifFactory = new ExifFactory(this.options);

    const stream = await downloadContentFromMessage(
      this.data,
      'image'
    );

    let buffer = Buffer.from([])

    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk])
    }

    return exifFactory.build(buffer)
  }
}