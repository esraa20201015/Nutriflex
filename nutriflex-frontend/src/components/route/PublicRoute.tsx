import { Navigate, Outlet } from 'react-router'
import appConfig from '@/configs/app.config'
import { useAuth } from '@/auth'
import { getDashboardPathForRole } from '@/auth/AuthProvider'

const { authenticatedEntryPath } = appConfig

const PublicRoute = () => {
    const { authenticated, user } = useAuth()
    const role = user?.role as string | undefined

    return authenticated ? (
        <Navigate
            to={getDashboardPathForRole(role) || authenticatedEntryPath}
            replace
        />
    ) : (
        <Outlet />
    )
}

export default PublicRoute
