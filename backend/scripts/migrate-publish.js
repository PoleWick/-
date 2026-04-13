import pool from '../src/config/db.js'

const addIfMissing = async (table, col, def) => {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, col]
  )
  if (rows[0].cnt > 0) { console.log(`  skip: ${table}.${col} already exists`); return }
  await pool.execute(`ALTER TABLE ${table} ADD COLUMN ${def}`)
  console.log(`  added: ${table}.${col}`)
}

await addIfMissing('pages', 'is_published', "is_published TINYINT(1) NOT NULL DEFAULT 0")
await addIfMissing('pages', 'published_at', "published_at DATETIME DEFAULT NULL")

console.log('migration done')
process.exit(0)
