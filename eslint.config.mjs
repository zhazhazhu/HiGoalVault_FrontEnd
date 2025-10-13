import antfu from '@antfu/eslint-config'

export default antfu({
  vue: true,
  formatters: {
    css: 'prettier',
  },
  rules: {
    'ts/no-empty-object-type': 'off',
    'no-console': 'off',
    'ts/ban-ts-comment': 'off',
  },
  ignores: [
    '**/node_modules/**',
    '**/dist/**',
    'src/wxcomponents/**',
  ],
})
