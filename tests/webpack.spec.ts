import { MessageFormatElement } from '@formatjs/icu-messageformat-parser'
import { expect } from 'chai'
import 'mocha'
import { WebpackCompiler } from './helpers'

describe('Webpack', () => {
  describe('Formats', () => {
    const variants = new Map<string, string>([
      ['default', 'messages.default.json'],
      ['simple', 'messages.simple.json'],
      ['crowdin', 'messages.smartling.json'],
      ['lokalise', 'messages.lokalise.json'],
      ['transifex', 'messages.transifex.json'],
      ['smartling', 'messages.smartling.json'],
    ])

    const expected: Record<string, MessageFormatElement[]> = {
      hello: [{ type: 0, value: 'world' }],
      tag: [{ type: 8, value: 'i', children: [{ type: 0, value: 'hello world' }] }],
    }

    for (const [format, name] of variants.entries()) {
      it(format, async () => {
        const instance = new WebpackCompiler(name, { format })
        const { compilation } = await instance.run()
        expect(compilation.errors).lengthOf(0)
        expect(compilation.warnings).lengthOf(0)
        expect(await instance.execute()).deep.equals(expected)
      })
    }

    it('invalid input', async () => {
      const instance = new WebpackCompiler('messages.default.json', {
        format: 'simple',
      })
      const { compilation } = await instance.run()
      expect(compilation.errors).lengthOf(1)
      expect(compilation.errors[0].message).include('Invalid source object.')
      expect(compilation.warnings).lengthOf(0)
    })

    it('invalid format name', async () => {
      const instance = new WebpackCompiler('messages.default.json', {
        format: 'invalid',
      })
      const { compilation } = await instance.run()
      expect(compilation.errors).lengthOf(1)
      expect(compilation.errors[0].message).include('options.format should be one of these')
      expect(compilation.warnings).lengthOf(0)
    })
  })

  describe('Pseudo-Locales', async () => {
    const variants = new Map<string, Record<string, string>>([
      ['xx-LS', { hello: 'worldSSSSSSSSSSSSSSSSSSSSSSSSS', tag: '<i>hello world</i>SSSSSSSSSSSSSSSSSSSSSSSSS' }],
      ['xx-AC', { hello: 'WORLD', tag: '<i>HELLO WORLD</i>' }],
      ['xx-HA', { hello: '[javascript]world', tag: '[javascript]<i>hello world</i>' }],
      ['en-XA', { hello: '[ẇǿǿřŀḓ]', tag: '[<i>ħḗḗŀŀǿǿ ẇǿǿřŀḓ</i>]' }],
      ['en-XB', { hello: '\u202eʍoɹʅp\u202c', tag: '\u202e<i>ɥǝʅʅo ʍoɹʅp</i>\u202c' }],
    ])

    for (const [pseudoLocale, expexted] of variants.entries()) {
      it(pseudoLocale, async () => {
        const instance = new WebpackCompiler('messages.default.json', { pseudoLocale })
        const { compilation } = await instance.run()
        expect(compilation.errors).lengthOf(0)
        expect(compilation.warnings).lengthOf(0)
        const messages = await instance.getMessages()
        expect(messages).deep.equals(expexted)
      })
    }

    it('invalid pseudo-locale', async () => {
      const instance = new WebpackCompiler('messages.default.json', { pseudoLocale: 'invalid' })
      const { compilation } = await instance.run()
      expect(compilation.errors).lengthOf(1)
      expect(compilation.errors[0].message).include('options.pseudoLocale should be one of these')
      expect(compilation.warnings).lengthOf(0)
    })

    it('with resource query', async () => {
      const instance = new WebpackCompiler('messages.default.json?pseudo-locale=xx-LS')
      const { compilation } = await instance.run()
      expect(compilation.errors).lengthOf(0)
      expect(compilation.warnings).lengthOf(0)
    })

    it('with resource query (invalid)', async () => {
      const compiler = new WebpackCompiler('messages.default.json?pseudo-locale=invalid')
      const { compilation } = await compiler.run()
      expect(compilation.errors).lengthOf(1)
      expect(compilation.errors[0].message).include('resourceQuery.pseudo-locale should be one of these')
      expect(compilation.warnings).lengthOf(0)
    })
  })

  it('Ignore Tags', async () => {
    const instance = new WebpackCompiler('messages.simple.json', {
      format: 'simple',
      ignoreTag: true,
    })
    const expected: Record<string, MessageFormatElement[]> = {
      hello: [{ type: 0, value: 'world' }],
      tag: [{ type: 0, value: '<i>hello world</i>' }],
    }
    const { compilation } = await instance.run()
    expect(compilation.errors).lengthOf(0)
    expect(compilation.warnings).lengthOf(0)
    expect(await instance.execute()).deep.equals(expected)
  })

  it('null', async () => {
    const instance = new WebpackCompiler('null.json')
    const { compilation } = await instance.run()
    expect(compilation.errors).lengthOf(1)
    expect(compilation.errors[0].message).include('Expected messages to be an object.')
    expect(compilation.warnings).lengthOf(0)
  })
})
