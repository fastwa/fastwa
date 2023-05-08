import { colors } from '@fastwa/common/utils';

export class LoggerService {
  context: string;

  constructor(context?: string) {
    this.context = context;
  }

  log(message: string, streamType?: 'stdout' | 'stderr') {
    const pid = this.getPid();
    const timestamp = this.getTimestamp();

    const messageToLog = colors.green(message);
    const contextMessage = colors.yellow(`[${this.context}]`);
    const formattedTimestamp = colors.green(timestamp);

    const formattedMessage = this.formatMessage(
      pid,
      formattedTimestamp,
      contextMessage,
      messageToLog
    );

    process[streamType ?? 'stdout'].write(formattedMessage);
  }

  protected getPid() {
    return colors.green(`[@fastwa] ${process.pid}  - `);
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
