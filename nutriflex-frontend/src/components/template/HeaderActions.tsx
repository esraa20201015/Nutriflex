import { useCallback } from 'react'
import UserProfileDropdown from '@/components//template/UserProfileDropdown'
import LanguageSelector from '@/components/template/LanguageSelector'
import Switcher from '@/components/ui/Switcher'
import useDarkMode from '@/utils/hooks/useDarkMode'
import { RiMoonClearLine, RiSunLine } from 'react-icons/ri'
import type { ReactNode } from 'react'

const withIcon = (component: ReactNode) => {
    return <div className="text-lg">{component}</div>
}

const HeaderModeSwitcher = () => {
    const [isDark, setIsDark] = useDarkMode()

    const onSwitchChange = useCallback(
        (checked: boolean) => {
            setIsDark(checked ? 'dark' : 'light')
        },
        [setIsDark],
    )

    return (
        <Switcher
            defaultChecked={isDark}
            onChange={onSwitchChange}
            unCheckedContent={withIcon(<RiMoonClearLine />)}
            checkedContent={withIcon(<RiSunLine />)}
            aria-label="Toggle dark mode"
        />
    )
}

const HeaderActions = () => {
    return (
        <div className="flex items-center gap-3">
            <HeaderModeSwitcher />
            <LanguageSelector />
            <UserProfileDropdown hoverable={false} />
        </div>
    )
}

export default HeaderActions
