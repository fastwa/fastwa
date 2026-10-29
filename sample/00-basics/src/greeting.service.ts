import { Injectable } from '@fastwa/common';

@Injectable()
export class GreetingService {
  greet(name: string) {
    return `Hello, ${name}! 👋`;
  }
}
