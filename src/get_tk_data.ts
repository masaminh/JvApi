import { DateTime } from 'luxon';
import JvData from './jv_data';
import JvUtil from './jv_util';

type ReturnType = {
  date: DateTime,
  place: string,
  raceNumber: number,
  raceName: string,
  raceGrade: string | undefined,
  horses: {
    horseId: string,
    horseName: string,
  }[],
};

export default function getTkData(jvData: JvData): ReturnType {
  const { data } = jvData;
  const date = DateTime.fromISO(JvUtil.getString(data, 12, 8)).setZone('Asia/Tokyo');
  const place = JvUtil.getPlaceName(JvUtil.getString(data, 20, 2));
  const raceNumber = JvUtil.getInteger(data, 26, 2);
  const raceName = JvUtil.getJapaneseText(data, 33, 60);
  const gradeCode = JvUtil.getString(jvData.data, 615, 1);
  const raceLimitation = JvUtil.getInteger(jvData.data, 634, 3);
  const raceGrade = JvUtil.getRaceGradeName(gradeCode, raceLimitation);
  const horseCount = JvUtil.getInteger(data, 653, 3);

  const horses = Array.from({ length: horseCount }).map((_, i) => {
    const buf = data.subarray(655 + i * 70, 655 + (i + 1) * 70);
    const horseId = JvUtil.getString(buf, 4, 10);
    const horseName = JvUtil.getJapaneseText(buf, 14, 36);

    return { horseId, horseName };
  });
  return {
    date,
    place,
    raceNumber,
    raceName,
    raceGrade,
    horses,
  };
}
