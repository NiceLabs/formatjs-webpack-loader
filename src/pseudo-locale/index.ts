import { createLiteralElement } from '@formatjs/icu-messageformat-parser'

import { ACCENTED_MAP, createEnglishTransformer, FLIPPED_MAP, transformLiteralElement } from './ast'
import { Handler } from './types'

export { Handler }

const locales: Record<string, Handler> = {
  'xx-LS': (elements) => [...elements, createLiteralElement('S'.repeat(25))],
  'xx-AC': transformLiteralElement((value) => value.toUpperCase()),
  'xx-HA': (elements) => [createLiteralElement('[javascript]'), ...elements],
  'en-XA': createEnglishTransformer('\u005b\u005d', ACCENTED_MAP),
  'en-XB': createEnglishTransformer('\u202e\u202c', FLIPPED_MAP),
}

export function getPseudoLocaleNames(): string[] {
  return Object.keys(locales)
}

export function getPseudoLocale(name: string | undefined): Handler | undefined {
  if (name === undefined) return undefined
  return locales[name]
}
