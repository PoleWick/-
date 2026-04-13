import pool from '../config/db.js'

const parse = (row) => row ? { ...row, config: JSON.parse(row.config) } : null

/** 查询某项目下的页面列表（userId 可选：管理用传 userId 做权限过滤，Preview 场景不传） */
export const findByProjectId = async (projectId, userId = null) => {
  const sql = userId
    ? `SELECT id, project_id, title, cover, page_type, is_default, status, created_at, updated_at
       FROM pages WHERE project_id = ? AND user_id = ?
       ORDER BY is_default DESC, created_at ASC`
    : `SELECT id, project_id, title, cover, page_type, is_default, status, created_at, updated_at
       FROM pages WHERE project_id = ?
       ORDER BY is_default DESC, created_at ASC`
  const params = userId ? [projectId, userId] : [projectId]
  const [rows] = await pool.query(sql, params)
  return rows
}

/** 查询单个页面（含 config），可选鉴权 */
export const findById = async (id, userId = null) => {
  const sql = userId
    ? 'SELECT * FROM pages WHERE id = ? AND user_id = ?'
    : 'SELECT * FROM pages WHERE id = ?'
  const [rows] = await pool.query(sql, userId ? [id, userId] : [id])
  return parse(rows[0])
}

/** 创建页面（批量支持） */
export const create = async ({ userId, projectId, title, config, pageType = 'custom', isDefault = 0 }) => {
  const [result] = await pool.query(
    `INSERT INTO pages (project_id, user_id, title, config, page_type, is_default)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [projectId, userId, title, JSON.stringify(config), pageType, isDefault]
  )
  return result.insertId
}

/** 更新页面字段 */
export const update = async (id, userId, { title, config, cover, status }) => {
  const fields = [], values = []
  if (title  !== undefined) { fields.push('title = ?');  values.push(title) }
  if (config !== undefined) { fields.push('config = ?'); values.push(JSON.stringify(config)) }
  if (cover  !== undefined) { fields.push('cover = ?');  values.push(cover) }
  if (status !== undefined) { fields.push('status = ?'); values.push(status) }
  if (!fields.length) return 0
  values.push(id, userId)
  const [result] = await pool.query(
    `UPDATE pages SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`, values
  )
  return result.affectedRows
}

/** 删除页面（is_default=1 的锁定页无法删除） */
export const remove = async (id, userId) => {
  const [result] = await pool.query(
    'DELETE FROM pages WHERE id = ? AND user_id = ? AND is_default = 0',
    [id, userId]
  )
  return result.affectedRows
}

/** 发布页面 */
export const publish = async (id, userId) => {
  const [result] = await pool.query(
    `UPDATE pages SET is_published = 1, published_at = NOW()
     WHERE id = ? AND user_id = ?`,
    [id, userId]
  )
  return result.affectedRows
}

/** 复制页面（复制为 custom 类型，非锁定） */
export const duplicate = async (id, userId, projectId) => {
  const page = await findById(id, userId)
  if (!page) return null
  const [result] = await pool.query(
    `INSERT INTO pages (project_id, user_id, title, config, page_type, is_default)
     VALUES (?, ?, ?, ?, 'custom', 0)`,
    [projectId, userId, `${page.title} - 副本`, JSON.stringify(page.config)]
  )
  return result.insertId
}
