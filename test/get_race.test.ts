import { DateTime } from 'luxon';
import { NoSuchKey } from '@aws-sdk/client-s3';
import getRace from '../src/get_race';
import * as getEnvironment from '../src/get_environment';
import * as getJvData from '../src/get_jv_data';
import * as getRaData from '../src/get_ra_data';
import * as getSeData from '../src/get_se_data';
import * as getTkData from '../src/get_tk_data';
import AwsS3 from '../src/awss3';

jest.mock('../src/get_environment');
jest.mock('../src/get_jv_data');
jest.mock('../src/get_ra_data');
jest.mock('../src/get_se_data');
jest.mock('../src/get_tk_data');
jest.mock('../src/awss3');

describe('getRace', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(getEnvironment, 'default')
      .mockImplementation((name: string) => {
        if (name === 'JVDATA_BUCKET') { return 'JVDATA_BUCKET'; }
        if (name === 'JVDATA_PREFIX') { return 'JVDATA_PREFIX'; }
        throw new Error();
      });
  });

  it('getRace: 特別登録', async () => {
    const getJvDataMock = jest.spyOn(getJvData, 'default')
      .mockRejectedValueOnce(new NoSuchKey({ $metadata: {}, message: '' }))
      .mockResolvedValue({ jvlinkVersion: '1234', data: Buffer.from('JV_DATA') });
    jest.spyOn(getTkData, 'default')
      .mockReturnValueOnce({
        date: DateTime.fromISO('20231216'),
        place: '札幌',
        raceNumber: 1,
        raceName: '',
        raceGrade: '未勝利',
        horses: [
          { horseId: 'HORSEID_1', horseName: 'HORSENAME_1' },
          { horseId: 'HORSEID_2', horseName: 'HORSENAME_2' },
        ],
      });

    const result = await getRace('2023121601010101');
    expect(getJvDataMock).toHaveBeenNthCalledWith(
      1,
      'JVDATA_BUCKET',
      'JVDATA_PREFIX/RACE/2023/12/16/2023121601010101/RA2023121601010101.tar.gz',
    );
    expect(getJvDataMock).toHaveBeenNthCalledWith(
      2,
      'JVDATA_BUCKET',
      'JVDATA_PREFIX/RACE/2023/12/16/2023121601010101/TK2023121601010101.tar.gz',
    );
    expect(result).toEqual<typeof result>({
      raceId: '2023121601010101',
      date: '2023-12-16',
      place: '札幌',
      raceNumber: 1,
      raceName: '未勝利',
      horses: [
        { horseNumber: undefined, horseId: 'HORSEID_1', horseName: 'HORSENAME_1' },
        { horseNumber: undefined, horseId: 'HORSEID_2', horseName: 'HORSENAME_2' },
      ],
    });
  });

  it('getRace: 馬番決定前', async () => {
    const listObjectsMock = jest.spyOn(AwsS3, 'listObjects')
      .mockResolvedValueOnce({
        prefixes: [],
        objects: [
          'JVDATA_PREFIX/RACE/2023/12/16/2023121601010101/SE2023121601010101000123456789.tar.gz',
          'JVDATA_PREFIX/RACE/2023/12/16/2023121601010101/SE2023121601010101001234567890.tar.gz',
        ],
      });
    const getJvDataMock = jest.spyOn(getJvData, 'default')
      .mockResolvedValue({ jvlinkVersion: '1234', data: Buffer.from('JV_DATA') });
    jest.spyOn(getRaData, 'default')
      .mockReturnValueOnce({
        date: DateTime.fromISO('20231216'),
        place: '札幌',
        raceNumber: 1,
        raceName: '',
        raceGrade: '未勝利',
      });
    jest.spyOn(getSeData, 'default')
      .mockReturnValueOnce({ horseNumber: undefined, horseId: 'HORSEID_1', horseName: 'HORSENAME_1' })
      .mockReturnValueOnce({ horseNumber: undefined, horseId: 'HORSEID_2', horseName: 'HORSENAME_2' });

    const result = await getRace('2023121601010101');
    expect(listObjectsMock).toHaveBeenNthCalledWith(
      1,
      'JVDATA_BUCKET',
      'JVDATA_PREFIX/RACE/2023/12/16/2023121601010101/SE',
    );
    expect(getJvDataMock).toHaveBeenNthCalledWith(
      1,
      'JVDATA_BUCKET',
      'JVDATA_PREFIX/RACE/2023/12/16/2023121601010101/RA2023121601010101.tar.gz',
    );
    expect(getJvDataMock).toHaveBeenNthCalledWith(
      2,
      'JVDATA_BUCKET',
      'JVDATA_PREFIX/RACE/2023/12/16/2023121601010101/SE2023121601010101000123456789.tar.gz',
    );
    expect(getJvDataMock).toHaveBeenNthCalledWith(
      3,
      'JVDATA_BUCKET',
      'JVDATA_PREFIX/RACE/2023/12/16/2023121601010101/SE2023121601010101001234567890.tar.gz',
    );
    expect(result).toEqual<typeof result>({
      raceId: '2023121601010101',
      date: '2023-12-16',
      place: '札幌',
      raceNumber: 1,
      raceName: '未勝利',
      horses: [
        { horseNumber: undefined, horseId: 'HORSEID_1', horseName: 'HORSENAME_1' },
        { horseNumber: undefined, horseId: 'HORSEID_2', horseName: 'HORSENAME_2' },
      ],
    });
  });

  it('getRace: 馬番決定後', async () => {
    const listObjectsMock = jest.spyOn(AwsS3, 'listObjects')
      .mockResolvedValueOnce({
        prefixes: [],
        objects: [
          'JVDATA_PREFIX/RACE/2023/12/16/2023121601010101/SE2023121601010101000123456789.tar.gz',
          'JVDATA_PREFIX/RACE/2023/12/16/2023121601010101/SE2023121601010101001234567890.tar.gz',
          'JVDATA_PREFIX/RACE/2023/12/16/2023121601010101/SE2023121601010101010123456789.tar.gz',
          'JVDATA_PREFIX/RACE/2023/12/16/2023121601010101/SE2023121601010101021234567890.tar.gz',
        ],
      });
    const getJvDataMock = jest.spyOn(getJvData, 'default')
      .mockResolvedValue({ jvlinkVersion: '1234', data: Buffer.from('JV_DATA') });
    jest.spyOn(getRaData, 'default')
      .mockReturnValueOnce({
        date: DateTime.fromISO('20231216'),
        place: '札幌',
        raceNumber: 1,
        raceName: '',
        raceGrade: '未勝利',
      });
    jest.spyOn(getSeData, 'default')
      .mockReturnValueOnce({ horseNumber: 1, horseId: 'HORSEID_1', horseName: 'HORSENAME_1' })
      .mockReturnValueOnce({ horseNumber: 2, horseId: 'HORSEID_2', horseName: 'HORSENAME_2' });

    const result = await getRace('2023121601010101');
    expect(listObjectsMock).toHaveBeenNthCalledWith(
      1,
      'JVDATA_BUCKET',
      'JVDATA_PREFIX/RACE/2023/12/16/2023121601010101/SE',
    );
    expect(getJvDataMock).toHaveBeenNthCalledWith(
      1,
      'JVDATA_BUCKET',
      'JVDATA_PREFIX/RACE/2023/12/16/2023121601010101/RA2023121601010101.tar.gz',
    );
    expect(getJvDataMock).toHaveBeenNthCalledWith(
      2,
      'JVDATA_BUCKET',
      'JVDATA_PREFIX/RACE/2023/12/16/2023121601010101/SE2023121601010101010123456789.tar.gz',
    );
    expect(getJvDataMock).toHaveBeenNthCalledWith(
      3,
      'JVDATA_BUCKET',
      'JVDATA_PREFIX/RACE/2023/12/16/2023121601010101/SE2023121601010101021234567890.tar.gz',
    );
    expect(result).toEqual<typeof result>({
      raceId: '2023121601010101',
      date: '2023-12-16',
      place: '札幌',
      raceNumber: 1,
      raceName: '未勝利',
      horses: [
        { horseNumber: 1, horseId: 'HORSEID_1', horseName: 'HORSENAME_1' },
        { horseNumber: 2, horseId: 'HORSEID_2', horseName: 'HORSENAME_2' },
      ],
    });
  });

  it('getRace: レース名あり、グレードなし', async () => {
    jest.spyOn(getJvData, 'default')
      .mockRejectedValueOnce(new NoSuchKey({ $metadata: {}, message: '' }))
      .mockResolvedValue({ jvlinkVersion: '1234', data: Buffer.from('JV_DATA') });
    jest.spyOn(getTkData, 'default')
      .mockReturnValueOnce({
        date: DateTime.fromISO('20231216'),
        place: '札幌',
        raceNumber: 1,
        raceName: 'レース名',
        raceGrade: undefined,
        horses: [
          { horseId: 'HORSEID_1', horseName: 'HORSENAME_1' },
          { horseId: 'HORSEID_2', horseName: 'HORSENAME_2' },
        ],
      });

    const result = await getRace('2023121601010101');
    expect(result.raceName).toBe('レース名');
  });

  it('getRace: レース名あり、グレードあり', async () => {
    jest.spyOn(getJvData, 'default')
      .mockRejectedValueOnce(new NoSuchKey({ $metadata: {}, message: '' }))
      .mockResolvedValue({ jvlinkVersion: '1234', data: Buffer.from('JV_DATA') });
    jest.spyOn(getTkData, 'default')
      .mockReturnValueOnce({
        date: DateTime.fromISO('20231216'),
        place: '札幌',
        raceNumber: 1,
        raceName: 'レース名',
        raceGrade: 'グレード',
        horses: [
          { horseId: 'HORSEID_1', horseName: 'HORSENAME_1' },
          { horseId: 'HORSEID_2', horseName: 'HORSENAME_2' },
        ],
      });

    const result = await getRace('2023121601010101');
    expect(result.raceName).toBe('レース名(グレード)');
  });

  it('getRace: レース名の「ステークス」を「S」に変換', async () => {
    jest.spyOn(getJvData, 'default')
      .mockRejectedValueOnce(new NoSuchKey({ $metadata: {}, message: '' }))
      .mockResolvedValue({ jvlinkVersion: '1234', data: Buffer.from('JV_DATA') });
    jest.spyOn(getTkData, 'default')
      .mockReturnValueOnce({
        date: DateTime.fromISO('20231216'),
        place: '札幌',
        raceNumber: 1,
        raceName: 'なんとかステークス',
        raceGrade: 'グレード',
        horses: [
          { horseId: 'HORSEID_1', horseName: 'HORSENAME_1' },
          { horseId: 'HORSEID_2', horseName: 'HORSENAME_2' },
        ],
      });

    const result = await getRace('2023121601010101');
    expect(result.raceName).toBe('なんとかS(グレード)');
  });

  it('getRace: Bad raceId length', async () => {
    await expect(() => getRace('20231216010101')).rejects.toThrow();
  });

  it('getRace: Bad raceId date', async () => {
    await expect(() => getRace('2023123201010101')).rejects.toThrow();
  });

  it('getRace: getJvData occured Error', async () => {
    jest.spyOn(getJvData, 'default')
      .mockRejectedValueOnce(new Error());
    await expect(() => getRace('2023123101010101')).rejects.toThrow();
  });
});
