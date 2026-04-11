import pool from '../src/config/db.js'

const addIfMissing = async (col, def) => {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = ?`,
    [col]
  )
  if (rows[0].cnt > 0) { console.log(`  skip: ${col} already exists`); return }
  await pool.execute(`ALTER TABLE orders ADD COLUMN ${def}`)
  console.log(`  added: ${col}`)
}

await addIfMissing('payment_status',       "payment_status ENUM('pending','paid','failed') NOT NULL DEFAULT 'pending'")
await addIfMissing('alipay_out_trade_no',  'alipay_out_trade_no VARCHAR(64) DEFAULT NULL')
await addIfMissing('alipay_trade_no',      'alipay_trade_no     VARCHAR(64) DEFAULT NULL')

console.log('migration done')
process.exit(0)
