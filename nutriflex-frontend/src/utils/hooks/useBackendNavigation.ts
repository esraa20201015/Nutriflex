import { useEffect, useState } from 'react'
import { apiGetMenu } from '@/services/MenuService'
import {
    NAV_ITEM_TYPE_TITLE,
    NAV_ITEM_TYPE_ITEM,
} from '@/constants/navigation.constant'
import type { NavigationTree } from '@/@types/navigation'
import type { MenuCategory } from '@/@types/menu'

const mapCategoriesToNavigationTree = (
    categories: MenuCategory[],
): NavigationTree[] => {
    return categories.map((category) => ({
        key: category.id,
        path: '',
        title: category.label,
        translateKey: '',
        icon: category.icon,
        type: NAV_ITEM_TYPE_TITLE,
        authority: category.roles || [],
        subMenu:
            category.items?.map((item) => ({
                key: `${category.id}.${item.id}`,
                path: item.path,
                title: item.label,
                translateKey: '',
                icon: item.icon,
                type: NAV_ITEM_TYPE_ITEM,
                authority: item.roles || [],
                subMenu: [],
            })) || [],
    }))
}

const useBackendNavigation = () => {
    const [navigationTree, setNavigationTree] = useState<NavigationTree[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        let mounted = true

        const load = async () => {
            setLoading(true)
            try {
                const resp = await apiGetMenu()
                if (!mounted || !resp?.data?.categories) {
                    return
                }
                const mapped = mapCategoriesToNavigationTree(resp.data.categories)
                setNavigationTree(mapped)
            } catch {
                // If menu fails to load, leave navigationTree empty
                setNavigationTree([])
            } finally {
                if (mounted) {
                    setLoading(false)
                }
            }
        }

        load()

        return () => {
            mounted = false
        }
    }, [])

    return {
        navigationTree,
        loading,
    }
}

export default useBackendNavigation

