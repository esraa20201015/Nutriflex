export const apiPrefix = '/api'

const endpointConfig = {
    signIn: '/auth/sign-in',
    signOut: '/auth/sign-out',
    signUp: '/auth/sign-up',
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password',
    verifyEmail: '/auth/verify-email',
    // User Management endpoints (Admin only)
    users: '/users',
    usersSearch: '/users/search',
    // Navigation / menu
    menu: '/menu',
}

export default endpointConfig
