import type { Schema } from 'schema-utils'

import { getFormats } from './prehandler'
import { getPseudoLocaleNames } from './pseudo-locale'

export const schemaOptions: Schema = {
  type: 'object',
  properties: {
    format: {
      enum: getFormats(),
      default: 'default',
    },
    pseudoLocale: {
      enum: getPseudoLocaleNames(),
    },
    ignoreTag: {
      type: 'boolean',
    },
    requiresOtherClause: {
      type: 'boolean',
    },
    shouldParseSkeletons: {
      type: 'boolean',
    },
  },
  additionalProperties: false,
}

export const schemaResourceQuery: Schema = {
  type: 'object',
  properties: {
    'pseudo-locale': {
      enum: getPseudoLocaleNames(),
    },
  },
  additionalProperties: false,
}

export interface Options {
  readonly format?: string
  readonly pseudoLocale?: string
  readonly ignoreTag?: boolean
  readonly requiresOtherClause?: boolean
  readonly shouldParseSkeletons?: boolean
}

export interface ResourceQuery {
  readonly pseudoLocale?: string
}
