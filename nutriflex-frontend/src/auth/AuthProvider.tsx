import { useRef, useImperativeHandle, useState } from 'react'
import AuthContext from './AuthContext'
import appConfig from '@/configs/app.config'
import { useSessionUser, useToken } from '@/store/authStore'
import { apiSignIn, apiSignOut, apiSignUp } from '@/services/AuthService'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { useNavigate } from 'react-router'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import type {
    SignInCredential,
    SignUpCredential,
    AuthResult,
    OauthSignInCallbackPayload,
    User,
    Token,
} from '@/@types/auth'
import type { ReactNode, Ref } from 'react'
import type { NavigateFunction } from 'react-router'

type AuthProviderProps = { children: ReactNode }

/** Role-based dashboard path for post-login redirect. Case-insensitive so backend can return "Admin", "ADMIN", etc. */
function getDashboardPathForRole(role: string | undefined): string {
    const r = role?.toUpperCase()
    if (r === 'ADMIN') return '/admin/dashboard'
    if (r === 'COACH') return '/coach/dashboard'
    if (r === 'TRAINEE') return '/trainee/dashboard'
    return appConfig.authenticatedEntryPath
}

/** Normalize role from backend (string or object with name). */
function normalizeRole(role: unknown): string | undefined {
    if (typeof role === 'string' && role) return role
    if (role && typeof role === 'object' && 'name' in role && typeof (role as { name: string }).name === 'string') {
        return (role as { name: string }).name
    }
    return undefined
}

export type IsolatedNavigatorRef = {
    navigate: NavigateFunction
}

const IsolatedNavigator = ({ ref }: { ref: Ref<IsolatedNavigatorRef> }) => {
    const navigate = useNavigate()

    useImperativeHandle(ref, () => {
        return {
            navigate,
        }
    }, [navigate])

    return <></>
}

function AuthProvider({ children }: AuthProviderProps) {
    const signedIn = useSessionUser((state) => state.session.signedIn)
    const user = useSessionUser((state) => state.user)
    const setUser = useSessionUser((state) => state.setUser)
    const setSessionSignedIn = useSessionUser(
        (state) => state.setSessionSignedIn,
    )
    const { token, setToken } = useToken()
    const [tokenState, setTokenState] = useState(token)

    const authenticated = Boolean(tokenState && signedIn)

    const navigatorRef = useRef<IsolatedNavigatorRef>(null)

    const redirect = () => {
        const search = window.location.search
        const params = new URLSearchParams(search)
        const redirectUrl = params.get(REDIRECT_URL_KEY)

        navigatorRef.current?.navigate(
            redirectUrl ? redirectUrl : appConfig.authenticatedEntryPath,
        )
    }

    const handleSignIn = (tokens: Token, user?: User) => {
        setToken(tokens.accessToken)
        setTokenState(tokens.accessToken)
        setSessionSignedIn(true)

        if (user) {
            setUser(user)
        }
    }

    const handleSignOut = () => {
        setToken('')
        setUser({})
        setSessionSignedIn(false)
    }

    const signIn = async (values: SignInCredential): AuthResult => {
        try {
            const resp = await apiSignIn(values)
            if (resp && resp.data) {
                const role = normalizeRole(resp.data.user.role)
                const user: User = {
                    id: resp.data.user.id,
                    fullName: resp.data.user.fullName,
                    email: resp.data.user.email,
                    role: role ?? resp.data.user.role,
                    authority: role ? [role] : [],
                }
                handleSignIn({ accessToken: resp.data.access_token }, user)
                const search = window.location.search
                const params = new URLSearchParams(search)
                const redirectUrl = params.get(REDIRECT_URL_KEY)
                const targetPath = redirectUrl || getDashboardPathForRole(role)
                navigatorRef.current?.navigate(targetPath)
                return {
                    status: 'success',
                    message: '',
                }
            }
            return {
                status: 'failed',
                message: 'Unable to sign in',
            }
            // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        } catch (errors: any) {
            const errorData = errors?.response?.data
            let errorMessage = 'Unable to sign in'

            if (errors?.code === 'ERR_NETWORK' || errors?.message === 'Network Error') {
                errorMessage =
                    'Cannot reach the server. Make sure the backend is running (e.g. on http://localhost:3000) and the dev proxy is used.'
            } else if (errorData) {
                if (Array.isArray(errorData.message)) {
                    errorMessage = errorData.message.join(', ')
                } else if (errorData.messageEn) {
                    errorMessage = errorData.messageEn
                } else if (typeof errorData.message === 'string') {
                    errorMessage = errorData.message
                } else if (errorData.messageAr) {
                    errorMessage = errorData.messageAr
                }
            } else if (errors?.message) {
                errorMessage = errors.message
            }

            return {
                status: 'failed',
                message: errorMessage,
            }
        }
    }

    const signUp = async (values: SignUpCredential): AuthResult => {
        try {
            const resp = await apiSignUp(values)
            if (resp && resp.data) {
                // For sign up, we don't automatically sign in if email verification is required
                // The backend will return isEmailVerified status
                if (resp.data.isEmailVerified) {
                    // If email is already verified, we can sign in
                    // But we need to sign in separately since sign-up doesn't return a token
                    return {
                        status: 'success',
                        message: resp.messageEn || 'Sign up successful. Please sign in.',
                    }
                } else {
                    // Email verification required
                    return {
                        status: 'success',
                        message:
                            resp.messageEn ||
                            'Sign up successful. Please check your email to verify your account.',
                    }
                }
            }
            return {
                status: 'failed',
                message: 'Unable to sign up',
            }
            // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        } catch (errors: any) {
            // Handle validation errors (array) or single error messages
            const errorData = errors?.response?.data
            let errorMessage = 'Unable to sign up'

            if (errorData) {
                if (Array.isArray(errorData.message)) {
                    errorMessage = errorData.message.join(', ')
                } else if (errorData.messageEn) {
                    errorMessage = errorData.messageEn
                } else if (typeof errorData.message === 'string') {
                    errorMessage = errorData.message
                } else if (errorData.messageAr) {
                    errorMessage = errorData.messageAr
                }

                // Show a persistent toast for email conflict (409)
                if (errorData.statusCode === 409) {
                    toast.push(
                        <Notification
                            type="danger"
                            title="Sign up error"
                            closable
                            duration={0}
                        >
                            {errorMessage}
                        </Notification>,
                        {
                            placement: 'top-center',
                        },
                    )
                }
            }

            return {
                status: 'failed',
                message: errorMessage,
            }
        }
    }

    const signOut = async () => {
        try {
            await apiSignOut()
        } finally {
            handleSignOut()
            navigatorRef.current?.navigate('/')
        }
    }
    const oAuthSignIn = (
        callback: (payload: OauthSignInCallbackPayload) => void,
    ) => {
        callback({
            onSignIn: handleSignIn,
            redirect,
        })
    }

    return (
        <AuthContext.Provider
            value={{
                authenticated,
                user,
                signIn,
                signUp,
                signOut,
                oAuthSignIn,
            }}
        >
            {children}
            <IsolatedNavigator ref={navigatorRef} />
        </AuthContext.Provider>
    )
}

export default AuthProvider
