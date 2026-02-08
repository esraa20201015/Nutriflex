export type MenuItem = {
    id: string
    label: string
    labelAr: string
    path: string
    icon: string
    roles: string[]
}

export type MenuCategory = {
    id: string
    label: string
    labelAr: string
    icon: string
    roles: string[]
    items: MenuItem[]
}

export type MenuResponse = {
    status: number
    messageEn: string
    messageAr: string
    data: {
        categories: MenuCategory[]
        userRole: string
    }
}

