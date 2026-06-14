import { Module } from '@nestjs/common';

import { CustomLogger } from './logger.service';
import { WinstonConfig } from './winston.config';

// Nếu bạn muốn module này là global độc lập (không cần SharedModule),
// bỏ comment dòng @Global() và bỏ comment ở import ở trên.
// @Global()
@Module({
  providers: [
    {
      provide: 'WINSTON',
      useFactory: () => {
        const winstonConfig = new WinstonConfig();
        return winstonConfig.createLogger();
      },
      inject: [],
    },
    {
      provide: CustomLogger,
      useFactory: (winston) => new CustomLogger(winston),
      inject: ['WINSTON'],
    },
  ],
  exports: ['WINSTON', CustomLogger],
})
export class LoggerModule {}
