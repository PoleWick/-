import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Spin, Result, Button } from 'antd'
import { pagesApi } from '@/apis'
import { COMPONENT_REGISTRY } from '@/constants/componentRegistry'
import type { Page, ComponentType } from '@/types'
import styles from './Preview.module.css'

const Preview = () => {
  const { id } = useParams<{ id: string }>()
  const [page,    setPage]    = useState<Page | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)

  useEffect(() => {
    if (!id) { setError(true); setLoading(false); return }
    pagesApi.getDetail(Number(id))
      .then((data) => setPage(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className={styles.loading}><Spin size="large" /></div>
  )

  if (error || !page) return (
    <Result
      status="404"
      title={'\u9875\u9762\u4E0D\u5B58\u5728'}
      extra={<Button onClick={() => window.close()}>{'\u5173\u95ED'}</Button>}
    />
  )

  const { pageSettings, components } = page.config
  const sorted = [...components].sort((a, b) => a.order - b.order)

  const previewUrl = window.location.href
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(previewUrl)}`

  return (
    <div className={styles.outer} style={{ backgroundColor: pageSettings.backgroundColor || '#f5f5f5' }}>
      {/* 左侧二维码卡片（仅桌面端显示） */}
      <div className={styles.qrCard}>
        <img src={qrSrc} alt="预览二维码" className={styles.qrImg} />
        <p className={styles.qrTip}>手机扫码预览</p>
        <p className={styles.qrSub}>请确保手机与电脑在同一 Wi-Fi 下</p>
      </div>

      <div id="preview-container" className={styles.inner} style={{ maxWidth: pageSettings.maxWidth || 375 }}>
        <div className={styles.innerContent}>
          {sorted.map((comp) => {
            const registry = COMPONENT_REGISTRY[comp.type as ComponentType]
            if (!registry) return null
            const Component = registry.component
            return <Component key={comp.id} {...comp.props} />
          })}
        </div>
      </div>
    </div>
  )
}

export default Preview
