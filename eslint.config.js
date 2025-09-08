import antfu from '@antfu/eslint-config'

export default antfu({
  vue: true,
  formatters: {
    css: 'prettier',
  },
  rules: {
    'ts/no-empty-object-type': 'off',
    'no-console': 'warn',
  },
})
