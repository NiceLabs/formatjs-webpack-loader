# @nice-labs/formatjs-webpack-loader

A webpack loader for [FormatJS](https://formatjs.io), precompiles ICU MessageFormat strings, improve performance by avoiding runtime parsing of ICU messages.

## Features

- Through Webpack loader precompile ICU MessageFormat strings
- Integrates seamlessly with webpack build process.

## Installation

```bash
npm install --save-dev @nice-labs/formatjs-webpack-loader
```

## Usage

Add the loader to your webpack configuration:

```typescript
import * as path from 'node:path'
import type { Configuration } from 'webpack'

export default {
  // ...
  resolve: {
    // See <https://formatjs.github.io/docs/guides/advanced-usage>
    alias: {
      '@formatjs/icu-messageformat-parser': '@formatjs/icu-messageformat-parser/no-parser',
    },
  },
  // ...
  module: {
    rules: [
      // ...
      {
        test: /\.json$/,
        loader: require.resolve('@nice-labs/formatjs-webpack-loader'),
        options: {
          // Loader options here
        },
        include: [
          // Specify the directories or files to include
          path.resolve(__dirname, 'src', 'locales'),
        ],
      },
      // ...
    ],
  },
  // ...
} satisfies Configuration
```

in the above example, the loader is applied to all `.json` files in the `src/locales` directory.

in your source code, you can import the messages like this:

```typescript
import messages from './locales/en-US.json'
// stored file format: Record<string, MessageDescriptor>
//   used file format: Record<string, MessageFormatElement[]>
```

Precompiled files do not need to be stored or tracked in codebase, this webpack loader will handle it for you

## Loader Options

### **`format`** (optional, default: `default`)

The format of the input. It can be one of the following:

- [`default`]
- [`lokalise`]
- `simple`: flattern object
- [`smartling`]
- [`transifex`]

[`default`]: https://formatjs.github.io/docs/react-intl/api/#message-descriptor
[`lokalise`]: https://docs.lokalise.com/en/articles/3229161-structured-json
[`smartling`]: https://help.smartling.com/hc/en-us/articles/360008000733-JSON
[`transifex`]: https://help.transifex.com/en/articles/6220899-structured-json

### **`pseudo-locale`** (optional, default: unset)

The pseudo locale to use for the input. It can be one of the following:

- `xx-LS`: Append `'S' * 25` at the end to simulate long string
- `xx-AC`: `toUpperCase` everything
- `xx-HA`: Prefix `[javascript]` to the message
- `en-XA`: Convert letter to **hebrew letter**
- `en-XB`: Convert letter to **accented letter**

See <https://github.com/formatjs/formatjs/issues/2165#issuecomment-701738341>

### **`ignoreTag`** (optional, default: `false`)

Whether to treat HTML/XML tags as string literal instead of parsing them as tag token.
When this is false we only allow simple tags without any attributes

### **`requiresOtherClause`** (optional, default: `false`)

Should `select`, `selectordinal`, and `plural` arguments always include the `other` case clause.

### **`shouldParseSkeletons`** (optional, default: `false`)

Whether to parse number/datetime skeleton into [Intl.NumberFormatOptions] and [Intl.DateTimeFormatOptions], respectively.

[Intl.NumberFormatOptions]: https://formatjs.github.io/docs/intl/#formatnumber
[Intl.DateTimeFormatOptions]: https://formatjs.github.io/docs/intl/#formatdate

## Resource Query

### **`pseudo-locale`**

for example:

```ts
import messages from './locales/en-US.json?pseudo-locale=xx-LS'
// pseudo locale will be applied to the messages
```

more see <https://webpack.js.org/concepts/loaders/>

## LICENSE

[MIT LICENSE](LICENSE.txt)
