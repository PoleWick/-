import { useState, useMemo } from 'react'
import { Button, Divider, Result, Radio, Space } from 'antd'
import type { ISchema } from '@formily/json-schema'
import useCartStore from '@/stores/useCartStore'
import { ordersApi, paymentsApi } from '@/apis/orders'
import styles from './OrderConfirm.module.css'

interface OrderConfirmProps {
  title?:        string
  buttonColor?:  string
  buttonText?:   string
  __editorMode?: boolean
}

const MOCK_ITEMS = [
  { key: 'demo__12.9', name: '\u793A\u4F8B\u5546\u54C1 A', price: 12.9, image: '', quantity: 2 },
  { key: 'demo__8.9',  name: '\u793A\u4F8B\u5546\u54C1 B', price:  8.9, image: '', quantity: 1 },
]

type PayMethod = 'alipay' | 'mock'

const OrderConfirm = ({
  title        = '\u786E\u8BA4\u8BA2\u5355',
  buttonColor  = '#ff4d4f',
  buttonText   = '\u53BB\u652F\u4ED8',
  __editorMode = false,
}: OrderConfirmProps) => {
  const { items: cartItems, clear } = useCartStore()
  const [loading,    setLoading]    = useState(false)
  const [payMethod,  setPayMethod]  = useState<PayMethod>('alipay')
  // mock 支付成功后的取餐号状态
  const [mockResult, setMockResult] = useState<{ orderId: number; pickupNumber: string; totalPrice: number } | null>(null)

  const items = __editorMode ? MOCK_ITEMS : cartItems
  const totalPrice = useMemo(
    () => items.reduce((s, i) => s + (Number(i.price) || 0) * (i.quantity || 0), 0),
    [items]
  )
  const pageId = useMemo(() => {
    const m = window.location.pathname.match(/\/preview\/(\d+)/)
    return m ? Number(m[1]) : undefined
  }, [])

  const handleSubmit = async () => {
    if (__editorMode || !items.length) return
    setLoading(true)
    try {
      // 第一步：创建订单
      const order = await ordersApi.create({ items, totalPrice, pageId })

      if (payMethod === 'alipay') {
        // 存当前页 ID，供 PaymentResult 页找回商城页
        if (pageId) sessionStorage.setItem('checkout_page_id', String(pageId))
        // 不在此处清购物车，等支付成功后由 PaymentResult 页统一清空
        await paymentsApi.redirectToAlipay(order.orderId)
        return // 页面即将跳走，不需要 setLoading(false)
      } else {
        // mock 支付：通知服务端标记为已支付，再展示取餐号
        await paymentsApi.mockPay(order.orderId)
        clear()
        setMockResult({
          orderId:      order.orderId,
          pickupNumber: order.pickupNumber,
          totalPrice:   order.totalPrice,
        })
      }
    } catch {
      // 错误由 axios 拦截器统一提示
    } finally {
      setLoading(false)
    }
  }

  /* ===== mock 支付成功页 ===== */
  if (mockResult) {
    return (
      <div className={styles.wrapper}>
        <Result
          status="success"
          title={
            <div className={styles.pickupWrap}>
              <span className={styles.pickupLabel}>{'\u53D6\u9910\u53F7'}</span>
              <span className={styles.pickupNum}>{mockResult.pickupNumber}</span>
            </div>
          }
          subTitle={`\u8BA2\u5355 #${mockResult.orderId} \u00B7 \u5408\u8BA1 \u00A5${mockResult.totalPrice.toFixed(1)}`}
          extra={<Button onClick={() => window.history.back()}>{'\u8FD4\u56DE\u70B9\u9910'}</Button>}
        />
      </div>
    )
  }

  /* ===== 空购物车 ===== */
  if (!__editorMode && items.length === 0) {
    return (
      <div className={styles.wrapper}>
        <Result
          status="warning"
          title={'\u8D2D\u7269\u8F66\u662F\u7A7A\u7684'}
          subTitle={'\u8BF7\u5148\u6DFB\u52A0\u5546\u54C1\u518D\u6765\u7ED3\u7B97'}
          extra={<Button onClick={() => window.history.back()}>{'\u8FD4\u56DE\u70B9\u9910'}</Button>}
        />
      </div>
    )
  }

  /* ===== 订单明细 ===== */
  return (
    <div className={styles.wrapper}>
      {title && <h2 className={styles.title}>{title}</h2>}

      {/* 商品列表 */}
      <div className={styles.itemList}>
        {items.map((item) => (
          <div key={item.key} className={styles.itemRow}>
            <div className={styles.itemImg}>
              {item.image
                ? <img src={item.image} alt={item.name} className={styles.itemImgEl} />
                : <div className={styles.itemImgPlaceholder} />}
            </div>
            <div className={styles.itemInfo}>
              <span className={styles.itemName}>{item.name}</span>
              <span className={styles.itemPrice}>&yen;{(Number(item.price) || 0).toFixed(1)}</span>
            </div>
            <span className={styles.itemQty}>&times;{item.quantity}</span>
            <span className={styles.itemSubtotal}>
              &yen;{((Number(item.price) || 0) * item.quantity).toFixed(1)}
            </span>
          </div>
        ))}
      </div>

      <Divider style={{ margin: '12px 0' }} />

      {/* 合计 */}
      <div className={styles.totalRow}>
        <span className={styles.totalLabel}>{'\u5408\u8BA1'}</span>
        <span className={styles.totalPrice}>&yen;{totalPrice.toFixed(1)}</span>
      </div>

      <Divider style={{ margin: '12px 0' }} />

      {/* 支付方式选择 */}
      <div className={styles.payMethodWrap}>
        <span className={styles.payMethodLabel}>{'\u652F\u4ED8\u65B9\u5F0F'}</span>
        <Radio.Group
          value={payMethod}
          onChange={e => setPayMethod(e.target.value)}
          disabled={__editorMode}
        >
          <Space direction="vertical" size={8}>
            <Radio value="alipay">
              <span className={styles.payOption}>
                <img src="https://img.alicdn.com/imgextra/i3/O1CN01yeXFy81i4QKIXC5jw_!!6000000004363-2-tps-200-200.png"
                  alt="alipay" className={styles.payLogo} />
                {'\u652F\u4ED8\u5B9D'}
              </span>
            </Radio>
            <Radio value="mock">
              <span className={styles.payOption}>
                {'\uD83E\uDDEA \u6A21\u62DF\u652F\u4ED8\uFF08\u6D4B\u8BD5\u7528\uFF09'}
              </span>
            </Radio>
          </Space>
        </Radio.Group>
      </div>

      {/* 提交按钮 */}
      <div className={styles.submitWrap}>
        <Button
          type="primary"
          size="large"
          block
          loading={loading}
          disabled={__editorMode}
          style={{ background: buttonColor, borderColor: buttonColor, height: 48, borderRadius: 24, fontSize: 16, fontWeight: 600 }}
          onClick={handleSubmit}
        >
          {__editorMode
            ? `${buttonText}\uFF08\u7F16\u8F91\u5668\u9884\u89C8\uFF09`
            : payMethod === 'alipay'
              ? `\u652F\u4ED8\u5B9D\u652F\u4ED8 \u00A5${totalPrice.toFixed(1)}`
              : buttonText}
        </Button>
      </div>
    </div>
  )
}

export const orderConfirmSchema: ISchema = {
  type: 'object',
  properties: {
    title: {
      type: 'string',
      title: '\u6807\u9898',
      'x-decorator': 'FormItem',
      'x-component': 'Input',
      'x-component-props': { placeholder: '\u786E\u8BA4\u8BA2\u5355' },
    },
    buttonText: {
      type: 'string',
      title: '\u6309\u9215\u6587\u5B57',
      'x-decorator': 'FormItem',
      'x-component': 'Input',
      'x-component-props': { placeholder: '\u53BB\u652F\u4ED8' },
    },
    buttonColor: {
      type: 'string',
      title: '\u6309\u9215\u989C\u8272',
      'x-decorator': 'FormItem',
      'x-component': 'Input',
      'x-component-props': { placeholder: '#ff4d4f' },
    },
  },
}

export const orderConfirmDefaultProps: OrderConfirmProps = {
  title:       '\u786E\u8BA4\u8BA2\u5355',
  buttonColor: '#ff4d4f',
  buttonText:  '\u53BB\u652F\u4ED8',
}

export default OrderConfirm
