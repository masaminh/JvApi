import Log from '../src/log'

describe('log', () => {
  beforeEach(() => {
    Log.uninitialize()
  })

  it('info: message', () => {
    const logger: Log.ILogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    }

    Log.initialize({ logger })
    Log.info('test')
    expect(logger.info).toBeCalledTimes(1)
    expect(logger.info).toBeCalledWith('test')
  })

  it('info: message, error', () => {
    const logger: Log.ILogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    }

    Log.initialize({ logger })
    Log.info('test', new Error())
    expect(logger.info).toBeCalledTimes(1)
    expect(logger.info).toBeCalledWith('test', expect.any(Error))
  })

  it('warn: message', () => {
    const logger: Log.ILogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    }

    Log.initialize({ logger })
    Log.warn('test')
    expect(logger.warn).toBeCalledTimes(1)
    expect(logger.warn).toBeCalledWith('test')
  })

  it('warn: message, error', () => {
    const logger: Log.ILogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    }

    Log.initialize({ logger })
    Log.warn('test', new Error())
    expect(logger.warn).toBeCalledTimes(1)
    expect(logger.warn).toBeCalledWith('test', expect.any(Error))
  })

  it('error: message', () => {
    const logger: Log.ILogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    }

    Log.initialize({ logger })
    Log.error('test')
    expect(logger.error).toBeCalledTimes(1)
    expect(logger.error).toBeCalledWith('test')
  })

  it('error: message, error', () => {
    const logger: Log.ILogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    }

    Log.initialize({ logger })
    Log.error('test', new Error())
    expect(logger.error).toBeCalledTimes(1)
    expect(logger.error).toBeCalledWith('test', expect.any(Error))
  })
})
