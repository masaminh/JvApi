import { DateTime } from 'luxon'
import AwsS3 from './awss3'
import getEnvironment from './get_environment'
import getRaceDatePrefix from './get_race_date_prefix'

type ReturnType = {
  date: string;
  raceids: string[];
}

export default async function getRaceIds (date: DateTime): Promise<ReturnType> {
  if (!date.isValid) {
    throw new Error('date.isValid must be true')
  }

  const cacheBucket = getEnvironment('JVDATA_BUCKET')

  const prefix = getRaceDatePrefix(date)
  const { prefixes } = await AwsS3.listObjects(cacheBucket, prefix)
  const raceids = prefixes.map((p) => p.replace(prefix, '').replace('/', ''))

  return {
    date: date.toISODate() as string,
    raceids,
  }
}
