import { DateTime } from 'luxon'
import getTkData from '../src/get_tk_data'
import JvUtil from '../src/jv_util'

vitest.mock('../src/jv_util')

describe('get_tk_data', () => {
  beforeEach(() => {
    vitest.resetAllMocks()
  })

  it('getTkData', () => {
    vitest.spyOn(JvUtil, 'getString')
      .mockImplementation((jvData, pos, size) => {
        if (pos === 12 && size === 8) {
          return '20240101'
        }

        if (pos === 20 && size === 2) {
          return '01'
        }

        if (pos === 615 && size === 1) {
          return '1'
        }

        if (pos === 4 && size === 10) {
          return '1234567890'
        }

        return ''
      })
    vitest.spyOn(JvUtil, 'getJapaneseText')
      .mockImplementation((jvData, pos, size) => {
        if (pos === 33 && size === 60) {
          return 'レース名'
        }

        if (pos === 14 && size === 36) {
          return '馬名'
        }

        return ''
      })
    vitest.spyOn(JvUtil, 'getInteger')
      .mockImplementation((jvData, pos, size) => {
        if (pos === 26 && size === 2) {
          return 1
        }

        if (pos === 634 && size === 3) {
          return 500
        }

        if (pos === 653 && size === 3) {
          return 2
        }

        return Number.NaN
      })
    const getPlaceNameMock = vitest.spyOn(JvUtil, 'getPlaceName')
      .mockReturnValue('札幌')
    const getRaceGradeNameMock = vitest.spyOn(JvUtil, 'getRaceGradeName')
      .mockReturnValue('レースグレード名')
    const result = getTkData({ jvlinkVersion: '1234', data: Buffer.from('0'.repeat(1000)) })
    expect(getPlaceNameMock).toHaveBeenCalledTimes(1)
    expect(getPlaceNameMock).toHaveBeenCalledWith('01')
    expect(getRaceGradeNameMock).toHaveBeenCalledTimes(1)
    expect(getRaceGradeNameMock).toHaveBeenCalledWith('1', 500)
    expect(result).toEqual({
      date: DateTime.fromISO('20240101').setZone('Asia/Tokyo'),
      place: '札幌',
      raceNumber: 1,
      raceName: 'レース名',
      raceGrade: 'レースグレード名',
      horses: [
        {
          horseId: '1234567890',
          horseName: '馬名',
        },
        {
          horseId: '1234567890',
          horseName: '馬名',
        },
      ],
    })
  })
})
