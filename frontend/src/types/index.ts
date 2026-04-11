// ===== 用户相关 =====
export interface User {
  id: number
  username: string
  email: string
  avatar?: string
  created_at: string
}

// ===== 商城组件相关 =====
export type ComponentType =
  | 'Banner'
  | 'ProductList'
  | 'CategoryNav'
  | 'CartEntry'
  | 'OrderConfirm'
  | 'SearchBar'
  | 'Divider'
  | 'RichText'
  | 'ImageBlock'
  | 'NavBar'
  | 'TopBar'
  | 'OrderList'

export interface MallComponent {
  id: string
  type: ComponentType
  order: number
  props: Record<string, unknown>
}

export interface PageSettings {
  backgroundColor: string
  title: string
  maxWidth: number
}

export interface PageConfig {
  pageSettings: PageSettings
  components: MallComponent[]
}

// ===== 页面相关 =====
export type PageType = 'mall' | 'checkout' | 'orders' | 'custom'

export interface Page {
  id: number
  project_id: number
  user_id: number
  title: string
  cover?: string
  config: PageConfig
  page_type: PageType
  is_default: boolean
  status: 1 | 2
  created_at: string
  updated_at: string
  /** getDetail 时附带项目 NavBar 上下文（Preview 使用） */
  project?: ProjectContext
}

export interface PageListItem {
  id: number
  project_id: number
  title: string
  cover?: string
  page_type: PageType
  is_default: boolean
  status: 1 | 2
  created_at: string
  updated_at: string
}

// ===== 项目相关 =====
export interface NavBarItem {
  icon:         string
  label:        string
  /** 内置页面类型引用，preview 动态解析为实际 pageId */
  pageType?:    'mall' | 'orders' | 'custom'
  /** custom 类型时手动指定 pageId */
  customPageId?: number
}

export interface NavBarConfig {
  activeColor: string
  items:       NavBarItem[]
}

export interface Project {
  id:            number
  user_id:       number
  name:          string
  description?:  string
  navbar_config?: NavBarConfig
  page_count?:   number
  created_at:    string
  updated_at:    string
  pages?:        PageListItem[]
}

/** Page.project 字段：仅包含 NavBar 上下文，不含敏感数据 */
export interface ProjectContext {
  id:             number
  name:           string
  navbar_config?: NavBarConfig
  pages:          PageListItem[]
}

// ===== API 响应 =====
export interface ApiResponse<T = null> {
  code: number
  message: string
  data: T
}

export interface PaginatedData<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// ===== 编辑器相关 =====
export interface DragItem {
  type: 'NEW_COMPONENT' | 'CANVAS_COMPONENT'
  componentType?: ComponentType
  id?: string
  index?: number
}
