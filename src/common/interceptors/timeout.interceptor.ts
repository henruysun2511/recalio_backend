import { RequestTimeoutException, UseInterceptors } from '@nestjs/common';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';

export function TimeoutInterceptor(ms: number) {
  return UseInterceptors({
    intercept: (
      context: ExecutionContext,
      next: CallHandler,
    ): Observable<any> => {
      return next.handle().pipe(
        timeout({
          each: ms,
          with: () => {
            throw new RequestTimeoutException('Request timed out');
          },
        }),
      );
    },
  });
}
