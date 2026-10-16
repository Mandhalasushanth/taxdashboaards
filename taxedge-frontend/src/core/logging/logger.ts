import { environment } from '../config/environment';

type LogContext = Record<string, unknown> | undefined;

/** Thin logging facade: verbose in development, errors only in production. */
function debug(message: string, context?: LogContext): void {
  if (!environment.isProduction) {
    console.debug(`[TaxEdge] ${message}`, context ?? '');
  }
}

function warn(message: string, context?: LogContext): void {
  if (!environment.isProduction) {
    console.warn(`[TaxEdge] ${message}`, context ?? '');
  }
}

function error(message: string, cause?: unknown): void {
  console.error(`[TaxEdge] ${message}`, cause ?? '');
}

export const logger = Object.freeze({ debug, warn, error });
