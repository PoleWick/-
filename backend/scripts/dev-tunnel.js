/**
 * 启动内网穿透隧道，然后启动后端服务
 * 用法：npm run dev:tunnel
 *
 * 会自动把 localhost:3001 映射到公网，
 * 并将隧道地址注入 ALIPAY_NOTIFY_URL 环境变量，
 * 使支付宝沙箱能回调到本地服务器。
 */
import localtunnel from 'localtunnel'
import { spawn }   from 'child_process'
import path        from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

console.log('\u23F3 \u6B63\u5728\u5EFA\u7ACB\u5185\u7F51\u7A7F\u900F\u9690\u9053...')

let tunnel
try {
  tunnel = await localtunnel({ port: 3001 })
} catch (err) {
  console.error('\u274C \u9690\u9053\u5EFA\u7ACB\u5931\u8D25\uFF0C\u5C1D\u8BD5\u4E0D\u4F7F\u7528\u9690\u9053\u542F\u52A8...')
  console.error(err.message)
  // 降级：直接启动服务，notify_url 用本地地址
  startServer({})
  process.exit(0)
}

const notifyUrl = `${tunnel.url}/api/payments/notify`

console.log(`\u2705 \u5185\u7F51\u7A7F\u900F\u5730\u5740: ${tunnel.url}`)
console.log(`\uD83D\uDD14 notify_url  : ${notifyUrl}`)
console.log('\u2500'.repeat(50))

// 隧道断开时提示（不自动退出，等重连）
tunnel.on('error', (err) => {
  console.warn('\u26A0\uFE0F  \u9690\u9053\u62A5\u9519:', err.message)
})
tunnel.on('close', () => {
  console.warn('\u26A0\uFE0F  \u9690\u9053\u5DF2\u65AD\u5F00\uFF0C\u5982\u9700\u91CD\u542F\u8BF7\u6267\u884C npm run dev:tunnel')
})

startServer({ ALIPAY_NOTIFY_URL: notifyUrl })

function startServer (extraEnv) {
  const proxyEnv = {}
  if (process.env.HTTPS_PROXY || process.env.HTTP_PROXY) {
    proxyEnv.HTTPS_PROXY = process.env.HTTPS_PROXY || process.env.HTTP_PROXY
    proxyEnv.HTTP_PROXY  = process.env.HTTP_PROXY  || process.env.HTTPS_PROXY
    console.log(`\uD83D\uDD17 \u4F7F\u7528\u4EE3\u7406: ${proxyEnv.HTTPS_PROXY}`)
  }
  const proc = spawn(
    process.execPath,
    ['--watch', path.join(__dirname, '../src/app.js')],
    {
      env:   { ...process.env, ...extraEnv, ...proxyEnv },
      stdio: 'inherit',
      cwd:   path.join(__dirname, '..'),
    }
  )
  proc.on('close', (code) => {
    tunnel?.close()
    process.exit(code ?? 0)
  })
}
