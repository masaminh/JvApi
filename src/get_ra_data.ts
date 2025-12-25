import { DateTime } from 'luxon'
import JvData from './jv_data'
import JvUtil from './jv_util'

type ReturnType = {
  date: DateTime,
  place: string,
  raceNumber: number,
  raceName: string,
  raceGrade: string | undefined,
}

export default function getRaData (jvData: JvData): ReturnType {
  const date = DateTime.fromISO(JvUtil.getString(jvData.data, 12, 8)).setZone('Asia/Tokyo')
  const place = JvUtil.getPlaceName(JvUtil.getString(jvData.data, 20, 2))
  const raceNumber = JvUtil.getInteger(jvData.data, 26, 2)
  const raceName = JvUtil.getJapaneseText(jvData.data, 33, 60)
  const gradeCode = JvUtil.getString(jvData.data, 615, 1)
  const raceLimitation = JvUtil.getInteger(jvData.data, 635, 3)
  const raceGrade = JvUtil.getRaceGradeName(gradeCode, raceLimitation)

  return {
    date,
    place,
    raceNumber,
    raceName,
    raceGrade,
  }
}
