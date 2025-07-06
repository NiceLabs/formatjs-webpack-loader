import { createLiteralElement, isLiteralElement, MessageFormatElement } from '@formatjs/icu-messageformat-parser'

import { Transformer } from './Transformer'
import { Handler } from './types'

export const ACCENTED_MAP = new Transformer(
  '\u0226\u0181\u0187\u1e12\u1e16\u0191\u0193\u0126\u012a\u0134\u0136\u013f\u1e3e\u0220\u01fe\u01a4\u024a\u0158\u015e\u0166\u016c\u1e7c\u1e86\u1e8a\u1e8e\u1e90',
  '\u0227\u0180\u0188\u1e13\u1e17\u0192\u0260\u0127\u012b\u0135\u0137\u0140\u1e3f\u019e\u01ff\u01a5\u024b\u0159\u015f\u0167\u016d\u1e7d\u1e87\u1e8b\u1e8f\u1e91',
  true
)

export const FLIPPED_MAP = new Transformer(
  '\u2200\u0510\u2183\u15e1\u018e\u2132\u2141\x48\x49\u017f\u04fc\u2142\x57\x4e\x4f\u0500\xd2\u1d1a\x53\u22a5\u2229\u0245\x4d\x58\u2144\x5a',
  '\u0250\x71\u0254\x70\u01dd\u025f\u0183\u0265\u0131\u027e\u029e\u0285\u026f\x75\x6f\x64\x62\u0279\x73\u0287\x6e\u028c\u028d\x78\u028e\x7a',
  false
)

export function createEnglishTransformer(brackets: string, transformer: Transformer): Handler {
  const [leftBracket, rightBracket] = brackets
  const handler = transformLiteralElement(transformer.stringify)
  return function* (elements: Iterable<MessageFormatElement>) {
    yield createLiteralElement(leftBracket)
    yield* handler(elements)
    yield createLiteralElement(rightBracket)
  }
}

export function transformLiteralElement(modifier: (input: string) => string): Handler {
  return function* handler(elements): Iterable<MessageFormatElement> {
    for (const element of elements) {
      if (isLiteralElement(element)) {
        yield { ...element, value: modifier(element.value) }
      } else if ('options' in element) {
        const entries = Object.entries(element.options).map(([key, option]) => [
          key,
          { value: Array.from(handler(option.value)) },
        ])
        yield { ...element, options: Object.fromEntries(entries) }
      } else if ('children' in element) {
        yield { ...element, children: Array.from(handler(element.children)) }
      } else {
        yield element
      }
    }
  }
}
