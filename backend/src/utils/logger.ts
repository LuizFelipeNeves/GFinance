type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    context?: Record<string, unknown>;
    error?: string;
}

const LOG_LEVELS: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};

const currentLevel = (process.env.LOG_LEVEL || 'info') as LogLevel;

const formatLog = (entry: LogEntry): string => {
    const base = `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`;
    if (entry.context) {
        return `${base} ${JSON.stringify(entry.context)}`;
    }
    if (entry.error) {
        return `${base}\n${entry.error}`;
    }
    return base;
};

const shouldLog = (level: LogLevel): boolean => {
    return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
};

export const logger = {
    debug(message: string, context?: Record<string, unknown>): void {
        if (shouldLog('debug')) {
            console.debug(formatLog({
                timestamp: new Date().toISOString(),
                level: 'debug',
                message,
                context,
            }));
        }
    },

    info(message: string, context?: Record<string, unknown>): void {
        if (shouldLog('info')) {
            console.info(formatLog({
                timestamp: new Date().toISOString(),
                level: 'info',
                message,
                context,
            }));
        }
    },

    warn(message: string, context?: Record<string, unknown>): void {
        if (shouldLog('warn')) {
            console.warn(formatLog({
                timestamp: new Date().toISOString(),
                level: 'warn',
                message,
                context,
            }));
        }
    },

    error(message: string, error?: Error, context?: Record<string, unknown>): void {
        if (shouldLog('error')) {
            console.error(formatLog({
                timestamp: new Date().toISOString(),
                level: 'error',
                message,
                context,
                error: error?.stack,
            }));
        }
    },
};
