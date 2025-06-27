import type { MessageDescriptor } from '@formatjs/ts-transformer'
import { getFormatSchema } from './format-schema'
import { validate } from 'schema-utils'

type Entries = [string, string][]

export type Prehandler<T = any> = (translated: T) => Entries

const prehandlers: Record<string, Prehandler> = {
  default(translated: Record<string, MessageDescriptor>) {
    return mapValue(translated, (message) => message.defaultMessage!)
  },
  lokalise(translated: Record<string, { translation: string }>) {
    return mapValue(translated, (message) => message.translation)
  },
  simple(translated: Record<string, string>) {
    return mapValue(translated, (message) => message)
  },
  smartling({ smartling, ...translated }: Record<string, { message: string }>) {
    return mapValue(translated, (message) => message.message)
  },
  transifex(translated: Record<string, { string: string }>) {
    return mapValue(translated, (message) => message.string)
  },
}

export function getFormats(): string[] {
  return Object.keys(prehandlers).concat('crowdin')
}

export function prehandle(name: string, input: unknown): Entries {
  if (input === null || typeof input !== 'object') {
    throw new TypeError('Expected messages to be an object.')
  }
  if (name === 'crowdin') name = 'smartling'
  validate(getFormatSchema(name), input, {
    name: 'Loader',
    baseDataPath: 'source',
  })
  return prehandlers[name](input)
}

function mapValue<T>(input: Record<string, T>, modifier: (value: T) => string): Entries {
  return Object.entries(input).map(([key, value]) => [key, modifier(value)])
}
