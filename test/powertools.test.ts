import { Logger } from '@aws-lambda-powertools/logger';
import { Tracer } from '@aws-lambda-powertools/tracer';
import { getLogger, getTracer } from '../src/powertools';

jest.mock('@aws-lambda-powertools/logger');
jest.mock('@aws-lambda-powertools/tracer');

const loggerMock = Logger as jest.MockedClass<typeof Logger>;
type LoggerConstructorParameters = ConstructorParameters<typeof Logger>;
const loggerConstructorMock = jest.fn<Logger, LoggerConstructorParameters>()
  .mockImplementation((options) => ({ OPTIONS: options } as unknown as Logger));

const tracerMock = Tracer as jest.MockedClass<typeof Tracer>;
type TracerConstructorParameters = ConstructorParameters<typeof Tracer>;
const tracerConstructorMock = jest.fn<Tracer, TracerConstructorParameters>()
  .mockImplementation((options) => ({ OPTIONS: options } as unknown as Tracer));

describe('powertools', () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should export getLogger', () => {
    loggerMock.mockImplementation((option) => loggerConstructorMock(option));
    const logger = getLogger('INFO');
    expect(logger).toEqual({ OPTIONS: { logLevel: 'INFO', serviceName: 'jv_api' } });
  });

  it('should export getTracer', () => {
    tracerMock.mockImplementation((option) => tracerConstructorMock(option));
    const tracer = getTracer();
    expect(tracer).toEqual({ OPTIONS: { serviceName: 'jv_api' } });
  });
});
