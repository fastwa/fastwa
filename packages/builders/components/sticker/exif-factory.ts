import * as sharp from 'sharp';

import { Image } from 'node-webpmux';
import { TextEncoder } from "util";

import { ExifMetadata } from "./exif-metadata";
import { IWAStickerOptions } from "../../interfaces";


export class ExifFactory {
  textEncoder: TextEncoder;
  stickerMetadata: ExifMetadata;

  constructor(options: IWAStickerOptions) {
    this.textEncoder = new TextEncoder();
    this.stickerMetadata = new ExifMetadata(options);
  }

  public async convertToWebp(image: Buffer) {
    return sharp(image)
      .toFormat('webp')
      .toBuffer()
  }

  public buildExif() {
    const data = JSON.stringify(this.stickerMetadata);
    
    const dataBuffer = Buffer.from(data, 'utf-8');
    const exifBuffer = Buffer.from([
      0x49, 0x49, 0x2a, 0x00, 0x08, 0x00,
      0x00, 0x00, 0x01, 0x00, 0x41, 0x57,
      0x07, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x16, 0x00, 0x00, 0x00
    ])

    const exif = Buffer.concat([exifBuffer, dataBuffer]);
    exif.writeUIntLE(this.textEncoder.encode(data).length, 14, 4);

    return exif;
  }

  public async build(image: Buffer) {
    const exif = this.buildExif();
    const sticker = new Image();

    const webpImage = await this.convertToWebp(image);

    await sticker.load(webpImage);
    sticker.exif = exif;

    return await sticker.save(null);
  }
}
