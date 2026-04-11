import { Router } from 'express'
import { createPayment, queryPayment, notify, mockPayment } from '../controllers/paymentController.js'

const router = Router()

// 支付宝异步回调不带 cookie，必须放在 auth 之前（公开接口）
router.post('/notify',            notify)

// 创建支付宝支付，返回签名后的跳转 URL
router.post('/alipay/:orderId',   createPayment)
router.get('/query/:orderId',     queryPayment)

// 模拟支付（仅测试环境使用）
router.post('/mock/:orderId',     mockPayment)

export default router
