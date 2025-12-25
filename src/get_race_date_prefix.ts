import { DateTime } from 'luxon'
import getEnvironment from './get_environment'

export default function getRaceDatePrefix (date: DateTime): string {
  const cachePrefix = getEnvironment('JVDATA_PREFIX')

  return `${cachePrefix}/RACE/${date.toFormat('yyyy/LL/dd/')}`
}
