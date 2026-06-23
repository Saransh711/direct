import pino from 'pino';
import { env } from './env';

const loggerOptions = {
  level: env.isProduction ? 'info' : 'debug',
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', 'password', 'passwordHash'],
    censor: '***',
  },
  ...(env.isProduction
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
          },
        },
      }),
};

export const logger = pino(loggerOptions);
