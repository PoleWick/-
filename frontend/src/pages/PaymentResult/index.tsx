import { useEffect, useRef, useState, useCallback } from 'react'
import { Result, Button, Spin, Typography } from 'antd'
import { CheckCircleFilled, CloseCircleFilled, LoadingOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { paymentsApi } from '@/apis/orders'
import { pagesApi } from '@/apis/pages'
import useCartStore from '@/stores/useCartStore'
import styles from './PaymentResult.module.css'

const { Text } = Typography

type Status = 'polling' | 'success' | 'failed' | 'timeout'

const MAX_POLLS  = 30   // 最多轮询 30 次（约 60 秒）
const POLL_DELAY = 2000 // 每 2 秒查一次

const PaymentResult = () => {
  const navigate = useNavigate()
  const [status,       setStatus]       = useState<Status>('polling')
  const [pickupNumber, setPickupNumber] = useState('')
  const [totalPrice,   setTotalPrice]   = useState(0)
  const [orderId,      setOrderId]      = useState<number | null>(null)
  const [mallUrl,      setMallUrl]      = useState('/dashboard')
  const pollCount = useRef(0)
  const timer     = useRef<ReturnType<typeof setTimeout> | null>(null)
  const clearCart = useCartStore(s => s.clear)

  // 根据 sessionStorage 里的 checkout_page_id 找到商城页 URL
  const resolveMallUrl = useCallback(async () => {
    const checkoutPageId = Number(sessionStorage.getItem('checkout_page_id') || '0')
    if (!checkoutPageId) return
    try {
      const page = await pagesApi.getDetail(checkoutPageId)
      const mallPage = page.project?.pages?.find((p: { page_type: string }) => p.page_type === 'mall')
      if (mallPage) setMallUrl(`/preview/${mallPage.id}`)
    } catch { /* 静默失败，兜底到 /dashboard */ }
  }, [])

  useEffect(() => {
    // 优先从 URL query 参数取 out_trade_no（支付宝同步回跳时携带）
    const params       = new URLSearchParams(window.location.search)
    const outTradeNo   = params.get('out_trade_no') ?? ''
    // out_trade_no 格式：mall_{orderId}_{timestamp}
    const match        = outTradeNo.match(/^mall_(\d+)_/)
    const idFromUrl    = match ? Number(match[1]) : null
    // 兜底：从 sessionStorage 取（直接跳转时存入）
    const idFromStore  = Number(sessionStorage.getItem('pending_order_id') || '0') || null
    const oid          = idFromUrl ?? idFromStore

    if (!oid) { setStatus('failed'); return }
    setOrderId(oid)
    resolveMallUrl()
    poll(oid)

    return () => { if (timer.current) clearTimeout(timer.current) }
  }, [resolveMallUrl]) // eslint-disable-line react-hooks/exhaustive-deps

  const poll = (oid: number) => {
    pollCount.current += 1
    if (pollCount.current > MAX_POLLS) { setStatus('timeout'); return }

    paymentsApi.query(oid)
      .then((data) => {
        if (data.paid) {
          sessionStorage.removeItem('pending_order_id')
          clearCart()
          setPickupNumber(data.pickupNumber ?? '')
          setTotalPrice(Number(data.totalPrice) || 0)
          setStatus('success')
        } else if (data.failed) {
          setStatus('failed')
        } else {
          // 继续轮询
          timer.current = setTimeout(() => poll(oid), POLL_DELAY)
        }
      })
      .catch(() => {
        timer.current = setTimeout(() => poll(oid), POLL_DELAY)
      })
  }

  /* ===== 轮询中 ===== */
  if (status === 'polling') return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: '#1677ff' }} />} />
        <div className={styles.pollingTitle}>{'\u6B63\u5728\u786E\u8BA4\u652F\u4ED8\u72B6\u6001\u2026'}</div>
        <Text type="secondary" className={styles.pollingTip}>
          {'\u8BF7\u4E0D\u8981\u5173\u95ED\u6B64\u9875\u9762\uFF0C\u652F\u4ED8\u5B8C\u6210\u540E\u5C06\u81EA\u52A8\u8DF3\u8F6C'}
        </Text>
        {orderId && (
          <Button
            type="link"
            size="small"
            style={{ marginTop: 8 }}
            onClick={() => { pollCount.current = 0; poll(orderId) }}
          >
            {'\u624B\u52A8\u523B\u65B0'}
          </Button>
        )}
      </div>
    </div>
  )

  /* ===== 支付成功 ===== */
  if (status === 'success') return (
    <div className={styles.page}>
      <div className={styles.card}>
        <CheckCircleFilled className={styles.successIcon} />
        <div className={styles.successTitle}>{'\u652F\u4ED8\u6210\u529F'}</div>
        <div className={styles.pickupWrap}>
          <span className={styles.pickupLabel}>{'\u53D6\u9910\u53F7'}</span>
          <span className={styles.pickupNum}>{pickupNumber}</span>
        </div>
        <Text type="secondary">
          {`\u8BA2\u5355 #${orderId} \u00B7 \u5408\u8BA1 \u00A5${Number(totalPrice).toFixed(2)}`}
        </Text>
        <div className={styles.actions}>
          <Button type="primary" onClick={() => navigate(mallUrl)}>
            {'\u8FD4\u56DE\u70B9\u9910'}
          </Button>
        </div>
      </div>
    </div>
  )

  /* ===== 超时 ===== */
  if (status === 'timeout') return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Result
          status="warning"
          title={'\u786E\u8BA4\u8D85\u65F6'}
          subTitle={'\u672A\u6536\u5230\u652F\u4ED8\u786E\u8BA4\uFF0C\u5982\u5DF2\u652F\u4ED8\u8BF7\u7A0D\u5019\u518D\u67E5'}
          extra={[
            <Button key="retry" type="primary" onClick={() => { if (orderId) { pollCount.current = 0; poll(orderId) } }}>
              {'\u91CD\u65B0\u67E5\u8BE2'}
            </Button>,
            <Button key="back" onClick={() => navigate(mallUrl)}>
              {'\u8FD4\u56DE\u70B9\u9910'}
            </Button>,
          ]}
        />
      </div>
    </div>
  )

  /* ===== 失败 ===== */
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <CloseCircleFilled className={styles.failIcon} />
        <div className={styles.failTitle}>{'\u652F\u4ED8\u5931\u8D25'}</div>
        <Text type="secondary">{'\u8BA2\u5355\u5DF2\u53D6\u6D88\uFF0C\u8BF7\u91CD\u65B0\u4E0B\u5355'}</Text>
        <div className={styles.actions}>
          <Button onClick={() => navigate(mallUrl)}>{'\u8FD4\u56DE\u70B9\u9910'}</Button>
        </div>
      </div>
    </div>
  )
}

export default PaymentResult
