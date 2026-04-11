import request from '@/utils/request'
import type { CartItem } from '@/stores/useCartStore'

export interface CreateOrderParams {
  items:      CartItem[]
  totalPrice: number
  pageId?:    number
}

export interface OrderResult {
  orderId:      number
  pickupNumber: string
  totalPrice:   number
  items:        CartItem[]
}

export interface PaymentQueryResult {
  paid:         boolean
  failed?:      boolean
  pickupNumber?: string
  totalPrice?:  number
  orderId:      number
  tradeStatus?: string
}

export interface OrderListItem {
  id:             number
  pickup_number:  string
  total_price:    number
  payment_status: 'pending' | 'paid' | 'failed'
  created_at:     string
  items:          CartItem[]
}

export const ordersApi = {
  create: (params: CreateOrderParams) =>
    request.post<never, OrderResult>('/orders', params),

  getById: (id: number) =>
    request.get<never, OrderResult>(`/orders/${id}`),

  getByPage: (pageId: number) =>
    request.get<never, OrderListItem[]>('/orders', { params: { pageId } }),
}

export const paymentsApi = {
  /**
   * 向后端（axios）取签名后的支付宝 URL，
   * 再用 window.location.href 直接跳转，完全绕过 Vite SPA fallback。
   */
  redirectToAlipay: async (orderId: number) => {
    const { payUrl } = await request.post<never, { payUrl: string; orderId: number; outTradeNo: string }>(
      `/payments/alipay/${orderId}`, {}
    )
    sessionStorage.setItem('pending_order_id', String(orderId))
    window.location.href = payUrl   // 直接跳到支付宝，不经过 Vite
  },

  /** 轮询支付状态（主动查询，无需 notify_url） */
  query: (orderId: number) =>
    request.get<never, PaymentQueryResult>(`/payments/query/${orderId}`),

  /** 模拟支付（测试用）：服务端直接将订单标记为已支付 */
  mockPay: (orderId: number) =>
    request.post<never, PaymentQueryResult>(`/payments/mock/${orderId}`, {}),
}
