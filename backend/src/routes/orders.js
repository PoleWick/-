import { Router } from 'express'
import { createOrder, getOrder, getOrders } from '../controllers/orderController.js'

const router = Router()

router.post('/',    createOrder)
router.get('/',     getOrders)
router.get('/:id',  getOrder)

export default router
