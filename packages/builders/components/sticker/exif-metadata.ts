import { IWAStickerOptions } from '@fastwa/builders';

export class ExifMetadata {
  'sticker-pack-id': string;
  'sticker-pack-name': string;
  'sticker-pack-publisher': string;

  constructor({ id, pack, author }: IWAStickerOptions) {
    this['sticker-pack-id'] = id;
    this['sticker-pack-name'] = pack;
    this['sticker-pack-publisher'] = author;
  }
}
