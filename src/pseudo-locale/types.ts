import type { MessageFormatElement } from '@formatjs/icu-messageformat-parser'

export type Handler = (elements: Iterable<MessageFormatElement>) => Iterable<MessageFormatElement>
