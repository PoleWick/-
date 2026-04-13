import { Router } from 'express'
import * as pageController from '../controllers/pageController.js'
import auth from '../middlewares/auth.js'

const router = Router()

// 公开接口：预览页无需登录
router.get('/:id', pageController.getDetail)

// 以下需要登录
router.use(auth)
router.get('/',               pageController.getList)
router.put('/:id',            pageController.update)
router.delete('/:id',         pageController.remove)
router.post('/:id/duplicate',  pageController.duplicate)
router.get('/:id/export',      pageController.exportPage)
router.patch('/:id/publish',   pageController.publishPage)

export default router
