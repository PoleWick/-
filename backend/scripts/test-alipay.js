import { AlipaySdk } from 'alipay-sdk'
import dotenv from 'dotenv'
dotenv.config()

const sdk = new AlipaySdk({
  appId:           process.env.ALIPAY_APP_ID,
  privateKey:      process.env.ALIPAY_PRIVATE_KEY,
  alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY,
  gateway:         process.env.ALIPAY_GATEWAY,
  signType:        'RSA2',
})

try {
  const html = await sdk.pageExec('alipay.trade.page.pay', {
    method:    'GET',
    returnUrl: 'http://localhost:5173/payment/result',
    notifyUrl: 'http://localhost:3001/api/payments/notify',
    bizContent: {
      out_trade_no:  'test_' + Date.now(),
      product_code:  'FAST_INSTANT_TRADE_PAY',
      total_amount:  '0.01',
      subject:       '测试订单',
    },
  })

  const s      = String(html)
  const match  = s.match(/action="([^"]+)"/)
  const payUrl = match ? match[1].replace(/&amp;/g, '&') : null

  console.log('--- RAW HTML ---')
  console.log(JSON.stringify(s.slice(0, 800)))
} catch (e) {
  console.error('ERROR:', e.message)
}
process.exit(0)
