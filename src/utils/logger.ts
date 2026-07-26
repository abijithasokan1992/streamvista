type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  userId?: string;
  role?: string;
  feature?: string;
  [key: string]: any;
}

class Logger {
  private static instance: Logger;
  private isDevelopment = typeof import.meta !== 'undefined' && import.meta?.env ? import.meta.env.MODE === 'development' : true;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    return {
      timestamp,
      level,
      message,
      context,
      environment: (typeof import.meta !== 'undefined' && import.meta?.env ? import.meta.env.MODE : 'development'),
    };
  }

  private sendToTelemetry(payload: any) {
    // In production, this would dispatch to Datadog / Sentry / Google Analytics
    // e.g. fetch('/api/telemetry', { method: 'POST', body: JSON.stringify(payload) })
    if (!this.isDevelopment) {
      // Mocking telemetry for now
      // console.log('[TELEMETRY DISPATCH]', payload);
    }
  }

  info(message: string, context?: LogContext) {
    const payload = this.formatMessage('info', message, context);
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, context || '');
    }
    this.sendToTelemetry(payload);
  }

  warn(message: string, context?: LogContext) {
    const payload = this.formatMessage('warn', message, context);
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, context || '');
    }
    this.sendToTelemetry(payload);
  }

  error(message: string, error?: Error, context?: LogContext) {
    const payload = this.formatMessage('error', message, {
      ...context,
      errorMessage: error?.message,
      stack: error?.stack,
    });
    
    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, error, context || '');
    }
    this.sendToTelemetry(payload);
  }

  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, context || '');
    }
  }

  // Analytics helper
  trackEvent(eventName: string, properties?: LogContext) {
    const payload = {
      type: 'analytics_event',
      eventName,
      properties,
      timestamp: new Date().toISOString()
    };
    if (this.isDevelopment) {
      console.log(`[ANALYTICS] ${eventName}`, properties || '');
    }
    this.sendToTelemetry(payload);
  }
}

export const logger = Logger.getInstance();
