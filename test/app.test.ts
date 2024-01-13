import { DateTime } from 'luxon';
import request from 'supertest';
import app from '../src/app';
import * as getRaceIds from '../src/get_raceids';
import * as getRace from '../src/get_race';

jest.mock('../src/get_raceids');
jest.mock('../src/get_race');

describe('app', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('raceids: today', async () => {
    jest.spyOn(DateTime, 'now')
      .mockReturnValue(DateTime.fromISO('20240101'));
    const getRaceIdsMock = jest.spyOn(getRaceIds, 'default')
      .mockResolvedValue({ date: '2024-01-01', raceids: ['ID1', 'ID2'] });
    const response = await request(app).get('/raceids');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ date: '2024-01-01', raceids: ['ID1', 'ID2'] });
    expect(getRaceIdsMock).toHaveBeenCalledTimes(1);
    expect(getRaceIdsMock).toHaveBeenCalledWith(DateTime.fromISO('20240101').setZone('Asia/Tokyo'));
  });

  it('raceids: date parameter', async () => {
    const getRaceIdsMock = jest.spyOn(getRaceIds, 'default')
      .mockResolvedValue({ date: '2024-01-01', raceids: ['ID1', 'ID2'] });
    const response = await request(app).get('/raceids?date=20240101');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ date: '2024-01-01', raceids: ['ID1', 'ID2'] });
    expect(getRaceIdsMock).toHaveBeenCalledTimes(1);
    expect(getRaceIdsMock).toHaveBeenCalledWith(DateTime.fromISO('20240101').setZone('Asia/Tokyo'));
  });

  it('raceids: bad date parameter', async () => {
    const getRaceIdsMock = jest.spyOn(getRaceIds, 'default')
      .mockResolvedValue({ date: '2024-01-01', raceids: ['ID1', 'ID2'] });
    const response = await request(app).get('/raceids?date=20240132');
    expect(response.status).toBe(400);
    expect(getRaceIdsMock).toHaveBeenCalledTimes(0);
  });

  it('raceids: bad date parameter', async () => {
    const getRaceIdsMock = jest.spyOn(getRaceIds, 'default')
      .mockResolvedValue({ date: '2024-01-01', raceids: ['ID1', 'ID2'] });
    const response = await request(app).get('/raceids?date=20240101&date=20240102');
    expect(response.status).toBe(400);
    expect(getRaceIdsMock).toHaveBeenCalledTimes(0);
  });

  it('race', async () => {
    const getRaceMock = jest.spyOn(getRace, 'default')
      .mockResolvedValue({
        raceId: '2024010101010101',
        date: '2024-01-01',
        place: '札幌',
        raceNumber: 1,
        raceName: '未勝利',
        horses: [
          { horseNumber: 1, horseId: '1234567890', horseName: '馬名1' },
          { horseNumber: 2, horseId: '2345678901', horseName: '馬名2' },
        ],
      });
    const response = await request(app).get('/races/2024010101010101');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      raceId: '2024010101010101',
      date: '2024-01-01',
      place: '札幌',
      raceNumber: 1,
      raceName: '未勝利',
      horses: [
        { horseNumber: 1, horseId: '1234567890', horseName: '馬名1' },
        { horseNumber: 2, horseId: '2345678901', horseName: '馬名2' },
      ],
    });
    expect(getRaceMock).toHaveBeenCalledTimes(1);
    expect(getRaceMock).toHaveBeenCalledWith('2024010101010101');
  });

  it('race: bad parameter', async () => {
    const getRaceMock = jest.spyOn(getRace, 'default')
      .mockResolvedValue({
        raceId: '2024010101010101',
        date: '2024-01-01',
        place: '札幌',
        raceNumber: 1,
        raceName: '未勝利',
        horses: [
          { horseNumber: 1, horseId: '1234567890', horseName: '馬名1' },
          { horseNumber: 2, horseId: '2345678901', horseName: '馬名2' },
        ],
      });
    const response = await request(app).get('/races/202401010101010');
    expect(response.status).toBe(400);
    expect(getRaceMock).toHaveBeenCalledTimes(0);
  });

  it('race: bad parameter', async () => {
    const getRaceMock = jest.spyOn(getRace, 'default')
      .mockResolvedValue({
        raceId: '2024010101010101',
        date: '2024-01-01',
        place: '札幌',
        raceNumber: 1,
        raceName: '未勝利',
        horses: [
          { horseNumber: 1, horseId: '1234567890', horseName: '馬名1' },
          { horseNumber: 2, horseId: '2345678901', horseName: '馬名2' },
        ],
      });
    const response = await request(app).get('/races/2024013201010101');
    expect(response.status).toBe(400);
    expect(getRaceMock).toHaveBeenCalledTimes(0);
  });

  it('404', async () => {
    const response = await request(app).get('/noapi');
    expect(response.status).toBe(404);
  });

  it('raceids: exception', async () => {
    jest.spyOn(getRaceIds, 'default')
      .mockRejectedValue(new Error('error'));
    const response = await request(app).get('/raceids?date=20240101');
    expect(response.status).toBe(500);
  });
});
