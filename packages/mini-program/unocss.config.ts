import transformerDirectives from '@unocss/transformer-directives'
import { presetIcons } from 'unocss'
import { presetWeapp } from 'unocss-preset-weapp'

import { extractorAttributify, transformerClass } from 'unocss-preset-weapp/transformer'

const { presetWeappAttributify, transformerAttributify } = extractorAttributify()

export default {
  presets: [
    // https://github.com/MellowCo/unocss-preset-weapp
    presetWeapp(),
    // attributify autocomplete
    presetWeappAttributify(),
    presetIcons(),
  ],
  shortcuts: [
    {
      'border-base': 'border border-gray-500_10',
      'center': 'flex justify-center items-center',
    },
  ],
  transformers: [
    transformerDirectives({
      enforce: 'pre',
    }),

    // https://github.com/MellowCo/unocss-preset-weapp/tree/main/src/transformer/transformerAttributify
    transformerAttributify(),

    // https://github.com/MellowCo/unocss-preset-weapp/tree/main/src/transformer/transformerClass
    transformerClass(),
  ],
  theme: {
    colors: {
      primary: 'var(--hi-primary-color)',
      secondary: 'var(--hi-secondary-color)',
      h1Color: 'var(--hi-h1-color)',
      h2Color: 'var(--hi-h2-color)',
      h3Color: 'var(--hi-h3-color)',
    },
  },
}
