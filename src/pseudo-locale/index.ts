import type { MessageFormatElement } from '@formatjs/icu-messageformat-parser'
import { createLiteralElement } from '@formatjs/icu-messageformat-parser'
import { ACCENTED_MAP, createEnglishTransformer, FLIPPED_MAP, modifyLiteralElement } from './ast'

const locales: Record<string, (elements: Iterable<MessageFormatElement>) => Iterable<MessageFormatElement>> = {
  *'xx-LS'(elements) {
    yield* elements
    yield createLiteralElement('S'.repeat(25))
  },
  'xx-AC': (elements) => modifyLiteralElement(elements, (value) => value.toUpperCase()),
  *'xx-HA'(elements) {
    yield createLiteralElement('[javascript]')
    yield* elements
  },
  'en-XA': createEnglishTransformer('\u005b\u005d', ACCENTED_MAP),
  'en-XB': createEnglishTransformer('\u202e\u202c', FLIPPED_MAP),
}

export function getPseudoLocaleNames(): string[] {
  return Object.keys(locales)
}

export function getPseudoLocale(name: string): (elements: MessageFormatElement[]) => MessageFormatElement[] {
  const handle = locales[name]
  return (elements) => Array.from(handle(elements))
}
