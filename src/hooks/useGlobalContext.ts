import type { Ref } from 'vue'
import { inject, provide, ref } from 'vue'

export interface GlobalContext {
  headHeight: number
  setHeadHeight: (headHeight: number) => void
  menuWidth: number
  setMenuWidth: (menuWidth: number) => void
  scrollTop: number
  setScrollTop: (y?: number) => void
  scrollContentRef: HTMLDivElement | null | undefined
  setScrollContentRef: (scrollContentRef?: HTMLDivElement | null) => void
}

const globalProvideSymbol = Symbol()

export const useGlobalProvide = () => {
  const globalContext = ref<GlobalContext>({
    headHeight: 0,
    setHeadHeight: () => {},
    menuWidth: 0,
    setMenuWidth: () => {},
    scrollTop: 0,
    setScrollTop: () => {},
    scrollContentRef: null,
    setScrollContentRef: () => {},
  })

  globalContext.value.setHeadHeight = (headHeight: number) => {
    globalContext.value.headHeight = headHeight
  }

  const setMenuWidth = (menuWidth: number) => {
    globalContext.value.menuWidth = menuWidth
  }
  globalContext.value.setMenuWidth = setMenuWidth

  const setScrollTop = (y: number = 0) => {
    const { scrollContentRef } = globalContext.value
    globalContext.value.scrollTop = y
    if (scrollContentRef) {
      if (scrollContentRef.scrollTop !== y) {
        scrollContentRef.scrollTop = y
      }
    }
  }
  globalContext.value.setScrollTop = setScrollTop

  const setScrollContentRef = (scrollContentRef?: HTMLDivElement | null) => {
    globalContext.value.scrollContentRef = scrollContentRef
  }
  globalContext.value.setScrollContentRef = setScrollContentRef

  provide(globalProvideSymbol, globalContext)
}

export const useGlobalContext = () => {
  return inject(globalProvideSymbol) as Ref<GlobalContext>
}
