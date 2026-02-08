/**
 * Debug utility to check user authority
 * Use this in browser console: window.debugAuth()
 */

import { useSessionUser } from '@/store/authStore'

export const debugUserAuthority = () => {
    const user = useSessionUser.getState().user
    const session = useSessionUser.getState().session
    
    console.log('=== User Authority Debug ===')
    console.log('User:', user)
    console.log('User Role:', user.role)
    console.log('User Authority:', user.authority)
    console.log('Session Signed In:', session.signedIn)
    console.log('Expected ADMIN:', 'ADMIN')
    console.log('Authority includes ADMIN:', user.authority?.includes('ADMIN'))
    console.log('===========================')
    
    return {
        user,
        role: user.role,
        authority: user.authority,
        hasAdmin: user.authority?.includes('ADMIN'),
    }
}

// Make available globally in development
if (import.meta.env.DEV) {
    // @ts-ignore
    window.debugAuth = debugUserAuthority
    console.log('💡 Debug auth available: window.debugAuth()')
}
