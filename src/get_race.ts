import { DateTime } from 'luxon'
import { NoSuchKey } from '@aws-sdk/client-s3'
import getEnvironment from './get_environment'
import getRaceDatePrefix from './get_race_date_prefix'
import getJvData from './get_jv_data'
import getRaData from './get_ra_data'
import AwsS3 from './awss3'
import getSeData from './get_se_data'
import JvData from './jv_data'
import getTkData from './get_tk_data'

async function getSeKeys (bucket: string, racePrefix: string): Promise<string[]> {
  const { objects } = await AwsS3.listObjects(bucket, `${racePrefix}SE`)
  objects.sort((a, b) => a.localeCompare(b))
  const lastkey = objects.at(-1)

  if (!lastkey || lastkey.replace(racePrefix, '').substring(18, 20) === '00') {
    return objects
  }

  return objects.filter((key) => key.replace(racePrefix, '').substring(18, 20) !== '00')
}

type RaceInfo = {
  raceId: string;
  date: DateTime;
  time: string | undefined;
  place: string;
  raceNumber: number;
  raceName: string;
  raceGrade: string | undefined;
  horses: {
    horseNumber: number | undefined;
    horseId: string | undefined;
    horseName: string;
  }[]
}

async function getRaceInfoRa (
  bucket: string,
  racePrefix: string,
  raceId: string
): Promise<RaceInfo | undefined> {
  const raKey = `${racePrefix}RA${raceId}.tar.gz`

  let raceData: JvData

  try {
    raceData = await getJvData(bucket, raKey)
  } catch (e) {
    if (e instanceof NoSuchKey) {
      return undefined
    }

    throw e
  }

  const raData = getRaData(raceData)

  const seKeys = await getSeKeys(bucket, racePrefix)
  const horseInfos = await Promise.all(seKeys.map(async (seKey) => {
    const horseData = await getJvData(bucket, seKey)
    const seData = getSeData(horseData)
    return seData
  }))

  return {
    raceId,
    date: raData.date,
    time: raData.time,
    place: raData.place,
    raceNumber: raData.raceNumber,
    raceName: raData.raceName,
    raceGrade: raData.raceGrade,
    horses: horseInfos.map((info) => ({
      horseNumber: info.horseNumber,
      horseId: info.horseId,
      horseName: info.horseName,
    })),
  }
}

async function getRaceInfoTk (
  bucket: string,
  racePrefix: string,
  raceId: string
): Promise<RaceInfo> {
  const tkKey = `${racePrefix}TK${raceId}.tar.gz`
  const tokuData = await getJvData(bucket, tkKey)
  const tkData = getTkData(tokuData)
  return {
    raceId,
    date: tkData.date,
    time: undefined,
    place: tkData.place,
    raceNumber: tkData.raceNumber,
    raceName: tkData.raceName,
    raceGrade: tkData.raceGrade,
    horses: tkData.horses.map((horse) => ({
      horseNumber: undefined,
      horseId: horse.horseId,
      horseName: horse.horseName,
    })),
  }
}

function getRaceName (raceName: string, raceGrade: string | undefined): string {
  const shortenName = raceName.replace(/ステークス$/, 'S')

  if (raceGrade === undefined) {
    return shortenName
  }

  if (shortenName === '') {
    return raceGrade
  }

  return `${shortenName}(${raceGrade})`
}

type ReturnType = {
  raceId: string;
  date: string;
  time: string | undefined;
  place: string;
  raceNumber: number;
  raceName: string;
  horses: {
    horseNumber: number | undefined;
    horseId: string | undefined;
    horseName: string;
  }[]
}

export default async function getRace (raceId: string): Promise<ReturnType> {
  if (raceId.length !== 16) {
    throw new Error('raceId.length must be 16')
  }

  const date = DateTime.fromISO(raceId.slice(0, 8))
  if (!date.isValid) {
    throw new Error('date.isValid must be true')
  }

  const bucket = getEnvironment('JVDATA_BUCKET')
  const racePrefix = `${getRaceDatePrefix(date)}${raceId}/`

  const raceInfo = await getRaceInfoRa(bucket, racePrefix, raceId) ??
    await getRaceInfoTk(bucket, racePrefix, raceId)

  return {
    raceId,
    date: raceInfo.date.toISODate() as string,
    time: raceInfo.time,
    place: raceInfo.place,
    raceNumber: raceInfo.raceNumber,
    raceName: getRaceName(raceInfo.raceName, raceInfo.raceGrade),
    horses: raceInfo.horses,
  }
}
