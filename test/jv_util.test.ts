import JvUtil from '../src/jv_util'

describe('jv_util', () => {
  it('getString', () => {
    const result = JvUtil.getString(Buffer.from('1234567890'), 2, 3)
    expect(result).toBe('234')
  })

  it('getInteger', () => {
    const result = JvUtil.getInteger(Buffer.from('1234567890'), 2, 3)
    expect(result).toBe(234)
  })

  it('getJapaneseText', () => {
    const buf = Buffer.from([0x82, 0xa0, 0x82, 0xa2, 0x82, 0xa4, 0x82, 0xa6])
    const result = JvUtil.getJapaneseText(buf, 3, 4)
    expect(result).toBe('いう')
  })

  it('getPlaceName', () => {
    const result = JvUtil.getPlaceName('01')
    expect(result).toBe('札幌')
  })

  it('getPlaceName: unknown', () => {
    const result = JvUtil.getPlaceName('00')
    expect(result).toBe('')
  })

  it('getRaceGradeName', () => {
    expect(JvUtil.getRaceGradeName('A', 999)).toBe('G1')
    expect(JvUtil.getRaceGradeName('B', 999)).toBe('G2')
    expect(JvUtil.getRaceGradeName('C', 999)).toBe('G3')
    expect(JvUtil.getRaceGradeName('D', 999)).toBe('重賞')
    expect(JvUtil.getRaceGradeName('E', 999)).toBe('OP')
    expect(JvUtil.getRaceGradeName('F', 999)).toBe('J-G1')
    expect(JvUtil.getRaceGradeName('G', 999)).toBe('J-G2')
    expect(JvUtil.getRaceGradeName('H', 999)).toBe('J-G3')
    expect(JvUtil.getRaceGradeName('L', 999)).toBe('L')
    expect(JvUtil.getRaceGradeName(' ', 5)).toBe('1勝クラス')
    expect(JvUtil.getRaceGradeName(' ', 10)).toBe('2勝クラス')
    expect(JvUtil.getRaceGradeName('E', 16)).toBe('3勝クラス')
    expect(JvUtil.getRaceGradeName(' ', 15)).toBe('1500万下')
    expect(JvUtil.getRaceGradeName(' ', 701)).toBe('新馬')
    expect(JvUtil.getRaceGradeName(' ', 702)).toBe('未出走')
    expect(JvUtil.getRaceGradeName(' ', 703)).toBe('未勝利')
    expect(JvUtil.getRaceGradeName(' ', 0)).toBe(undefined)
  })
})
