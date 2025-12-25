import { DateTime } from 'luxon'
import * as getEnvironment from '../src/get_environment'
import AwsS3 from '../src/awss3'
import getRaceIds from '../src/get_raceids'

describe('getRaceIds', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('getRaceIds', async () => {
    jest.spyOn(getEnvironment, 'default').mockImplementation((name) => name)
    jest.spyOn(AwsS3, 'listObjects')
      .mockResolvedValue({
        prefixes: [
          'JVDATA_PREFIX/RACE/2023/12/03/RACE_ID_1/',
          'JVDATA_PREFIX/RACE/2023/12/03/RACE_ID_2/',
        ],
        objects: [],
      })
    const date = DateTime.fromObject({ year: 2023, month: 12, day: 3 })
    const result = await getRaceIds(date)
    expect(result).toEqual({
      date: '2023-12-03',
      raceids: ['RACE_ID_1', 'RACE_ID_2'],
    })
  })

  it('getRaceIds: Bad date', async () => {
    const date = DateTime.fromISO('2023-12-32')
    await expect(getRaceIds(date)).rejects.toThrow()
  })
})
