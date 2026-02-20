import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client';
// #region agent log
const _debugLog = (data: object) => { try { console.error('[DEBUG_FILTER]', JSON.stringify({ ...data, timestamp: Date.now() })); } catch {} };
// #endregion

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Ein interner Fehler ist aufgetreten';
    let error = 'Internal Server Error';

    // HTTP Exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = typeof exceptionResponse === 'string' 
        ? exceptionResponse 
        : (exceptionResponse as any).message || message;
      error = exception.name;
    }
    // Prisma Errors
    else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002': { // Unique constraint violation
          const field = (exception.meta?.target as string[])?.join(', ') || 'unbekannt';
          console.error(`[P2002] Unique constraint on field: ${field}`);
          status = HttpStatus.CONFLICT;
          message = `Eintrag existiert bereits (Konfliktfeld: ${field})`;
          error = 'Conflict';
          break;
        }
        case 'P2025': // Record not found
          status = HttpStatus.NOT_FOUND;
          message = 'Eintrag nicht gefunden';
          error = 'Not Found';
          break;
        case 'P2003': // Foreign key constraint
          status = HttpStatus.BAD_REQUEST;
          message = 'Verknüpfte Daten vorhanden - Löschen nicht möglich';
          error = 'Bad Request';
          break;
        case 'P2014': // Required relation missing
          status = HttpStatus.BAD_REQUEST;
          message = 'Erforderliche Verknüpfung fehlt';
          error = 'Bad Request';
          break;
        default:
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          message = 'Datenbankfehler';
          error = 'Database Error';
      }
    }
    // Prisma Validation Errors
    else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Ungültige Daten';
      error = 'Validation Error';
    }
    // Unknown errors
    else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
    }

    // Log 5xx errors with stack trace
    if (status >= 500) {
      this.logger.error(
        `[${status}] ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : exception,
      );
    }

    // #region agent log
    if (request.url?.includes('/recruiting/jobs') && request.method === 'POST') {
      _debugLog({
        location: 'global-exception.filter.ts:catch',
        hypothesisId: 'H-A,H-B,H-C,H-D',
        message: 'Exception caught for POST /recruiting/jobs',
        data: {
          exceptionType: (exception as any)?.constructor?.name,
          exceptionMessage: exception instanceof Error ? exception.message?.substring(0, 500) : String(exception),
          httpStatus: status,
          responseMessage: message,
        },
      });
    }
    // #endregion

    response.status(status).json({
      statusCode: status,
      error,
      message: Array.isArray(message) ? message : [message],
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
