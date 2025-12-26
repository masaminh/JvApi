import getSeData from '../src/get_se_data'
import JvUtil from '../src/jv_util'

jest.mock('../src/jv_util')

describe('get_se_data', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('getSeData', () => {
    const getStringMock = jest.spyOn(JvUtil, 'getString')
      .mockImplementation((jvData, pos, size) => {
        if (pos === 31 && size === 10) {
          return '1234567890'
        }

        return ''
      })
    const getJapaneseTextMock = jest.spyOn(JvUtil, 'getJapaneseText')
      .mockImplementation((jvData, pos, size) => {
        if (pos === 41 && size === 36) {
          return '馬名'
        }

        return ''
      })
    const getIntegerMock = jest.spyOn(JvUtil, 'getInteger')
      .mockImplementation((jvData, pos, size) => {
        if (pos === 29 && size === 2) {
          return 1
        }
        return Number.NaN
      })
    const result = getSeData({ jvlinkVersion: '1234', data: Buffer.from('DATA') })
    getStringMock.mock.calls.forEach((params) => {
      expect(params[0].toString()).toBe('DATA')
    })
    getIntegerMock.mock.calls.forEach((params) => {
      expect(params[0].toString()).toBe('DATA')
    })
    getJapaneseTextMock.mock.calls.forEach((params) => {
      expect(params[0].toString()).toBe('DATA')
    })
    expect(result).toEqual({
      horseNumber: 1,
      horseId: '1234567890',
      horseName: '馬名',
    })
  })

  it('getSeData: no horseId', () => {
    jest.spyOn(JvUtil, 'getString')
      .mockImplementation((jvData, pos, size) => {
        if (pos === 31 && size === 10) {
          return '0000000000'
        }

        return ''
      })
    jest.spyOn(JvUtil, 'getJapaneseText')
      .mockImplementation((jvData, pos, size) => {
        if (pos === 41 && size === 36) {
          return '馬名'
        }

        return ''
      })
    jest.spyOn(JvUtil, 'getInteger')
      .mockImplementation((jvData, pos, size) => {
        if (pos === 29 && size === 2) {
          return 1
        }
        return Number.NaN
      })
    const result = getSeData({ jvlinkVersion: '1234', data: Buffer.from('DATA') })
    expect(result).toEqual({
      horseNumber: 1,
      horseName: '馬名',
    })
  })

  it('getSeData: no horseNumber', () => {
    jest.spyOn(JvUtil, 'getString')
      .mockImplementation((jvData, pos, size) => {
        if (pos === 31 && size === 10) {
          return '1234567890'
        }

        return ''
      })
    jest.spyOn(JvUtil, 'getJapaneseText')
      .mockImplementation((jvData, pos, size) => {
        if (pos === 41 && size === 36) {
          return '馬名'
        }

        return ''
      })
    jest.spyOn(JvUtil, 'getInteger')
      .mockImplementation((jvData, pos, size) => {
        if (pos === 29 && size === 2) {
          return 0
        }
        return Number.NaN
      })
    const result = getSeData({ jvlinkVersion: '1234', data: Buffer.from('DATA') })
    expect(result).toEqual({
      horseId: '1234567890',
      horseName: '馬名',
    })
  })
})
