import type { Schema } from 'schema-utils'

const defaultSchema: Schema = {
  title: 'react-intl MessageDescriptor format',
  link: 'https://formatjs.github.io/docs/react-intl/api/#message-descriptor',
  type: 'object',
  additionalProperties: {
    type: 'object',
    properties: {
      defaultMessage: { type: 'string', nullable: true },
    },
    required: ['defaultMessage'],
  },
}

const lokaliasSchema: Schema = {
  title: 'Lokalise (Structured JSON format)',
  link: 'https://docs.lokalise.com/en/articles/3229161-structured-json',
  type: 'object',
  additionalProperties: {
    type: 'object',
    properties: {
      translation: { type: 'string' },
    },
    required: ['translation'],
  },
}

const flatSchema: Schema = {
  title: 'Flat JSON format',
  type: 'object',
  additionalProperties: {
    type: 'string',
  },
}

const smartlingSchema: Schema = {
  title: 'Smartling (Structured JSON format)',
  link: 'https://help.smartling.com/hc/en-us/articles/360008000733-JSON',
  type: 'object',
  anyOf: [
    {
      type: 'object',
      properties: {
        smartling: { type: 'object', nullable: true },
      },
    },
    {
      type: 'object',
      additionalProperties: {
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
        required: ['message'],
      },
    },
  ],
}

const transifexSchema: Schema = {
  title: 'Transifex (Structured JSON format)',
  link: 'https://help.transifex.com/en/articles/6220899-structured-json',
  type: 'object',
  additionalProperties: {
    type: 'object',
    properties: {
      string: { type: 'string' },
    },
    required: ['string'],
  },
}

const schemas: Record<string, Schema> = {
  default: defaultSchema,
  lokalise: lokaliasSchema,
  simple: flatSchema,
  smartling: smartlingSchema,
  transifex: transifexSchema,
}

export function getFormatSchema(name: string): Schema {
  return schemas[name]
}
