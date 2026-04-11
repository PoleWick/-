import { useEffect, useState, useMemo } from 'react'
import { Spin, Empty, Tag } from 'antd'
import type { ISchema } from '@formily/json-schema'
import { ordersApi, type OrderListItem } from '@/apis/orders'
import styles from './OrderList.module.css'

interface OrderListProps {
  title?:           string
  emptyText?:       string
  __editorMode?:    boolean
}

const MOCK_ORDERS: OrderListItem[] = [
  {
    id: 1001, pickup_number: '0042', total_price: 34.8, payment_status: 'paid',
    created_at: new Date().toISOString(),
    items: [{ key: 'a', name: '示例商品 A', price: 12.9, image: '', quantity: 2 }, { key: 'b', name: '示例商品 B', price: 8.9, image: '', quantity: 1 }],
  },
  {
    id: 1002, pickup_number: '0038', total_price: 12.9, payment_status: 'pending',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    items: [{ key: 'a', name: '示例商品 A', price: 12.9, image: '', quantity: 1 }],
  },
]

const STATUS_MAP = {
  paid:    { label: '已支付', color: 'success' },
  pending: { label: '待支付', color: 'warning' },
  failed:  { label: '已取消', color: 'default' },
} as const

const OrderList = ({
  title       = '我的订单',
  emptyText   = '暂无订单记录',
  __editorMode = false,
}: OrderListProps) => {
  const [orders,  setOrders]  = useState<OrderListItem[]>([])
  const [loading, setLoading] = useState(false)

  const pageId = useMemo(() => {
    const m = window.location.pathname.match(/\/preview\/(\d+)/)
    return m ? Number(m[1]) : undefined
  }, [])

  useEffect(() => {
    if (__editorMode) { setOrders(MOCK_ORDERS); return }
    if (!pageId) return
    setLoading(true)
    ordersApi.getByPage(pageId)
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [pageId, __editorMode])

  return (
    <div className={styles.wrapper}>
      {title && <h2 className={styles.title}>{title}</h2>}

      {loading && (
        <div className={styles.center}>
          <Spin />
        </div>
      )}

      {!loading && orders.length === 0 && (
        <Empty description={emptyText} className={styles.empty} />
      )}

      {!loading && orders.map(order => (
        <div key={order.id} className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.orderId}>{'订单 #'}{order.id}</span>
            <Tag color={STATUS_MAP[order.payment_status]?.color ?? 'default'}>
              {STATUS_MAP[order.payment_status]?.label ?? order.payment_status}
            </Tag>
          </div>

          <div className={styles.itemList}>
            {order.items.map((item, i) => (
              <span key={i} className={styles.itemChip}>
                {item.name} ×{item.quantity}
              </span>
            ))}
          </div>

          <div className={styles.cardFooter}>
            <span className={styles.totalPrice}>{'合计 ¥'}{Number(order.total_price).toFixed(2)}</span>
            {order.payment_status === 'paid' && (
              <span className={styles.pickup}>
                {'取餐号 '}
                <strong>{order.pickup_number}</strong>
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export const orderListSchema: ISchema = {
  type: 'object',
  properties: {
    title: {
      type: 'string',
      title: '标题',
      'x-decorator': 'FormItem',
      'x-component': 'Input',
      'x-component-props': { placeholder: '我的订单' },
    },
    emptyText: {
      type: 'string',
      title: '空状态文案',
      'x-decorator': 'FormItem',
      'x-component': 'Input',
      'x-component-props': { placeholder: '暂无订单记录' },
    },
  },
}

export const orderListDefaultProps: OrderListProps = {
  title:     '我的订单',
  emptyText: '暂无订单记录',
}

export default OrderList
