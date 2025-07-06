import { MessageFormatElement, parse, ParserOptions } from '@formatjs/icu-messageformat-parser'
import { validate } from 'schema-utils'
import { LoaderDefinition } from 'webpack'

import { prehandle } from './prehandler'
import { getPseudoLocale, Handler } from './pseudo-locale'
import { Options, ResourceQuery, schemaOptions, schemaResourceQuery } from './types'

const loader: LoaderDefinition<Options> = function (source) {
  this.cacheable()
  const options = this.getOptions(schemaOptions)
  const compiled = compile(prehandle(options.format ?? 'default', JSON.parse(source)), {
    ignoreTag: options.ignoreTag,
    requiresOtherClause: options.requiresOtherClause,
    shouldParseSkeletons: options.shouldParseSkeletons,
    handlers: [
      // 1. Pseudo-locales
      getPseudoLocale(options.pseudoLocale ?? getResourceQuery(this).pseudoLocale),
    ],
  })
  return JSON.stringify(Object.fromEntries(compiled))
}

export default loader

interface CompileOptions extends ParserOptions {
  readonly handlers: readonly (Handler | undefined)[]
}

function compile(messages: [string, string][], { handlers, ...options }: CompileOptions) {
  return messages.map(([key, message]): [string, MessageFormatElement[]] => {
    const elements = handlers.reduceRight<Iterable<MessageFormatElement>>(
      (elements, handler) => handler?.(elements) ?? elements,
      parse(message, options)
    )
    return [key, Array.from(elements)]
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
