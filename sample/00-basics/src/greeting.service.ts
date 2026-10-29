import { Injectable } from 'fastwa';

@Injectable()
export class GreetingService {
  greet(name: string) {
    return `Hello, ${name}! 👋`;
  }
}
