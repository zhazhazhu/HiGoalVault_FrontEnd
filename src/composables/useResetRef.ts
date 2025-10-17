import type { MaybeRef } from 'vue'
import cloneDeepWith from 'lodash-es/cloneDeepWith'
import { isRef, ref } from 'vue'

export function useResetRef<T>(value: MaybeRef<T>) {
  const _valueDefine = cloneDeepWith(value as any)
  const _value = isRef(value) ? value : ref(value)

  function reset(value?: T) {
    _value.value = value ? cloneDeepWith(value) : cloneDeepWith(_valueDefine)
  }

  return [_value, reset] as const
}
