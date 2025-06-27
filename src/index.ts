import { MessageFormatElement, parse, ParserOptions } from '@formatjs/icu-messageformat-parser'
import { LoaderDefinition } from 'webpack'
import { validate } from 'schema-utils'

import { prehandle } from './prehandler'
import { getPseudoLocale } from './pseudo-locale'
import { Options, ResourceQuery, schemaOptions, schemaResourceQuery } from './types'

const loader: LoaderDefinition<Options> = function (source) {
  this.cacheable()
  const options = this.getOptions(schemaOptions)
  const pseudoLocale = options.pseudoLocale ?? getResourceQuery(this).pseudoLocale
  const compiled = compile(prehandle(options.format ?? 'default', JSON.parse(source)), {
    ignoreTag: options.ignoreTag,
    requiresOtherClause: options.requiresOtherClause,
    shouldParseSkeletons: options.shouldParseSkeletons,
    posthandler: typeof pseudoLocale === 'string' ? getPseudoLocale(pseudoLocale) : undefined,
  })
  return JSON.stringify(Object.fromEntries(compiled))
}

export default loader

interface CompileOptions extends ParserOptions {
  posthandler?(elements: MessageFormatElement[]): MessageFormatElement[]
}

function compile(messages: [string, string][], options: CompileOptions) {
  type ParsedEntry = readonly [string, MessageFormatElement[]]
  return messages.map(([key, message]): ParsedEntry => {
    const parsed = parse(message, options)
    return [key, options.posthandler?.(parsed) ?? parsed]
  })
}

function getResourceQuery(context: { resourceQuery: string }): ResourceQuery {
  const query = Object.fromEntries(new URLSearchParams(context.resourceQuery))
  validate(schemaResourceQuery, query, {
    name: 'Loader',
    baseDataPath: 'resourceQuery',
  })
  return query
}
