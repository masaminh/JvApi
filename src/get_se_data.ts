import JvData from './jv_data';
import JvUtil from './jv_util';

type ReturnType = {
  horseNumber: number | undefined;
  horseId: string | undefined;
  horseName: string;
};

export default function getSeData(jvData: JvData): ReturnType {
  const horseNumber = JvUtil.getInteger(jvData.data, 29, 2);
  const horseId = JvUtil.getString(jvData.data, 31, 10);
  const horseName = JvUtil.getJapaneseText(jvData.data, 41, 36);

  return {
    horseNumber: horseNumber === 0 ? undefined : horseNumber,
    horseId: horseId === '0'.repeat(10) ? undefined : horseId,
    horseName,
  };
}
