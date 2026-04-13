import * as pageModel    from '../models/pageModel.js'
import * as projectModel from '../models/projectModel.js'

/** 获取项目内页面列表 */
export const getList = async (projectId, userId) =>
  pageModel.findByProjectId(projectId, userId)

/** 获取页面详情（含项目 NavBar 上下文，供 Preview 使用） */
export const getDetail = async (id, userId = null) => {
  const page = await pageModel.findById(id, userId)
  if (!page) throw Object.assign(new Error('\u9875\u9762\u4E0D\u5B58\u5728'), { statusCode: 404 })

  // 附带项目 NavBar 配置 + 兄弟页面列表（preview 用于解析 pageType → pageId）
  const project = await projectModel.findById(page.project_id)
  let projectPages = []
  if (project) {
    projectPages = await pageModel.findByProjectId(page.project_id)
  }
  return {
    ...page,
    project: project
      ? { id: project.id, name: project.name, navbar_config: project.navbar_config, pages: projectPages }
      : null,
  }
}

export const update = async (id, userId, body) => {
  const exists = await pageModel.findById(id, userId)
  if (!exists) throw Object.assign(new Error('\u9875\u9762\u4E0D\u5B58\u5728\u6216\u65E0\u6743\u9650'), { statusCode: 404 })
  const affected = await pageModel.update(id, userId, body)
  if (affected === 0) throw Object.assign(new Error('\u66F4\u65B0\u5931\u8D25'), { statusCode: 500 })
  return pageModel.findById(id)
}

export const remove = async (id, userId) => {
  const affected = await pageModel.remove(id, userId)
  // remove() 只删 is_default=0，affected=0 代表锁定或不存在
  if (affected === 0) throw Object.assign(
    new Error('\u9875\u9762\u4E0D\u5B58\u5728\u3001\u65E0\u6743\u9650\u6216\u8BE5\u9875\u9762\u4E3A\u9501\u5B9A\u6A21\u677F\u9875\u4E0D\u53EF\u5220\u9664'),
    { statusCode: 403 }
  )
}

export const duplicate = async (id, userId) => {
  const page = await pageModel.findById(id, userId)
  if (!page) throw Object.assign(new Error('\u9875\u9762\u4E0D\u5B58\u5728\u6216\u65E0\u6743\u9650'), { statusCode: 404 })
  const newId = await pageModel.duplicate(id, userId, page.project_id)
  return pageModel.findById(newId)
}

export const exportPage = async (id, userId) => {
  const page = await pageModel.findById(id, userId)
  if (!page) throw Object.assign(new Error('页面不存在或无权限'), { statusCode: 404 })
  return page.config
}

export const publishPage = async (id, userId) => {
  const page = await pageModel.findById(id, userId)
  if (!page) throw Object.assign(new Error('页面不存在或无权限'), { statusCode: 404 })
  await pageModel.publish(id, userId)
  return pageModel.findById(id)
}
