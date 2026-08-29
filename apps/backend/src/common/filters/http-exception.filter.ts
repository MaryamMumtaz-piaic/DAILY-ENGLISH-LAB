import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message: string | string[];
    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (typeof exceptionResponse === 'object') {
      message = (exceptionResponse as any).message || 'An error occurred';
    } else {
      message = 'An error occurred';
    }

    const errorMessage = Array.isArray(message) ? message.join('; ') : message;

    this.logger.error(
      `${request.method} ${request.url} ${status} - ${errorMessage}`,
    );

    response.status(status).json({
      success: false,
      data: null,
      error: {
        code: status,
        message: errorMessage,
      },
    });
  }
}
