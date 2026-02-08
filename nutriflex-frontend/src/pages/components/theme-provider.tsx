'use client'

import * as React from 'react'

type ThemeProviderProps = {
    children: React.ReactNode
}

// Simple no-op theme provider to avoid pulling in next-themes
// The main app already has its own Theme wrapper in src/components/template/Theme.tsx
export function ThemeProvider({ children }: ThemeProviderProps) {
    return <>{children}</>
}
