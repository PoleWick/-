import request from '@/utils/request'
import type { Page, PageConfig } from '@/types'

export interface UpdatePageParams {
  title?:  string
  config?: PageConfig
  cover?:  string
  status?: 1 | 2
}

export const pagesApi = {
  getDetail: (id: number) =>
    request.get<never, Page>(`/pages/${id}`),

  update: (id: number, params: UpdatePageParams) =>
    request.put<never, Page>(`/pages/${id}`, params),

  remove: (id: number) =>
    request.delete<never, null>(`/pages/${id}`),

  duplicate: (id: number) =>
    request.post<never, Page>(`/pages/${id}/duplicate`),

  export: (id: number) =>
    request.get<never, PageConfig>(`/pages/${id}/export`),

  publish: (id: number) =>
    request.patch<never, Page>(`/pages/${id}/publish`),
}
