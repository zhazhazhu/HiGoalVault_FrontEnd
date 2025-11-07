import type { Component, ComponentInternalInstance, InjectionKey, Ref, VNode, VNodeNormalizedChildren } from 'vue'
import type Tabs from './index.vue'
import type TabItem from './item.vue'
import { computed, getCurrentInstance, provide, ref, watch } from 'vue'
import { useUUID } from '@/composables'

type TabsProps = InstanceType<typeof Tabs>['$props']
type TabsEmits = InstanceType<typeof Tabs>['$emit']
type TabChildrenProps = InstanceType<typeof TabItem>['$props']
interface Navs {
  name: string | number
  label?: string | number
  icon?: string
  right?: boolean
}
type UseTabChildren = ReturnType<typeof useTabChild>
interface InjectTabsContext extends UseTabChildren {
  activeName: Ref<string | number>
}

export type { InjectTabsContext, Navs, TabChildrenProps, UseTabChildren }

export const TABS_INJECTION_KEY: InjectionKey<InjectTabsContext>
  = Symbol(useUUID())

export function useTabs(props: TabsProps, emit: TabsEmits) {
  const instance = getCurrentInstance()!
  const activeName = ref(props.modelValue || 0)

  watch(() => props.modelValue, (val) => {
    activeName.value = val || 0
  })

  watch(activeName, (val) => {
    emit('update:modelValue', val)
    emit('tabChange', val)
  })

  const tabPanes = useTabChild(instance, 'TabItem')

  const navs = computed<Navs[]>(() => {
    const array = tabPanes.children.value.map(item => ({
      label: item.slots.label?.() || item.props?.label,
      name: item.props.name,
      icon: item.props?.icon,
    }) as Navs)
    return array
  })

  provide(TABS_INJECTION_KEY, {
    ...tabPanes,
    activeName,
  })

  return { navs }
}

export function useTabChild(vm: ComponentInternalInstance, name: string) {
  const children = ref<ComponentInternalInstance[]>([])
  function registerChild(child: ComponentInternalInstance) {
    // 如果vm.subTree为空，直接添加子组件到children中
    if (!vm.subTree) {
      // 当vm.subTree为空时，直接添加子组件
      children.value.push(child as any)
      return
    }

    const childComponents = getChildrenComponents(vm, name)

    const _uidList = childComponents
      .map((e) => {
        return e.component ? e.component.uid : null
      })
      .filter(Boolean) as number[]

    // 如果找不到子组件，也直接添加
    if (_uidList.length === 0) {
      children.value.push(child as any)
      return
    }

    _uidList.forEach((uid) => {
      if (uid === child.uid)
        children.value.push(child as any)
    })
  }
  function unRegisterChild(child: ComponentInternalInstance) {
    children.value = children.value.filter(item => item.uid !== child.uid)
  }

  return {
    children,
    registerChild,
    unRegisterChild,
  } as const
}

export function getChildrenComponents(vm: ComponentInternalInstance, name: string) {
  if (!vm.subTree)
    return []
  const { children } = vm.subTree
  // 扁平化子节点
  const vNodes = flattedVNode(children)

  // 过滤子节点
  return vNodes.filter(vNode => (vNode.type as Component).name === name)
}

export function flattedVNode(children: VNodeNormalizedChildren | VNode) {
  const vNodes = Array.isArray(children) ? children : [children]
  const result: VNode[] = []

  vNodes.forEach((vNode) => {
    if (vNode.children && Array.isArray(vNode.children)) {
      result.push(...flattedVNode(vNode?.children))
    }
    else {
      if (vNode.component)
        result.push(vNode)
    }
    return result
  })

  return result
}
