export type AppConfig = {
    apiPrefix: string
    authenticatedEntryPath: string
    unAuthenticatedEntryPath: string
    locale: string
    accessTokenPersistStrategy: 'localStorage' | 'sessionStorage' | 'cookies'
    enableMock: boolean
    activeNavTranslation: boolean
}

// Get API URL from environment variable or use default
// In development, Vite proxy handles /api -> http://localhost:3000
// In production, set VITE_API_BASE_URL environment variable
const getApiPrefix = () => {
    // Check if we're in development (Vite proxy will handle /api)
    if (import.meta.env.DEV) {
        return '/api'
    }
    // In production, use environment variable or default to /api
    return import.meta.env.VITE_API_BASE_URL || '/api'
}

const appConfig: AppConfig = {
    apiPrefix: getApiPrefix(),
    authenticatedEntryPath: '/home',
    unAuthenticatedEntryPath: '/sign-in',
    locale: 'en',
    accessTokenPersistStrategy: 'cookies',
    enableMock: false, // Disable mock to connect to real backend
    activeNavTranslation: false,
}

export default appConfig
