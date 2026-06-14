import { ConsoleLogger, Injectable } from '@nestjs/common';
import { Logger as WinstonLogger } from 'winston';

@Injectable()
export class CustomLogger extends ConsoleLogger {
  constructor(private readonly winstonLogger: WinstonLogger) {
    super();
  }

  log(message: any, context?: string) {
    this.winstonLogger.info(message, { context });
  }

  error(
    message: string,
    trace?: any,
    context?: string,
    meta?: Record<string, any>,
  ) {
    // super.error(message, trace, context);
    this.winstonLogger.error(message, {
      context,
      trace: trace instanceof Error ? trace.stack : trace,
      ...meta,
    });
  }

  warn(message: any, context?: string) {
    // super.warn(message, context);
    this.winstonLogger.warn(message, { context });
  }

  debug(message: any, trace?: any, context?: string) {
    // super.debug(message, context);
    this.winstonLogger.debug(message, {
      context,
      trace: trace instanceof Error ? trace.stack : trace,
    });
  }

  verbose(message: any, context?: string, payload?: string) {
    // super.verbose(message, context);
    this.winstonLogger.verbose(message, { context, payload });
  }
}
