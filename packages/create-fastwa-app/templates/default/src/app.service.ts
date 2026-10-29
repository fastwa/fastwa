import { Injectable } from '@fastwa/common';

@Injectable()
export class AppService {
  greet(name: string) {
    return `Hello, ${name}! 👋`;
  }
}
