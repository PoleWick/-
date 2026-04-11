import pool from '../config/db.js'
import { success, error } from '../utils/response.js'

/** 生成 4 位取餐号（0001-9999，循环不重复感知即可） */
const genPickupNumber = () => {
  const n = Math.floor(Math.random() * 9999) + 1
  return String(n).padStart(4, '0')
}

/** POST /api/orders  提交订单 */
export const createOrder = async (req, res, next) => {
  try {
    const { items, totalPrice, pageId } = req.body

    if (!Array.isArray(items) || items.length === 0) {
      return error(res, '购物车不能为空', 400)
    }

    const pickup = genPickupNumber()
    const safeTotal = Number(totalPrice) || 0

    const [result] = await pool.execute(
      `INSERT INTO orders (page_id, items, total_price, pickup_number)
       VALUES (?, ?, ?, ?)`,
      [pageId || null, JSON.stringify(items), safeTotal, pickup]
    )

    success(res, {
      orderId:      result.insertId,
      pickupNumber: pickup,
      totalPrice:   safeTotal,
      items,
    }, '下单成功')
  } catch (err) {
    next(err)
  }
}

/** GET /api/orders?pageId=xxx  查询页面订单列表 */
export const getOrders = async (req, res, next) => {
  try {
    const { pageId } = req.query
    if (!pageId) return error(res, 'pageId 不能为空', 400)

    const [rows] = await pool.execute(
      `SELECT id, pickup_number, total_price, payment_status, created_at, items
       FROM orders WHERE page_id = ? ORDER BY created_at DESC LIMIT 50`,
      [Number(pageId)]
    )
    const orders = rows.map(o => ({
      ...o,
      items: JSON.parse(o.items || '[]'),
    }))
    success(res, orders)
  } catch (err) {
    next(err)
  }
}

/** GET /api/orders/:id  查询订单详情 */
export const getOrder = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM orders WHERE id = ?',
      [req.params.id]
    )
    if (!rows.length) return error(res, '订单不存在', 404)
    const order = rows[0]
    order.items = JSON.parse(order.items || '[]')
    success(res, order)
  } catch (err) {
    next(err)
  }
}
