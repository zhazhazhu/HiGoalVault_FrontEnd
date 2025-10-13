const namespaced = 'hi'

const isPrefix = 'is-'

export function useClassesName(block: string) {
  const s = () => `${namespaced}-${block}`

  const m = (modifier?: string) => (modifier ? `${s()}--${modifier}` : '')

  const e = (element?: string) => (element ? `${s()}__${element}` : '')

  const is = (name: string, state?: boolean) =>
    state ? `${isPrefix}${name}` : ''

  return { s, m, e, is }
}
