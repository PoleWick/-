import { AlipaySdk } from 'alipay-sdk'
import pool from '../config/db.js'
import { success, error } from '../utils/response.js'

// ── 初始化支付宝 SDK ──────────────────────────────────────────
const alipaySdk = new AlipaySdk({
  appId:          process.env.ALIPAY_APP_ID,
  privateKey:     process.env.ALIPAY_PRIVATE_KEY,
  alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY,
  gateway:        process.env.ALIPAY_GATEWAY || 'https://openapi-sandbox.dl.alipay.com/gateway.do',
  signType:       'RSA2',
})

// ── GET /api/payments/alipay/:orderId ────────────────────────
// 直接返回支付宝 POST 表单 HTML（浏览器自动提交，跳转到支付宝页面）
export const createPayment = async (req, res, next) => {
  try {
    const orderId = Number(req.params.orderId)
    const [rows] = await pool.execute('SELECT * FROM orders WHERE id = ?', [orderId])
    if (!rows.length) { res.status(404).send('\u8BA2\u5355\u4E0D\u5B58\u5728'); return }

    const order = rows[0]
    if (order.payment_status === 'paid') {
      res.status(400).send('\u8BA2\u5355\u5DF2\u652F\u4ED8\uFF0C\u8BF7\u52FF\u91CD\u590D\u63D0\u4EA4'); return
    }

    // out_trade_no 唯一标识：mall_订单ID_时间戳
    const outTradeNo = `mall_${orderId}_${Date.now()}`
    await pool.execute(
      'UPDATE orders SET alipay_out_trade_no = ? WHERE id = ?',
      [outTradeNo, orderId]
    )

    // GET 方式：pageExec 直接返回完整签名 URL 字符串，前端用 window.location.href 跳转
    const payUrl = await alipaySdk.pageExec('alipay.trade.page.pay', {
      method:    'GET',
      returnUrl: `${process.env.FRONTEND_URL}/payment/result`,
      notifyUrl: process.env.ALIPAY_NOTIFY_URL,
      bizContent: {
        out_trade_no:  outTradeNo,
        product_code:  'FAST_INSTANT_TRADE_PAY',
        total_amount:  Math.max(Number(order.total_price), 0.01).toFixed(2),
        subject:       `\u5546\u57CE\u8BA2\u5355 #${orderId}`,
      },
    })

    success(res, { payUrl: String(payUrl), orderId, outTradeNo })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/payments/query/:orderId ─────────────────────────
// 轮询支付状态（主动调支付宝 trade.query，本地开发用此接口替代 notify）
export const queryPayment = async (req, res, next) => {
  try {
    const orderId = Number(req.params.orderId)
    const [rows] = await pool.execute('SELECT * FROM orders WHERE id = ?', [orderId])
    if (!rows.length) return error(res, '\u8BA2\u5355\u4E0D\u5B58\u5728', 404)

    const order = rows[0]

    // 已知结果直接返回，不重复查
    if (order.payment_status === 'paid') {
      return success(res, {
        paid:         true,
        pickupNumber: order.pickup_number,
        totalPrice:   order.total_price,
        orderId,
      })
    }
    if (order.payment_status === 'failed') {
      return success(res, { paid: false, failed: true, orderId })
    }

    // 没有 out_trade_no 说明还未发起支付
    if (!order.alipay_out_trade_no) {
      return success(res, { paid: false, orderId })
    }

    // 向支付宝查询
    const queryResult = await alipaySdk.exec('alipay.trade.query', {
      bizContent: { out_trade_no: order.alipay_out_trade_no },
    }, {})

    if (queryResult.tradeStatus === 'TRADE_SUCCESS' || queryResult.tradeStatus === 'TRADE_FINISHED') {
      await pool.execute(
        'UPDATE orders SET payment_status = ?, alipay_trade_no = ? WHERE id = ?',
        ['paid', queryResult.tradeNo || null, orderId]
      )
      return success(res, {
        paid:         true,
        pickupNumber: order.pickup_number,
        totalPrice:   order.total_price,
        orderId,
      })
    }

    // 支付中/未支付
    success(res, { paid: false, tradeStatus: queryResult.tradeStatus, orderId })
  } catch (err) {
    // 支付宝返回 TRADE_NOT_EXIST 等错误属于业务状态，不是服务器故障
    if (err?.serverResult?.code === '40004') {
      return success(res, { paid: false, orderId })
    }
    next(err)
  }
}

// ── POST /api/payments/mock/:orderId ─────────────────────────
// 模拟支付：直接将订单标记为已支付（仅测试用）
export const mockPayment = async (req, res, next) => {
  try {
    const orderId = Number(req.params.orderId)
    const [rows] = await pool.execute('SELECT * FROM orders WHERE id = ?', [orderId])
    if (!rows.length) return error(res, '\u8BA2\u5355\u4E0D\u5B58\u5728', 404)

    const order = rows[0]
    if (order.payment_status === 'paid') {
      return success(res, {
        paid:         true,
        pickupNumber: order.pickup_number,
        totalPrice:   order.total_price,
        orderId,
      })
    }

    await pool.execute(
      "UPDATE orders SET payment_status = 'paid' WHERE id = ?",
      [orderId]
    )
    success(res, {
      paid:         true,
      pickupNumber: order.pickup_number,
      totalPrice:   order.total_price,
      orderId,
    })
  } catch (err) {
    next(err)
  }
}

// ── POST /api/payments/notify ─────────────────────────────────
// 支付宝异步回调（本地无法接收，但部署到公网后自动生效）
export const notify = async (req, res, next) => {
  try {
    const params = req.body

    // 验签
    const valid = alipaySdk.checkNotifySign(params)
    if (!valid) { res.send('fail'); return }

    const { out_trade_no, trade_no, trade_status } = params

    if (trade_status === 'TRADE_SUCCESS' || trade_status === 'TRADE_FINISHED') {
      await pool.execute(
        `UPDATE orders SET payment_status = 'paid', alipay_trade_no = ?
         WHERE alipay_out_trade_no = ? AND payment_status = 'pending'`,
        [trade_no, out_trade_no]
      )
    }

    res.send('success') // 支付宝要求原文返回 "success"
  } catch (err) {
    next(err)
  }
}
