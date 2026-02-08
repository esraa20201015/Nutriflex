import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * Transforms validation exceptions (e.g. from class-validator) into a consistent API response format.
 */
@Catch()
export class ValidationExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ValidationExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let errorDetails: unknown = null;

    if (exception && typeof exception === 'object' && 'getStatus' in exception) {
      const nestException = exception as { getStatus: () => number; getResponse: () => unknown };
      status = nestException.getStatus();
      const res = nestException.getResponse();
      if (typeof res === 'object' && res !== null) {
        if ('message' in res) {
          message = (res as { message: string | string[] }).message;
        }
        if ('messageEn' in res) {
          message = (res as { messageEn: string }).messageEn;
        }
        if ('error' in res) {
          errorDetails = (res as { error: unknown }).error;
        }
      } else if (typeof res === 'string') {
        message = res;
      }
    } else if (exception instanceof Error) {
      // Log the actual error for debugging
      this.logger.error(`Unhandled exception: ${exception.message}`, exception.stack);
      message = exception.message || 'Internal server error';
      errorDetails = exception.stack;
    }

    // Log error details for debugging
    this.logger.error(
      `HTTP error ${status}: ${JSON.stringify(message)}`,
      errorDetails ? JSON.stringify(errorDetails) : exception instanceof Error ? exception.stack : undefined,
    );

    const responseBody: {
      statusCode: number;
      message: string | string[];
      error: string;
      details?: unknown;
    } = {
      statusCode: status,
      message,
      error: status === HttpStatus.BAD_REQUEST ? 'Bad Request' : 'Error',
    };

    if (process.env.NODE_ENV !== 'production' && errorDetails) {
      responseBody.details = errorDetails;
    }

    response.status(status).json(responseBody);
  }
}
