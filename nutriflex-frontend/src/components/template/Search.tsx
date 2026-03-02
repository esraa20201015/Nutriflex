import { useState, useRef, useEffect, useMemo } from 'react'
import classNames from '@/utils/classNames'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import ScrollBar from '@/components/ui/ScrollBar'
import navigationIcon from '@/configs/navigation-icon.config'
import debounce from 'lodash/debounce'
import { HiOutlineSearch, HiChevronRight } from 'react-icons/hi'
import { PiMagnifyingGlassDuotone } from 'react-icons/pi'
import { Link } from 'react-router'
import Highlighter from 'react-highlight-words'
import useBackendNavigation from '@/utils/hooks/useBackendNavigation'
import { useSessionUser } from '@/store/authStore'
import { protectedRoutes } from '@/configs/routes.config'
import { NAV_ITEM_TYPE_ITEM } from '@/constants/navigation.constant'
import isEmpty from 'lodash/isEmpty'
import type { NavigationTree } from '@/@types/navigation'

type SearchData = {
    key: string
    path: string
    title: string
    icon: string
    category: string
    categoryTitle: string
}

type SearchResult = {
    title: string
    data: SearchData[]
}

const recommendedSearch: SearchResult[] = [
    {
        title: 'Recommended',
        data: [],
    },
]

/** Flatten navigation tree into searchable items; filter by user authority. */
function flattenNavigationForSearch(
    tree: NavigationTree[],
    userAuthority: string[],
): SearchData[] {
    const items: SearchData[] = []

    function visit(node: NavigationTree, categoryTitle: string) {
        if (node.type === NAV_ITEM_TYPE_ITEM && node.path) {
            const allowed =
                isEmpty(node.authority) ||
                node.authority.some((r) => userAuthority.includes(r))
            if (allowed) {
                items.push({
                    key: node.key,
                    path: node.path,
                    title: node.title,
                    icon: node.icon,
                    category: node.key.split('.')[0] || node.key,
                    categoryTitle: categoryTitle || 'Pages',
                })
            }
        }
        const nextCategory = node.type === 'title' ? node.title : categoryTitle
        node.subMenu?.forEach((child) => visit(child, nextCategory))
    }

    tree.forEach((node) => visit(node, node.title || 'Pages'))
    return items
}

/** Fallback: build search items from protected routes when menu API returns no categories. */
function getFallbackSearchItems(userAuthority: string[]): SearchData[] {
    const keyToLabel: Record<string, string> = {
        home: 'Home',
        profile: 'Profile',
        'admin-dashboard': 'Admin Dashboard',
        users: 'Users',
        roles: 'Roles',
        'coach-dashboard': 'Coach Dashboard',
        'coach-trainees': 'My Trainees',
        'coach-plans': 'Plans',
        'coach-create-plan': 'Create Plan',
        'trainee-dashboard': 'Trainee Dashboard',
        'trainee-coaches': 'Choose Coach',
        'my-plans': 'My Plans',
        progress: 'Progress',
    }

    return protectedRoutes
        .filter((route) => {
            if (!route.path || route.path === '*') return false
            const auth = route.authority ?? []
            return isEmpty(auth) || auth.some((r) => userAuthority.includes(r))
        })
        .map((route) => ({
            key: route.key,
            path: route.path,
            title: keyToLabel[route.key] || route.key.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
            icon: 'dashboard',
            category: route.key,
            categoryTitle: 'Pages',
        }))
}

const ListItem = (props: {
    icon: string
    label: string
    url: string
    isLast?: boolean
    keyWord: string
    onNavigate: () => void
}) => {
    const { icon, label, url = '', keyWord, onNavigate } = props

    return (
        <Link to={url} onClick={onNavigate}>
            <div
                className={classNames(
                    'flex items-center justify-between rounded-xl p-3 cursor-pointer user-select',
                    'hover:bg-gray-100 dark:hover:bg-gray-700',
                )}
            >
                <div className="flex items-center gap-2">
                    <div
                        className={classNames(
                            'rounded-lg border-2 border-gray-200 shadow-xs text-xl group-hover:shadow-sm h-10 w-10 flex items-center justify-center bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100',
                        )}
                    >
                        {icon && navigationIcon[icon]}
                    </div>
                    <div className="text-gray-900 dark:text-gray-300">
                        <Highlighter
                            autoEscape
                            highlightClassName={classNames(
                                'text-primary',
                                'underline bg-transparent font-semibold dark:text-white',
                            )}
                            searchWords={[keyWord]}
                            textToHighlight={label}
                        />
                    </div>
                </div>
                <HiChevronRight className="text-lg" />
            </div>
        </Link>
    )
}

