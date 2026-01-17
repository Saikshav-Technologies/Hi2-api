import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { config } from '../../config/env';
import { AppError } from '../../utils/errors';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let stack: string | undefined;

    if (exception instanceof AppError) {
      status = exception.statusCode;
      message = exception.message;
      if (config.env === 'development') {
        stack = exception.stack;
      }
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message || exception.message;
      if (config.env === 'development') {
        stack = exception.stack;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      if (config.env === 'development') {
        stack = exception.stack;
        console.error('Unexpected error:', exception);
      }
    }

    response.status(status).json({
      success: false,
      message,
      ...(config.env === 'development' && { stack }),
    });
  }
}
