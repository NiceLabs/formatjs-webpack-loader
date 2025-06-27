import type { MessageFormatElement } from '@formatjs/icu-messageformat-parser'
import { createLiteralElement, isLiteralElement } from '@formatjs/icu-messageformat-parser'

type MessageIterable = Iterable<MessageFormatElement>

const locales: Record<string, (elements: MessageIterable) => MessageIterable> = {
  *'xx-LS'(elements) {
    yield* elements
    yield createLiteralElement('S'.repeat(25))
  },
  'xx-AC'(elements) {
    return modifyLiteralElement(elements, (value) => value.toUpperCase())
  },
  *'xx-HA'(elements) {
    yield createLiteralElement('[javascript]')
    yield* elements
  },
  *'en-XA'(elements) {
    const transformer = new Transformer('ȦƁƇḒḖƑƓĦĪĴĶĿḾȠǾƤɊŘŞŦŬṼẆẊẎẐ', 'ȧƀƈḓḗƒɠħīĵķŀḿƞǿƥɋřşŧŭṽẇẋẏẑ', true)
    yield createLiteralElement('[')
    yield* modifyLiteralElement(elements, transformer.stringify)
    yield createLiteralElement(']')
  },
  *'en-XB'(elements) {
    const transformer = new Transformer('∀ԐↃᗡƎℲ⅁HI\u017fӼ⅂WNOԀD2ᴚS⊥∩ɅMX⅄Z', 'ɐqɔpǝɟƃɥ\u0131ɾʞʅ\u026fuodbɹsʇnʌʍxʎz')
    yield createLiteralElement('\u202e')
    yield* modifyLiteralElement(elements, transformer.stringify)
    yield createLiteralElement('\u202c')
  },
}

export function getPseudoLocaleNames(): string[] {
  return Object.keys(locales)
}

export function getPseudoLocale(name: string): (elements: MessageFormatElement[]) => MessageFormatElement[] {
  const handle = locales[name]
  return (elements) => Array.from(handle(elements))
}

/**
 * Based on: https://hg-edge.mozilla.org/mozilla-central/file/a1f74e8c/intl/l10n/L10nRegistry.jsm#l425
 */
class Transformer {
  private readonly caps: readonly number[]
  private readonly smalls: readonly number[]
  private readonly elongate: boolean

  constructor(caps: string, smalls: string, elongate = false) {
    this.caps = Array.from(caps).map((c) => c.codePointAt(0)!)
    this.smalls = Array.from(smalls).map((c) => c.codePointAt(0)!)
    this.elongate = elongate
    this.stringify = this.stringify.bind(this)
    Object.freeze(this)
  }

  stringify(message: string) {
    return String.fromCodePoint.apply(null, Array.from(this.transform(message)))
  }

  private *transform(message: string): Iterable<number> {
    for (const ch of message) {
      const code = ch.codePointAt(0)!
      if (code >= 0x61 && code <= 0x7a) {
        yield this.smalls[code - 0x61] // a-z
        if (!this.isElongate(code)) continue
        yield this.smalls[code - 0x61] // duplicate "a", "e", "o" and "u" to emulate ~30% longer text
      } else if (code >= 0x41 && code <= 0x5a) {
        yield this.caps[code - 0x41] // A-Z
      } else {
        yield code // non-alphabetic characters remain unchanged
      }
    }
  }

  private isElongate(code: number): boolean {
    if (!this.elongate) return false
    return code === 0x61 || code === 0x65 || code === 0x6f || code === 0x75
  }
}

function* modifyLiteralElement(elements: MessageIterable, modifier: (input: string) => string): MessageIterable {
  for (const element of elements) {
    if (isLiteralElement(element)) {
      yield { ...element, value: modifier(element.value) }
    } else if ('options' in element) {
      const entries = Object.entries(element.options).map(([key, option]) => [
        key,
        { value: Array.from(modifyLiteralElement(option.value, modifier)) },
      ])
      yield { ...element, options: Object.fromEntries(entries) }
    } else if ('children' in element) {
      yield { ...element, children: Array.from(modifyLiteralElement(element.children, modifier)) }
    } else {
      yield element
    }
  }
}