const _Search = ({ className }: { className?: string }) => {
    const [searchDialogOpen, setSearchDialogOpen] = useState(false)
    const [searchResult, setSearchResult] =
        useState<SearchResult[]>(recommendedSearch)
    const [noResult, setNoResult] = useState(false)

    const inputRef = useRef<HTMLInputElement>(null)
    const { navigationTree } = useBackendNavigation()
    const userAuthority = useSessionUser((state) => state.user.authority) ?? []

    const searchableItems = useMemo(() => {
        const fromNav = flattenNavigationForSearch(navigationTree, userAuthority)
        if (fromNav.length > 0) return fromNav
        return getFallbackSearchItems(userAuthority)
    }, [navigationTree, userAuthority])

    const handleReset = () => {
        setNoResult(false)
        setSearchResult(recommendedSearch)
    }

    const handleSearchOpen = () => {
        setSearchDialogOpen(true)
    }

    const handleSearchClose = () => {
        setSearchDialogOpen(false)
        handleReset()
    }

    const debounceFn = debounce((query: string) => {
        if (!query.trim()) {
            setSearchResult(recommendedSearch)
            setNoResult(false)
            return
        }

        setNoResult(false)
        const q = query.trim().toLowerCase()
        const filtered = searchableItems.filter(
            (item) =>
                item.title.toLowerCase().includes(q) ||
                item.path.toLowerCase().includes(q) ||
                item.key.toLowerCase().includes(q),
        )

        if (filtered.length === 0) {
            setNoResult(true)
            setSearchResult([])
            return
        }

        const byCategory = filtered.reduce<Record<string, SearchData[]>>(
            (acc, item) => {
                const cat = item.categoryTitle || 'Pages'
                if (!acc[cat]) acc[cat] = []
                acc[cat].push(item)
                return acc
            },
            {},
        )

        const result: SearchResult[] = Object.entries(byCategory).map(
            ([title, data]) => ({ title, data }),
        )
        setSearchResult(result)
    }, 200)

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        debounceFn(e.target.value)
    }

    useEffect(() => {
        if (searchDialogOpen) {
            const timeout = setTimeout(() => inputRef.current?.focus(), 100)
            return () => {
                clearTimeout(timeout)
            }
        }
    }, [searchDialogOpen])

    const handleNavigate = () => {
        handleSearchClose()
    }

    return (
        <>
            <div
                className={classNames(className, 'text-2xl')}
                onClick={handleSearchOpen}
            >
                <PiMagnifyingGlassDuotone />
            </div>
            <Dialog
                contentClassName="p-0"
                isOpen={searchDialogOpen}
                closable={false}
                onRequestClose={handleSearchClose}
            >
                <div>
                    <div className="px-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-600">
                        <div className="flex items-center">
                            <HiOutlineSearch className="text-xl" />
                            <input
                                ref={inputRef}
                                className="ring-0 outline-hidden block w-full p-4 text-base bg-transparent text-gray-900 dark:text-gray-100"
                                placeholder="Search..."
                                onChange={handleSearch}
                            />
                        </div>
                        <Button size="xs" onClick={handleSearchClose}>
                            Esc
                        </Button>
                    </div>
                    <div className="py-6 px-5">
                        <ScrollBar className=" max-h-[350px] overflow-y-auto">
                            {searchResult.map((result) => (
                                <div key={result.title} className="mb-4">
                                    <h6 className="mb-3">{result.title}</h6>
                                    {result.data.map((data) => (
                                        <ListItem
                                            key={data.key}
                                            icon={data.icon}
                                            label={data.title}
                                            url={data.path}
                                            keyWord={
                                                inputRef.current?.value || ''
                                            }
                                            onNavigate={handleNavigate}
                                        />
                                    ))}
                                </div>
                            ))}
                            {searchResult.length === 0 && noResult && (
                                <div className="my-10 text-center text-lg">
                                    <span>No results for </span>
                                    <span className="heading-text">
                                        {`'`}
                                        {inputRef.current?.value}
                                        {`'`}
                                    </span>
                                </div>
                            )}
                        </ScrollBar>
                    </div>
                </div>
            </Dialog>
        </>
    )
}

const Search = withHeaderItem(_Search)

export default Search
