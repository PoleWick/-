import * as pageService from '../services/pageService.js'
import { success } from '../utils/response.js'

// GET /api/pages?projectId=xxx
export const getList = async (req, res, next) => {
  try {
    const projectId = Number(req.query.projectId)
    const data = await pageService.getList(projectId, req.user.id)
    success(res, data)
  } catch (err) { next(err) }
}

// GET /api/pages/:id  （含项目 NavBar 上下文）
export const getDetail = async (req, res, next) => {
  try {
    const data = await pageService.getDetail(Number(req.params.id), req.user?.id)
    success(res, data)
  } catch (err) { next(err) }
}

// PUT /api/pages/:id
export const update = async (req, res, next) => {
  try {
    const data = await pageService.update(Number(req.params.id), req.user.id, req.body)
    success(res, data, '\u4FDD\u5B58\u6210\u529F')
  } catch (err) { next(err) }
}

// DELETE /api/pages/:id
export const remove = async (req, res, next) => {
  try {
    await pageService.remove(Number(req.params.id), req.user.id)
    success(res, null, '\u5220\u9664\u6210\u529F')
  } catch (err) { next(err) }
}

// POST /api/pages/:id/duplicate
export const duplicate = async (req, res, next) => {
  try {
    const data = await pageService.duplicate(Number(req.params.id), req.user.id)
    success(res, data, '\u590D\u5236\u6210\u529F')
  } catch (err) { next(err) }
}

// GET /api/pages/:id/export
export const exportPage = async (req, res, next) => {
  try {
    const config = await pageService.exportPage(Number(req.params.id), req.user.id)
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', `attachment; filename="page-${req.params.id}.json"`)
    res.send(JSON.stringify(config, null, 2))
  } catch (err) { next(err) }
}

// PATCH /api/pages/:id/publish
export const publishPage = async (req, res, next) => {
  try {
    const data = await pageService.publishPage(Number(req.params.id), req.user.id)
    success(res, data, '发布成功')
  } catch (err) { next(err) }
}
