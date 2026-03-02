import { themeConfig } from '@/configs/theme.config'
import { THEME_ENUM } from '@/constants/theme.constant'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Theme, LayoutType, Direction } from '@/@types/theme'

type ThemeState = Theme

type ThemeAction = {
    setSchema: (payload: string) => void
    setMode: (payload: ThemeState['mode']) => void
    setSideNavCollapse: (payload: boolean) => void
    setDirection: (payload: Direction) => void
    setPanelExpand: (payload: boolean) => void
    setLayout: (payload: LayoutType) => void
    setPreviousLayout: (payload: LayoutType | '') => void
}

const inititialThemeState = themeConfig

export const useThemeStore = create<ThemeState & ThemeAction>()(
    persist(
        (set) => ({
            ...inititialThemeState,
            setSchema: (payload) => set(() => ({ themeSchema: payload })),
            setMode: (payload) => set(() => ({ mode: payload })),
            setSideNavCollapse: (payload) =>
                set((state) => ({
                    layout: { ...state.layout, sideNavCollapse: payload },
                })),
            setDirection: (payload) => set(() => ({ direction: payload })),
            setPanelExpand: (payload) => set(() => ({ panelExpand: payload })),
            setLayout: (payload) =>
                set((state) => ({
                    layout: { ...state.layout, type: payload },
                })),
            setPreviousLayout: (payload) =>
                set((state) => ({
                    layout: { ...state.layout, previousType: payload },
                })),
        }),
        {
            name: 'theme',
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => (state, err) => {
                if (err) return
                if (state?.mode && typeof document !== 'undefined') {
                    const root = document.documentElement
                    const { MODE_DARK, MODE_LIGHT } = THEME_ENUM
                    root.classList.remove(
                        state.mode === MODE_DARK ? MODE_LIGHT : MODE_DARK,
                    )
                    root.classList.add(state.mode)
                }
            },
        },
    ),
)
