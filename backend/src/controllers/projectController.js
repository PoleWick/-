import * as projectModel from '../models/projectModel.js'
import * as pageModel    from '../models/pageModel.js'
import { success, error } from '../utils/response.js'

/** 公共 NavBar 预置项（pageId 在创建后回填） */
const makeNavBar = (mallId, ordersId) => ({
  id: 'tpl-navbar',
  type: 'NavBar',
  order: 999,
  props: {
    activeColor: '#ff4d4f',
    items: [
      { icon: '\uD83C\uDFEA', label: '\u70B9\u9910',  pageId: mallId },
      { icon: '\uD83D\uDCCB', label: '\u8BA2\u5355',  pageId: ordersId },
    ],
  },
})

/** 页面基础配置 */
const baseConfig = (title) => ({
  pageSettings: { backgroundColor: '#f5f5f5', title, maxWidth: 375 },
  components: [],
})


// GET /api/projects
export const getList = async (req, res, next) => {
  try {
    const list = await projectModel.findByUserId(req.user.id)
    success(res, list)
  } catch (err) { next(err) }
}

// GET /api/projects/:id  （含页面列表）
export const getDetail = async (req, res, next) => {
  try {
    const project = await projectModel.findById(Number(req.params.id), req.user.id)
    if (!project) return error(res, '\u9879\u76EE\u4E0D\u5B58\u5728', 404)
    const pages = await pageModel.findByProjectId(project.id, req.user.id)
    success(res, { ...project, pages })
  } catch (err) { next(err) }
}

// POST /api/projects  创建项目，自动生成三个默认页面并预置组件
export const create = async (req, res, next) => {
  try {
    const { name = '\u6211\u7684\u5546\u57CE', description } = req.body
    const userId    = req.user.id
    const projectId = await projectModel.create({ userId, name, description })

    // 第一步：创建三个空页面，拿到真实 pageId
    const mallId = await pageModel.create({
      userId, projectId, title: '\u5546\u54C1\u9875',
      config: baseConfig('\u5546\u54C1\u9875'), pageType: 'mall', isDefault: 1,
    })
    const checkoutId = await pageModel.create({
      userId, projectId, title: '\u652F\u4ED8\u9875',
      config: baseConfig('\u652F\u4ED8\u9875'), pageType: 'checkout', isDefault: 1,
    })
    const ordersId = await pageModel.create({
      userId, projectId, title: '\u8BA2\u5355\u9875',
      config: baseConfig('\u8BA2\u5355\u9875'), pageType: 'orders', isDefault: 1,
    })

    // 第二步：用真实 pageId 构建完整组件配置
    const navbar = makeNavBar(mallId, ordersId)

    const mallConfig = {
      pageSettings: { backgroundColor: '#f5f5f5', title: '\u5546\u54C1\u9875', maxWidth: 375 },
      components: [
        { id: 'tpl-searchbar',   type: 'SearchBar',   order: 0,
          props: { placeholder: '\u641C\u7D22\u5546\u54C1', backgroundColor: '#f5f5f5', borderRadius: 20, showSearchIcon: true } },
        { id: 'tpl-banner',      type: 'Banner',      order: 1,
          props: { images: [], height: 200, autoplay: true, borderRadius: 0 } },
        { id: 'tpl-productlist', type: 'ProductList', order: 2,
          props: { title: '\u70ED\u9500\u5546\u54C1', columns: 2, products: [
            { name: '\u793A\u4F8B\u5546\u54C1 A', price: 12.9, originalPrice: 15.0, image: '', badge: '\u65B0\u54C1' },
            { name: '\u793A\u4F8B\u5546\u54C1 B', price: 8.9,  originalPrice: 10.0, image: '', badge: '\u70ED\u9500' },
            { name: '\u793A\u4F8B\u5546\u54C1 C', price: 19.9, image: '' },
          ]} },
        { id: 'tpl-cartentry',   type: 'CartEntry',   order: 3,
          props: { checkoutUrl: `/preview/${checkoutId}`, buttonColor: '#ff4d4f' } },
        navbar,
      ],
    }

    const checkoutConfig = {
      pageSettings: { backgroundColor: '#f5f5f5', title: '\u652F\u4ED8\u9875', maxWidth: 375 },
      components: [
        { id: 'tpl-topbar',      type: 'TopBar',      order: 0,
          props: { title: '\u786E\u8BA4\u8BA2\u5355', backUrl: `/preview/${mallId}`,
            backgroundColor: '#ffffff', textColor: '#333333' } },
        { id: 'tpl-orderconfirm', type: 'OrderConfirm', order: 1,
          props: { title: '\u786E\u8BA4\u8BA2\u5355', buttonColor: '#ff4d4f', buttonText: '\u63D0\u4EA4\u8BA2\u5355' } },
      ],
    }

    const ordersConfig = {
      pageSettings: { backgroundColor: '#f5f5f5', title: '\u8BA2\u5355\u9875', maxWidth: 375 },
      components: [
        { id: 'tpl-orders-list', type: 'OrderList', order: 0,
          props: { title: '\u6211\u7684\u8BA2\u5355', emptyText: '\u6682\u65E0\u8BA2\u5355\u8BB0\u5F55' } },
        navbar,
      ],
    }

    // 第三步：回写完整配置
    await pageModel.update(mallId,     userId, { config: mallConfig })
    await pageModel.update(checkoutId, userId, { config: checkoutConfig })
    await pageModel.update(ordersId,   userId, { config: ordersConfig })

    const project = await projectModel.findById(projectId, userId)
    const pages   = await pageModel.findByProjectId(projectId, userId)
    success(res, { ...project, pages }, '\u9879\u76EE\u521B\u5EFA\u6210\u529F')
  } catch (err) { next(err) }
}

