import serverlessExpress, { getCurrentInvoke } from '@vendia/serverless-express';
import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware';
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware';
import middy from '@middy/core';
import app from './app';
import Log from './log';
import { getLogger, getTracer } from './powertools';

const logger = getLogger('INFO');

Log.initialize({ logger });

app.use((req, res, next) => {
  const { event } = getCurrentInvoke();
  logger.addPersistentLogAttributes({ event });
  next();
});

const tracer = getTracer();

// eslint-disable-next-line import/prefer-default-export
export const handler = middy(serverlessExpress({ app }))
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer));
