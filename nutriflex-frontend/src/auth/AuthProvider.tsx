import { useRef, useImperativeHandle, useState } from 'react'
import AuthContext from './AuthContext'
import appConfig from '@/configs/app.config'
import { useSessionUser, useToken } from '@/store/authStore'
import { apiSignIn, apiSignOut, apiSignUp } from '@/services/AuthService'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { useNavigate } from 'react-router'
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
                const user: User = {
                    id: resp.data.user.id,
                    fullName: resp.data.user.fullName,
                    email: resp.data.user.email,
                    role: resp.data.user.role,
                    authority: resp.data.user.role ? [resp.data.user.role] : [],
                }
                handleSignIn({ accessToken: resp.data.access_token }, user)
                redirect()
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
            } else {
                errorMessage = errors.toString()
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