// PUT /api/projects/:id
export const update = async (req, res, next) => {
  try {
    const { name, description, navbarConfig } = req.body
    const id = Number(req.params.id)
    const exists = await projectModel.findById(id, req.user.id)
    if (!exists) return error(res, '\u9879\u76EE\u4E0D\u5B58\u5728\u6216\u65E0\u6743\u9650', 404)
    await projectModel.update(id, req.user.id, { name, description, navbarConfig })
    const project = await projectModel.findById(id, req.user.id)
    const pages   = await pageModel.findByProjectId(id, req.user.id)
    success(res, { ...project, pages })
  } catch (err) { next(err) }
}

// DELETE /api/projects/:id
export const remove = async (req, res, next) => {
  try {
    const affected = await projectModel.remove(Number(req.params.id), req.user.id)
    if (!affected) return error(res, '\u9879\u76EE\u4E0D\u5B58\u5728\u6216\u65E0\u6743\u9650', 404)
    success(res, null, '\u5220\u9664\u6210\u529F')
  } catch (err) { next(err) }
}

// POST /api/projects/:id/pages  在项目内新建自定义页面（自动预置 NavBar）
export const createPage = async (req, res, next) => {
  try {
    const projectId = Number(req.params.id)
    const userId    = req.user.id
    const project   = await projectModel.findById(projectId, userId)
    if (!project) return error(res, '\u9879\u76EE\u4E0D\u5B58\u5728\u6216\u65E0\u6743\u9650', 404)

    // 找到本项目的 mall / orders 页，以便预置 NavBar
    const siblings  = await pageModel.findByProjectId(projectId, userId)
    const mallId    = siblings.find(p => p.page_type === 'mall')?.id    ?? null
    const ordersId  = siblings.find(p => p.page_type === 'orders')?.id  ?? null

    const { title = '\u672A\u547D\u540D\u9875\u9762' } = req.body
    const config = {
      pageSettings: { backgroundColor: '#f5f5f5', title, maxWidth: 375 },
      components: mallId && ordersId ? [makeNavBar(mallId, ordersId)] : [],
    }

    const pageId = await pageModel.create({
      userId, projectId, title, config, pageType: 'custom', isDefault: 0,
    })
    const page = await pageModel.findById(pageId)
    success(res, page, '\u9875\u9762\u521B\u5EFA\u6210\u529F')
  } catch (err) { next(err) }
}
