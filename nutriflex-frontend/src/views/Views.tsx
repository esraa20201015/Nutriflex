import { Suspense } from 'react'
import CustomIndicator from '@/components/shared/CustomIndicator'
import AllRoutes from '@/components/route/AllRoutes'
import { useLocation } from 'react-router'
import type { LayoutType } from '@/@types/theme'

interface ViewsProps {
    pageContainerType?: 'default' | 'gutterless' | 'contained'
    layout?: LayoutType
}

const Views = (props: ViewsProps) => {
    const location = useLocation()

    return (
        <Suspense
            key={location.key}
            fallback={<CustomIndicator />}
        >
            <AllRoutes {...props} />
        </Suspense>
    )
}

export default Views
