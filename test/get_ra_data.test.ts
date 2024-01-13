import { DateTime } from 'luxon';
import getRaData from '../src/get_ra_data';
import JvUtil from '../src/jv_util';

jest.mock('../src/jv_util');

describe('get_ra_data', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('getRaData', () => {
    const getStringMock = jest.spyOn(JvUtil, 'getString')
      .mockImplementation((jvData, pos, size) => {
        if (pos === 12 && size === 8) {
          return '20240101';
        }

        if (pos === 20 && size === 2) {
          return '01';
        }

        if (pos === 615 && size === 1) {
          return '1';
        }

        return '';
      });
    const getJapaneseTextMock = jest.spyOn(JvUtil, 'getJapaneseText')
      .mockImplementation((jvData, pos, size) => {
        if (pos === 33 && size === 60) {
          return 'レース名';
        }

        return '';
      });
    const getIntegerMock = jest.spyOn(JvUtil, 'getInteger')
      .mockImplementation((jvData, pos, size) => {
        if (pos === 26 && size === 2) {
          return 1;
        }

        if (pos === 635 && size === 3) {
          return 500;
        }

        return NaN;
      });
    const getPlaceNameMock = jest.spyOn(JvUtil, 'getPlaceName')
      .mockReturnValue('札幌');
    const getRaceGradeNameMock = jest.spyOn(JvUtil, 'getRaceGradeName')
      .mockReturnValue('レースグレード名');
    const result = getRaData({ jvlinkVersion: '1234', data: Buffer.from('DATA') });
    getStringMock.mock.calls.forEach((params) => {
      expect(params[0].toString()).toBe('DATA');
    });
    getIntegerMock.mock.calls.forEach((params) => {
      expect(params[0].toString()).toBe('DATA');
    });
    getJapaneseTextMock.mock.calls.forEach((params) => {
      expect(params[0].toString()).toBe('DATA');
    });
    expect(getPlaceNameMock).toBeCalledTimes(1);
    expect(getPlaceNameMock).toBeCalledWith('01');
    expect(getRaceGradeNameMock).toBeCalledTimes(1);
    expect(getRaceGradeNameMock).toBeCalledWith('1', 500);
    expect(result).toEqual({
      date: DateTime.fromISO('20240101').setZone('Asia/Tokyo'),
      place: '札幌',
      raceNumber: 1,
      raceName: 'レース名',
      raceGrade: 'レースグレード名',
    });
  });
});
