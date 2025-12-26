import * as tar from 'tar'
import { Readable, Transform } from 'node:stream'
import getJvData from '../src/get_jv_data'
import FsWrapper from '../src/wrapper/fs_wrapper'
import AwsS3 from '../src/awss3'

vitest.mock('../src/wrapper/fs_wrapper')
vitest.mock('../src/awss3')
vitest.mock('tar')

describe('get_jv_data', () => {
  beforeEach(() => {
    vitest.resetAllMocks()
  })

  it('getJvData', async () => {
    const mkdtempMock = vitest.spyOn(FsWrapper, 'mkdtemp')
      .mockResolvedValue('/TEMPDIR')
    const getObjectMock = vitest.spyOn(AwsS3, 'getObject')
      .mockResolvedValue(Readable.from([Buffer.from('OBJECT')]))
    const untarStream = new Transform({
      transform: (chunk, encoding, callback) => callback(null, chunk),
    })
    const bufs: Buffer[] = []
    untarStream.on('data', (chunk) => { bufs.push(chunk) })
    let untarStreamBuf: Buffer = Buffer.from('')
    untarStream.on('end', () => { untarStreamBuf = Buffer.concat(bufs) })
    const untarMock = vitest.spyOn(tar, 'x')
      .mockImplementation((options) => {
        const func = options.filter
        func?.('properties', { size: 100 } as tar.FileStat)
        func?.('data', { size: 100 } as tar.FileStat)
        return untarStream
      })
    const readFileStringMock = vitest.spyOn(FsWrapper, 'readFileString')
      .mockResolvedValue('{"JvlinkVersion":"1234"}')
    const readFileBufferMock = vitest.spyOn(FsWrapper, 'readFileBuffer')
      .mockResolvedValue(Buffer.from('DATA'))
    const result = await getJvData('BUCKET', 'KEY')
    expect(mkdtempMock).toHaveBeenCalledTimes(1)
    expect(mkdtempMock).toHaveBeenCalledWith(expect.stringMatching(/^\/.+\/jvdata-$/))
    expect(getObjectMock).toHaveBeenCalledTimes(1)
    expect(getObjectMock).toHaveBeenCalledWith('BUCKET', 'KEY')
    expect(untarMock).toHaveBeenCalledTimes(1)
    expect(untarMock).toHaveBeenCalledWith(expect.objectContaining({ C: '/TEMPDIR' }))
    expect(untarStreamBuf.toString()).toBe('OBJECT')
    expect(readFileStringMock).toHaveBeenCalledTimes(1)
    expect(readFileStringMock).toHaveBeenCalledWith('/TEMPDIR/properties', 'utf-8')
    expect(readFileBufferMock).toHaveBeenCalledTimes(1)
    expect(readFileBufferMock).toHaveBeenCalledWith('/TEMPDIR/data')
    expect(result).toEqual({
      jvlinkVersion: '1234',
      data: expect.any(Buffer),
    })
    expect(result.data.toString()).toBe('DATA')
  })

  it('getJvData: Bad properties format.', async () => {
    vitest.spyOn(FsWrapper, 'mkdtemp')
      .mockResolvedValue('/TEMPDIR')
    vitest.spyOn(AwsS3, 'getObject')
      .mockResolvedValue(Readable.from([Buffer.from('OBJECT')]))
    const untarStream = new Transform({
      transform: (chunk, encoding, callback) => callback(null, chunk),
    })
    vitest.spyOn(tar, 'x')
      .mockImplementation((options) => {
        const func = options.filter
        func?.('properties', { size: 100 } as tar.FileStat)
        func?.('data', { size: 100 } as tar.FileStat)
        return untarStream
      })
    vitest.spyOn(FsWrapper, 'readFileString')
      .mockResolvedValue('{"badformat":"1234"}')
    await expect(() => getJvData('BUCKET', 'KEY')).rejects.toThrow()
  })

  it('getJvData: ファイル数が多すぎる.', async () => {
    vitest.spyOn(FsWrapper, 'mkdtemp')
      .mockResolvedValue('/TEMPDIR')
    vitest.spyOn(AwsS3, 'getObject')
      .mockResolvedValue(Readable.from([Buffer.from('OBJECT')]))
    const untarStream = new Transform({
      transform: (chunk, encoding, callback) => callback(null, chunk),
    })
    vitest.spyOn(tar, 'x')
      .mockImplementation((options) => {
        const func = options.filter
        func?.('properties', { size: 100 } as tar.FileStat)
        func?.('data', { size: 100 } as tar.FileStat)
        func?.('unknown', { size: 100 } as tar.FileStat)
        return untarStream
      })
    await expect(() => getJvData('BUCKET', 'KEY')).rejects.toThrow()
  })

  it('getJvData: ファイルが大きすぎる.', async () => {
    vitest.spyOn(FsWrapper, 'mkdtemp')
      .mockResolvedValue('/TEMPDIR')
    vitest.spyOn(AwsS3, 'getObject')
      .mockResolvedValue(Readable.from([Buffer.from('OBJECT')]))
    const untarStream = new Transform({
      transform: (chunk, encoding, callback) => callback(null, chunk),
    })
    vitest.spyOn(tar, 'x')
      .mockImplementation((options) => {
        const func = options.filter
        func?.('properties', { size: 100 } as tar.FileStat)
        func?.('data', { size: 1 * 1000 * 1000 - 99 } as tar.FileStat)
        return untarStream
      })
    await expect(() => getJvData('BUCKET', 'KEY')).rejects.toThrow()
  })
})
