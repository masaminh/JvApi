import iconv from 'iconv-lite';

namespace JvUtil {
  export function getString(jvData: Buffer, pos: number, size: number): string {
    return jvData.toString('ascii', pos - 1, pos + size - 1);
  }

  export function getJapaneseText(jvData: Buffer, pos: number, size: number): string {
    return iconv.decode(jvData.subarray(pos - 1, pos + size - 1), 'Shift_JIS').trim();
  }

  export function getInteger(jvData: Buffer, pos: number, size: number): number {
    return Number.parseInt(jvData.toString('ascii', pos - 1, pos + size - 1), 10);
  }

  const PlaceTable = new Map<string, string>([
    ['01', '札幌'],
    ['02', '函館'],
    ['03', '福島'],
    ['04', '新潟'],
    ['05', '東京'],
    ['06', '中山'],
    ['07', '中京'],
    ['08', '京都'],
    ['09', '阪神'],
    ['10', '小倉'],
  ]);

  export function getPlaceName(code: string): string {
    return PlaceTable.get(code) ?? '';
  }

  const GradeCodeTable = new Map<string, string>([
    ['A', 'G1'],
    ['B', 'G2'],
    ['C', 'G3'],
    ['D', '重賞'],
    ['F', 'J-G1'],
    ['G', 'J-G2'],
    ['H', 'J-G3'],
    ['L', 'L'],
  ]);

  const RaceLimitationTable = new Map<number, string | undefined>([
    [0, undefined],
    [5, '1勝クラス'],
    [10, '2勝クラス'],
    [16, '3勝クラス'],
    [701, '新馬'],
    [702, '未出走'],
    [703, '未勝利'],
    [999, 'OP'],
  ]);

  export function getRaceGradeName(gradeCode: string, raceLimitation: number): string | undefined {
    if (GradeCodeTable.has(gradeCode)) {
      return GradeCodeTable.get(gradeCode);
    }

    if (RaceLimitationTable.has(raceLimitation)) {
      return RaceLimitationTable.get(raceLimitation);
    }

    return `${raceLimitation}00万下`;
  }
}

export default JvUtil;
