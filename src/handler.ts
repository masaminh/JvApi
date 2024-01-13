import serverlessExpress, { getCurrentInvoke } from '@vendia/serverless-express';
import { Logger, injectLambdaContext } from '@aws-lambda-powertools/logger';
import middy from '@middy/core';
import app from './app';
import Log from './log';

const logger = new Logger(
  {
    logLevel: 'INFO',
    serviceName: 'jv_api',
  },
);

Log.initialize({ logger });

app.use((req, res, next) => {
  const { event } = getCurrentInvoke();
  logger.addPersistentLogAttributes({ event });
  next();
});

// eslint-disable-next-line import/prefer-default-export
export const handler = middy(serverlessExpress({ app })).use(injectLambdaContext(logger));
