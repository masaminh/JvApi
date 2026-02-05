import JvData from './jv_data'
import JvUtil from './jv_util'

type UnusualString = '出走取消' | '発走除外' | '競走除外' | '競走中止' | '失格'
export type OrderType = number | UnusualString | undefined

const unusualStringTable = new Map<number, UnusualString>([
  [1, '出走取消'],
  [2, '発走除外'],
  [3, '競走除外'],
  [4, '競走中止'],
  [5, '失格'],
])

function getOrder (unusualCode: number, order: number): OrderType {
  const returnOrder = unusualStringTable.get(unusualCode) ?? order
  return returnOrder === 0 ? undefined : returnOrder
}

type ReturnType = {
  horseNumber: number | undefined;
  horseId: string | undefined;
  horseName: string;
  order: OrderType
}

export default function getSeData (jvData: JvData): ReturnType {
  const horseNumber = JvUtil.getInteger(jvData.data, 29, 2)
  const horseId = JvUtil.getString(jvData.data, 31, 10)
  const horseName = JvUtil.getJapaneseText(jvData.data, 41, 36)
  const unusualCode = JvUtil.getInteger(jvData.data, 332, 1)
  const order = JvUtil.getInteger(jvData.data, 335, 2)

  return {
    horseNumber: horseNumber === 0 ? undefined : horseNumber,
    horseId: horseId === '0'.repeat(10) ? undefined : horseId,
    horseName,
    order: getOrder(unusualCode, order),
  }
}
