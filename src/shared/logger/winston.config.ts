import { AppConfig } from '../../config/app.config';
import { createLogger, transports, format } from 'winston';

export class WinstonConfig {
  createLogger() {
    const uppercaseLevel = () =>
      format((info) => {
        if (info.level) info.level = info.level.toString().toUpperCase();
        return info;
      })();

    const customFormat = format.printf((info) => {
      const timestamp = String(info.timestamp ?? new Date().toISOString());
      const level = String(info.level ?? 'info');
      const message = String(info.stack ?? info.message ?? '');
      const context = info.context ? `- CONTEXT: ${String(info.context)}` : '';
      const trace = info.trace ? `\n${String(info.trace)}` : '';
      return `[NEST] - ${timestamp} - [${level}] - ${message} ${context}${trace}`.trim();
    });

    const consoleFormat = format.combine(
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      uppercaseLevel(),
      format.colorize({ all: true }),
      format.errors({ stack: true }),
      customFormat,
    );

    const fileFormat = format.combine(
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      uppercaseLevel(),
      format.errors({ stack: true }),
      customFormat,
    );

    const transportsList: any[] = [
      new transports.Console({
        level: AppConfig.LOGGER.CONSOLE_LEVEL,
        format: consoleFormat,
      }),
    ];

    const exceptionHandlersList: any[] = [
      new transports.Console({ format: consoleFormat }),
    ];

    const rejectionHandlersList: any[] = [
      new transports.Console({ format: consoleFormat }),
    ];

    if (AppConfig.NODE_ENV === 'production') {
      const fileTransport = new transports.File({
        filename: 'logs/app.log',
        level: 'info',
        format: fileFormat,
        maxsize: 50 * 1024 * 1024,
        maxFiles: 14,
      });

      transportsList.push(fileTransport);
      exceptionHandlersList.push(fileTransport);
      rejectionHandlersList.push(fileTransport);
    }

    return createLogger({
      level: AppConfig.NODE_ENV === 'production' ? 'info' : 'silly',
      transports: transportsList,
      exceptionHandlers: exceptionHandlersList,
      rejectionHandlers: rejectionHandlersList,
    });
  }
}
