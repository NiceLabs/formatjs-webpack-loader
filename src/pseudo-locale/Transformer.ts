/**
 * Based on: https://hg-edge.mozilla.org/mozilla-central/file/a1f74e8c/intl/l10n/L10nRegistry.jsm#l425
 */
export class Transformer {
  private readonly caps: readonly number[]
  private readonly small: readonly number[]
  private readonly elongate: boolean

  constructor(caps: string, smalls: string, elongate: boolean) {
    this.caps = Array.from(caps, (c) => c.codePointAt(0)!)
    this.small = Array.from(smalls, (c) => c.codePointAt(0)!)
    this.elongate = elongate
    this.stringify = this.stringify.bind(this)
    Object.freeze(this)
  }

  stringify(message: string) {
    const points = Array.from(message, (c) => c.codePointAt(0)!)
    return String.fromCodePoint.apply(null, Array.from(this.transform(points)))
  }

  private *transform(points: readonly number[]): Iterable<number> {
    for (const point of points) {
      if (point >= 0x61 && point <= 0x7a) {
        yield this.small[point - 0x61] // a-z
        if (!this.isElongate(point)) continue
        yield this.small[point - 0x61] // duplicate "a", "e", "o" and "u" to emulate ~30% longer text
      } else if (point >= 0x41 && point <= 0x5a) {
        yield this.caps[point - 0x41] // A-Z
      } else {
        yield point // non-alphabetic characters remain unchanged
      }
    }
  }

  private isElongate(code: number): boolean {
    if (!this.elongate) return false
    return code === 0x61 || code === 0x65 || code === 0x6f || code === 0x75
  }
}
