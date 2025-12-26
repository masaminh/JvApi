import { Logger } from '@aws-lambda-powertools/logger'
import { Tracer } from '@aws-lambda-powertools/tracer'
import { getLogger, getTracer } from '../src/powertools'

vitest.mock('@aws-lambda-powertools/logger')
vitest.mock('@aws-lambda-powertools/tracer')

describe('powertools', () => {
  beforeEach(() => {
    vitest.clearAllMocks()
  })

  afterAll(() => {
    vitest.restoreAllMocks()
  })

  it('getLogger should call Logger constructor with correct parameters', () => {
    const logger = getLogger('INFO')

    expect(Logger).toHaveBeenCalledTimes(1)
    expect(Logger).toHaveBeenCalledWith({
      logLevel: 'INFO',
      serviceName: 'jv_api'
    })
    expect(logger).toBeInstanceOf(Logger)
  })

  it('getLogger should call Logger constructor with different log levels', () => {
    vitest.clearAllMocks()

    getLogger('DEBUG')
    expect(Logger).toHaveBeenCalledWith({
      logLevel: 'DEBUG',
      serviceName: 'jv_api'
    })

    vitest.clearAllMocks()

    getLogger('WARN')
    expect(Logger).toHaveBeenCalledWith({
      logLevel: 'WARN',
      serviceName: 'jv_api'
    })

    vitest.clearAllMocks()

    getLogger('ERROR')
    expect(Logger).toHaveBeenCalledWith({
      logLevel: 'ERROR',
      serviceName: 'jv_api'
    })
  })

  it('getTracer should call Tracer constructor with correct parameters', () => {
    const tracer = getTracer()

    expect(Tracer).toHaveBeenCalledTimes(1)
    expect(Tracer).toHaveBeenCalledWith({
      serviceName: 'jv_api'
    })
    expect(tracer).toBeInstanceOf(Tracer)
  })
})
