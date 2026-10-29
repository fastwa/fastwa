import { Injectable } from 'fastwa';

@Injectable()
export class AppService {
  greet(name: string) {
    return `Hello, ${name}! 👋`;
  }
}
