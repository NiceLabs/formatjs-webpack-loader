import { MessageFormatElement } from '@formatjs/icu-messageformat-parser'
import { printAST } from '@formatjs/icu-messageformat-parser/printer'
import { createFsFromVolume, IFs, Volume } from 'memfs'
import Module from 'node:module'
import * as path from 'node:path'
import { Compiler, OutputFileSystem, Stats, webpack } from 'webpack'

import type { Options } from '../src/types'

const fixturePath = path.resolve(__dirname, 'fixtures')
const distPath = path.resolve(__dirname, '..', 'dist')

export class WebpackCompiler {
  private readonly basePath = '/'
  private readonly instance: Compiler

  constructor(fixture: string, loaderOptions?: Options) {
    this.instance = webpack({
      mode: 'development',
      devtool: false,
      context: fixturePath,
      entry: path.resolve(fixturePath, fixture),
      output: { path: this.basePath, libraryTarget: 'commonjs-module' },
      module: { rules: [{ test: /\.json$/, type: 'json', loader: distPath, options: loaderOptions }] },
    })
    this.instance.outputFileSystem = createFsFromVolume(new Volume()) as OutputFileSystem
  }

  run(): Promise<Stats> {
    return new Promise((resolve, reject) => {
      this.instance.run((err, stats) => (err ? reject(err) : resolve(stats!)))
    })
  }

  private get fs(): IFs {
    return this.instance.outputFileSystem as IFs
  }

  private getEntryFile(name = 'main.js'): Promise<string> {
    return this.fs.promises.readFile(path.join(this.basePath, name), 'utf-8') as Promise<string>
  }

  async execute(): Promise<Record<string, MessageFormatElement[]>> {
    return execute(await this.getEntryFile())
  }

  async getMessages(): Promise<Record<string, string>> {
    const messages = await this.execute()
    return Object.fromEntries(Object.entries(messages).map(([key, value]) => [key, printAST(value)]))
  }
}

export function execute<T>(codeblock: string): T {
  const module = new Module('example.js', globalThis.module)
  module.filename = module.id
  module['_compile'](codeblock, module.id)
  return module.exports
}
