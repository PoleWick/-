import type { ComponentType } from '@/types'
import type { FC } from 'react'
import type { ISchema } from '@formily/json-schema'

import Banner, { bannerSchema, bannerDefaultProps } from '@/components/mall/Banner'
import ProductList, { productListSchema, productListDefaultProps } from '@/components/mall/ProductList'
import CategoryNav, { categoryNavSchema, categoryNavDefaultProps } from '@/components/mall/CategoryNav'
import CartEntry, { cartEntrySchema, cartEntryDefaultProps } from '@/components/mall/CartEntry'
import OrderConfirm, { orderConfirmSchema, orderConfirmDefaultProps } from '@/components/mall/OrderConfirm'
import NavBar, { navBarSchema, navBarDefaultProps } from '@/components/mall/NavBar'
import TopBar, { topBarSchema, topBarDefaultProps } from '@/components/mall/TopBar'
import SearchBar, { searchBarSchema, searchBarDefaultProps } from '@/components/mall/SearchBar'
import Divider, { dividerSchema, dividerDefaultProps } from '@/components/mall/Divider'
import RichText, { richTextSchema, richTextDefaultProps } from '@/components/mall/RichText'
import ImageBlock, { imageBlockSchema, imageBlockDefaultProps } from '@/components/mall/ImageBlock'
import OrderList, { orderListSchema, orderListDefaultProps } from '@/components/mall/OrderList'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyProps = Record<string, any>

export interface ComponentConfig {
  label: string
  icon: string
  component: FC<AnyProps>
  schema: ISchema
  defaultProps: AnyProps
}

export const COMPONENT_REGISTRY: Record<ComponentType, ComponentConfig> = {
  Banner: {
    label: '横幅/轮播图',
    icon: 'PictureOutlined',
    component: Banner as FC<AnyProps>,
    schema: bannerSchema,
    defaultProps: bannerDefaultProps,
  },
  ProductList: {
    label: '商品列表',
    icon: 'AppstoreOutlined',
    component: ProductList as FC<AnyProps>,
    schema: productListSchema,
    defaultProps: productListDefaultProps,
  },
  CategoryNav: {
    label: '分类导航',
    icon: 'UnorderedListOutlined',
    component: CategoryNav as FC<AnyProps>,
    schema: categoryNavSchema,
    defaultProps: categoryNavDefaultProps,
  },
  CartEntry: {
    label: '购物车入口',
    icon: 'ShoppingCartOutlined',
    component: CartEntry as FC<AnyProps>,
    schema: cartEntrySchema,
    defaultProps: cartEntryDefaultProps,
  },
  OrderConfirm: {
    label: '订单确认',
    icon: 'CheckCircleOutlined',
    component: OrderConfirm as FC<AnyProps>,
    schema: orderConfirmSchema,
    defaultProps: orderConfirmDefaultProps,
  },
  SearchBar: {
    label: '搜索框',
    icon: 'SearchOutlined',
    component: SearchBar as FC<AnyProps>,
    schema: searchBarSchema,
    defaultProps: searchBarDefaultProps,
  },
  Divider: {
    label: '分割线',
    icon: 'MinusOutlined',
    component: Divider as FC<AnyProps>,
    schema: dividerSchema,
    defaultProps: dividerDefaultProps,
  },
  RichText: {
    label: '富文本',
    icon: 'FontSizeOutlined',
    component: RichText as FC<AnyProps>,
    schema: richTextSchema,
    defaultProps: richTextDefaultProps,
  },
  ImageBlock: {
    label: '\u56FE\u7247\u5757',
    icon: 'FileImageOutlined',
    component: ImageBlock as FC<AnyProps>,
    schema: imageBlockSchema,
    defaultProps: imageBlockDefaultProps,
  },
  NavBar: {
    label: '\u5E95\u90E8\u5BFC\u822A\u680F',
    icon: 'MenuOutlined',
    component: NavBar as FC<AnyProps>,
    schema: navBarSchema,
    defaultProps: navBarDefaultProps,
  },
  TopBar: {
    label: '\u9876\u90E8\u8FD4\u56DE\u680F',
    icon: 'ArrowLeftOutlined',
    component: TopBar as FC<AnyProps>,
    schema: topBarSchema,
    defaultProps: topBarDefaultProps,
  },
  OrderList: {
    label: '\u8BA2\u5355\u5217\u8868',
    icon: 'UnorderedListOutlined',
    component: OrderList as FC<AnyProps>,
    schema: orderListSchema,
    defaultProps: orderListDefaultProps,
  },
}

export const COMPONENT_LIST = Object.entries(COMPONENT_REGISTRY).map(([type, config]) => ({
  type: type as ComponentType,
  ...config,
}))
