import ApiService from './ApiService'
import endpointConfig from '@/configs/endpoint.config'
import type { MenuResponse } from '@/@types/menu'

export async function apiGetMenu() {
    return ApiService.fetchDataWithAxios<MenuResponse>({
        url: endpointConfig.menu,
        method: 'get',
    })
}

