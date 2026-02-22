import appConfig from '@/configs/app.config'
import {
    TOKEN_TYPE,
    REQUEST_HEADER_AUTH_KEY,
    TOKEN_NAME_IN_STORAGE,
} from '@/constants/api.constant'
import cookiesStorage from '@/utils/cookiesStorage'
import type { InternalAxiosRequestConfig } from 'axios'

/** Attaches stored access token as Authorization: Bearer <token> so backend can identify user and scope dashboard data by role/userId. */
const AxiosRequestIntrceptorConfigCallback = (
    config: InternalAxiosRequestConfig,
) => {
    const storage = appConfig.accessTokenPersistStrategy
    let accessToken = ''

    if (storage === 'localStorage') {
        accessToken = localStorage.getItem(TOKEN_NAME_IN_STORAGE) || ''
    } else if (storage === 'sessionStorage') {
        accessToken = sessionStorage.getItem(TOKEN_NAME_IN_STORAGE) || ''
    } else if (storage === 'cookies') {
        // For cookies, we still need to send token in Authorization header
        // Cookies are used for persistence, but JWT tokens need to be in headers
        const cookieToken = cookiesStorage.getItem(TOKEN_NAME_IN_STORAGE)
        accessToken = cookieToken || ''
    }

    if (accessToken) {
        config.headers[REQUEST_HEADER_AUTH_KEY] =
            `${TOKEN_TYPE}${accessToken}`
    }

    return config
}

export default AxiosRequestIntrceptorConfigCallback
