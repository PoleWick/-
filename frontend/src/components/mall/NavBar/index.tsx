import { useMemo } from 'react'
import {
  HomeOutlined, ShopOutlined, UnorderedListOutlined,
  UserOutlined, HeartOutlined, StarOutlined,
  GiftOutlined, TagOutlined, PhoneOutlined, InfoCircleOutlined,
} from '@ant-design/icons'
import type { ISchema } from '@formily/json-schema'
import styles from './NavBar.module.css'

export interface NavItem {
  icon:    string   // 图标名称，如 "HomeOutlined"
  label:   string
  pageId?: number
}

/** 支持的图标名称 → 组件映射 */
export const ICON_MAP: Record<string, React.ReactNode> = {
  HomeOutlined:          <HomeOutlined />,
  ShopOutlined:          <ShopOutlined />,
  UnorderedListOutlined: <UnorderedListOutlined />,
  UserOutlined:          <UserOutlined />,
  HeartOutlined:         <HeartOutlined />,
  StarOutlined:          <StarOutlined />,
  GiftOutlined:          <GiftOutlined />,
  TagOutlined:           <TagOutlined />,
  PhoneOutlined:         <PhoneOutlined />,
  InfoCircleOutlined:    <InfoCircleOutlined />,
}

export const NAV_ICON_OPTIONS = [
  { label: '首页',  value: 'HomeOutlined' },
  { label: '商店',  value: 'ShopOutlined' },
  { label: '订单',  value: 'UnorderedListOutlined' },
  { label: '我的',  value: 'UserOutlined' },
  { label: '收藏',  value: 'HeartOutlined' },
  { label: '推荐',  value: 'StarOutlined' },
  { label: '活动',  value: 'GiftOutlined' },
  { label: '分类',  value: 'TagOutlined' },
  { label: '联系',  value: 'PhoneOutlined' },
  { label: '关于',  value: 'InfoCircleOutlined' },
]

const DEFAULT_ICON_NAME = 'HomeOutlined'

export const isImageUrl = (s: string) => /^(https?:|data:image)/.test(s)

interface NavBarProps {
  items?:       NavItem[]
  activeColor?: string
  /** 编辑器画布注入，禁用 sticky 定位 */
  __editorMode?: boolean
}

const DEFAULT_ITEMS: NavItem[] = [
  { icon: 'HomeOutlined',          label: '首页' },
  { icon: 'ShopOutlined',          label: '点餐' },
  { icon: 'UnorderedListOutlined', label: '订单' },
  { icon: 'UserOutlined',          label: '我的' },
]

const NavBar = ({
  items        = DEFAULT_ITEMS,
  activeColor  = '#ff4d4f',
  __editorMode = false,
}: NavBarProps) => {
  const safeItems = Array.isArray(items) && items.length > 0 ? items : DEFAULT_ITEMS

  // 从当前 URL 解析出活跃页面 ID（/preview/:id）
  const activePageId = useMemo(() => {
    const match = window.location.pathname.match(/\/preview\/(\d+)/)
    return match ? Number(match[1]) : null
  }, [])

  const handleClick = (item: NavItem) => {
    if (!item.pageId) return
    window.location.href = `/preview/${item.pageId}`
  }

  const navBar = (
    <nav
      className={styles.bar}
      style={__editorMode ? { position: 'relative', zIndex: 1 } : { position: 'fixed', bottom: 0, left: 0, right: 0 }}
    >
      {safeItems.map((item, i) => {
        const isActive = item.pageId != null && item.pageId === activePageId
        return (
          <button
            key={i}
            className={styles.tab}
            style={{ color: isActive ? activeColor : undefined }}
            onClick={() => handleClick(item)}
          >
            <span className={styles.icon}>
              {item.icon && isImageUrl(item.icon)
                ? <img src={item.icon} alt={item.label} className={styles.iconImg} />
                : ICON_MAP[item.icon] ?? ICON_MAP[DEFAULT_ICON_NAME]!}
            </span>
            <span
              className={styles.label}
              style={isActive ? { color: activeColor } : undefined}
            >
              {item.label || `Tab ${i + 1}`}
            </span>
            {isActive && (
              <span className={styles.dot} style={{ background: activeColor }} />
            )}
          </button>
        )
      })}
    </nav>
  )

  if (__editorMode) return navBar

  return (
    <>
      {/* 占位，防止页面内容被固定导航栏遮住（56 + 安全区） */}
      <div style={{ height: 'calc(56px + env(safe-area-inset-bottom, 0px))' }} aria-hidden />
      {navBar}
    </>
  )
}

export const navBarSchema: ISchema = {
  type: 'object',
  properties: {
    activeColor: {
      type: 'string',
      title: '\u6FC0\u6D3B\u989C\u8272',
      'x-decorator': 'FormItem',
      'x-component': 'Input',
      'x-component-props': { placeholder: '#ff4d4f' },
    },
    items: {
      type: 'array',
      title: 'Tab \u5217\u8868',
      'x-decorator': 'FormItem',
      'x-component': 'ArrayItems',
      items: {
        type: 'object',
        'x-component': 'ArrayItems.Item',
        'x-component-props': {
          style: { flexDirection: 'column', alignItems: 'stretch', gap: 0 },
        },
        properties: {
          icon: {
            type: 'string',
            title: '图标',
            'x-decorator': 'FormItem',
            'x-component': 'NavIconPicker',
          },
          label: {
            type: 'string',
            title: '\u6807\u7B7E',
            'x-decorator': 'FormItem',
            'x-component': 'Input',
            'x-component-props': { placeholder: '\u9996\u9875' },
          },
          pageId: {
            type: 'number',
            title: '\u8DF3\u8F6C\u9875\u9762 ID',
            'x-decorator': 'FormItem',
            'x-component': 'NumberPicker',
            'x-component-props': { min: 1, precision: 0, placeholder: '\u9875\u9762 ID' },
          },
          remove: {
            type: 'void',
            'x-component': 'ArrayItems.Remove',
          },
        },
      },
      properties: {
        add: {
          type: 'void',
          title: '\u6DFB\u52A0 Tab',
          'x-component': 'ArrayItems.Addition',
        },
      },
    },
  },
}

export const navBarDefaultProps: NavBarProps = {
  items: DEFAULT_ITEMS,
  activeColor: '#ff4d4f',
}

export default NavBar
