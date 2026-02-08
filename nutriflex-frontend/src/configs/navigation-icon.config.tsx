import {
    PiHouseLineDuotone,
    PiArrowsInDuotone,
    PiBookOpenUserDuotone,
    PiBookBookmarkDuotone,
    PiAcornDuotone,
    PiBagSimpleDuotone,
    PiUsersThreeDuotone,
    PiSquaresFourDuotone,
    PiUserCircleDuotone,
    PiUserDuotone,
    PiIdentificationBadgeDuotone,
    PiChartBarDuotone,
    PiClipboardTextDuotone,
} from 'react-icons/pi'
import type { JSX } from 'react'

export type NavigationIcons = Record<string, JSX.Element>

const navigationIcon: NavigationIcons = {
    home: <PiHouseLineDuotone />,
    users: <PiUsersThreeDuotone />,
    singleMenu: <PiAcornDuotone />,
    collapseMenu: <PiArrowsInDuotone />,
    groupSingleMenu: <PiBookOpenUserDuotone />,
    groupCollapseMenu: <PiBookBookmarkDuotone />,
    groupMenu: <PiBagSimpleDuotone />,
    // Backend-driven menu icons
    dashboard: <PiSquaresFourDuotone />,
    admin: <PiIdentificationBadgeDuotone />,
    coach: <PiUserCircleDuotone />,
    trainee: <PiUserDuotone />,
    roles: <PiIdentificationBadgeDuotone />,
    plan: <PiClipboardTextDuotone />,
    chart: <PiChartBarDuotone />,
    user: <PiUserCircleDuotone />,
}

export default navigationIcon
