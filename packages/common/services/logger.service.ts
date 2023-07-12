import { colors } from '@fastwa/common/utils';
import { Injectable } from '../decorators';

@Injectable()
export class Logger {
  constructor(private readonly context: string) {}

  public log(message: string) {
    const pid = this.getPid();
    const timestamp = this.getTimestamp();

    const messageToLog = colors.green(message);
    const context = colors.yellow(`[${this.context}]`);

    const formattedMessage = this.formatMessage(
      pid,
      timestamp,
      context,
      messageToLog
    );

    process.stdout.write(formattedMessage);
  }

  protected getPid() {
    return colors.green(`[Fastwa] ${process.pid}  - `);
  }

  protected getTimestamp() {
    return new Date().toLocaleString();
  }

  protected formatMessage(
    pid: string,
    timestamp: string,
    context: string,
    message: string
  ) {
    return `${pid}${timestamp} ${context} ${message}\n`;
  }
}
