import { colors } from '@fastwa/common/utils';
import { Injectable } from '../decorators';

@Injectable()
export class Logger {
  constructor(private readonly context: string) {}

  public log(message: string) {
    const formattedMessage = this.formatMessage(message);
    process.stdout.write(formattedMessage);
  }

  public info(message: string) {
    const formattedMessage = this.formatMessage(
      `${colors.green(`✓`)} ${message}`
    );

    process.stdout.write(formattedMessage);
  }

  protected formatMessage(message: string) {
    return ` ${message}\n`;
  }
}
