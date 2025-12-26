import serverlessExpress from '@codegenie/serverless-express'
import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware'
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware'
import middy from '@middy/core'
import app from './app'
import Log from './log'
import { getLogger, getTracer } from './powertools'

const logger = getLogger('INFO')

Log.initialize({ logger })

const tracer = getTracer()

export const handler = middy(serverlessExpress({ app }))
  .use(injectLambdaContext(logger, { logEvent: true }))
  .use(captureLambdaHandler(tracer))
