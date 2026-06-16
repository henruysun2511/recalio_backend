import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { AppConfig } from '../../config/app.config';
import { ApiResponse } from '../interfaces/api-response.interface';
import { CustomLogger } from '../../infrastructures/logger/logger.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: CustomLogger) {
    logger.setContext(GlobalExceptionFilter.name);
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    let status: number;
    let messageKey: string;
    let details: unknown = null;

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          status = HttpStatus.CONFLICT;
          messageKey = 'Dữ liệu đã tồn tại';
          details = { field: exception.meta?.target };
          break;
        case 'P2025':
          status = HttpStatus.NOT_FOUND;
          messageKey = 'Không tìm thấy dữ liệu';
          break;
        case 'P2003':
          status = HttpStatus.BAD_REQUEST;
          messageKey = 'Dữ liệu liên quan không tồn tại';
          break;
        default:
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          messageKey = 'Database error';
          details = AppConfig.IS_DEV ? exception.message : null;
      }
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      messageKey = 'Dữ liệu không hợp lệ';
      details = AppConfig.IS_DEV ? exception.message : null;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        messageKey = exceptionResponse || this.getMessageKeyFromStatus(status);
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as Record<string, unknown>;
        if (Array.isArray(responseObj.message)) {
          messageKey = responseObj.message[0];
        } else {
          messageKey =
            (typeof responseObj.message === 'string'
              ? responseObj.message
              : null) ||
            (typeof responseObj.response === 'string'
              ? responseObj.response
              : null) ||
            this.getMessageKeyFromStatus(status);
        }
        details = responseObj.details || null;
      } else {
        messageKey = this.getMessageKeyFromStatus(status);
      }
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      messageKey = 'Internal server error';
      details = AppConfig.IS_DEV ? exception.message : null;
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      messageKey = 'Internal server error';
    }

    const errorResponse: ApiResponse<unknown> = {
      success: false,
      message: messageKey,
      data: details,
    };

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url} - ${status} - ${messageKey}`,
        exception instanceof Error ? exception.stack : exception,
      );
    } else {
      this.logger.debug(
        `${request.method} ${request.url} - ${status} - ${messageKey}`,
        exception instanceof Error ? exception.stack : exception,
      );
    }

    response.status(status).json(errorResponse);
  }

  private getMessageKeyFromStatus(status: HttpStatus): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'Bad request';
      case HttpStatus.UNAUTHORIZED:
        return 'Unauthorized';
      case HttpStatus.FORBIDDEN:
        return 'Forbidden';
      case HttpStatus.NOT_FOUND:
        return 'Resource not found';
      case HttpStatus.CONFLICT:
        return 'Conflict occurred';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'Validation error';
      case HttpStatus.SERVICE_UNAVAILABLE:
        return 'Service unavailable';
      default:
        return 'Internal server error';
    }
  }
}
