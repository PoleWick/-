import { useState } from 'react'
import { Modal, QRCode, Typography, Space, Button, Divider, Tag, Tooltip, message as staticMessage, Alert } from 'antd'
import { CopyOutlined, CheckOutlined, LinkOutlined, RocketOutlined } from '@ant-design/icons'
import { pagesApi } from '@/apis'
import styles from './ExportModal.module.css'

interface PublishModalProps {
  open:        boolean
  pageId:      number
  pageTitle:   string
  isPublished: boolean
  onClose:     () => void
  onPublished: () => void  // 发布成功后回调，用于刷新父组件状态
}

const { Text, Paragraph } = Typography

const PublishModal = ({ open, pageId, pageTitle, isPublished, onClose, onPublished }: PublishModalProps) => {
  const [publishing, setPublishing] = useState(false)
  const [copied,     setCopied]     = useState(false)

  const previewUrl = `${window.location.origin}/preview/${pageId}`

  const handlePublish = async () => {
    setPublishing(true)
    try {
      await pagesApi.publish(pageId)
      staticMessage.success('发布成功！')
      onPublished()
    } catch {
      staticMessage.error('发布失败，请重试')
    } finally {
      setPublishing(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(previewUrl)
      setCopied(true)
      staticMessage.success('链接已复制')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      staticMessage.error('复制失败，请手动复制')
    }
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={
        <Space>
          <RocketOutlined />
          <span>发布页面</span>
        </Space>
      }
      width={420}
      centered
    >
      <div className={styles.container}>
        {/* 页面信息 */}
        <div className={styles.pageInfo}>
          <Text strong className={styles.pageTitle}>{pageTitle || '未命名页面'}</Text>
          {isPublished
            ? <Tag color="success" className={styles.statusTag}>已发布</Tag>
            : <Tag color="default" className={styles.statusTag}>未发布</Tag>
          }
        </div>

        {/* 未发布提示 + 发布按钮 */}
        {!isPublished && (
          <Alert
            type="info"
            showIcon
            message="点击下方按钮将页面标记为已发布"
            description="发布后链接可分享给他人访问。若尚未部署到服务器，链接仅局域网内可用。"
            style={{ marginBottom: 16 }}
          />
        )}

        {!isPublished && (
          <Button
            type="primary"
            block
            icon={<RocketOutlined />}
            loading={publishing}
            onClick={handlePublish}
            style={{ marginBottom: 16 }}
          >
            立即发布
          </Button>
        )}

        {/* 二维码（已发布或未发布都可预览） */}
        <div className={styles.qrWrapper}>
          <QRCode
            value={previewUrl}
            size={180}
            color="#262626"
            bgColor="#ffffff"
            bordered={false}
          />
          <Text type="secondary" className={styles.qrHint}>
            {isPublished ? '扫码访问已发布页面' : '扫码局域网预览（需同一 Wi-Fi）'}
          </Text>
        </div>

        <Divider style={{ margin: '16px 0' }} />

        {/* 链接 */}
        <div className={styles.linkSection}>
          <Text type="secondary" className={styles.linkLabel}>
            <LinkOutlined /> {isPublished ? '公开访问链接' : '预览链接'}
          </Text>
          <div className={styles.linkRow}>
            <Paragraph
              className={styles.linkText}
              ellipsis={{ rows: 1, tooltip: previewUrl }}
            >
              {previewUrl}
            </Paragraph>
            <Tooltip title={copied ? '已复制' : '复制链接'}>
              <Button
                type="text"
                size="small"
                icon={copied ? <CheckOutlined style={{ color: '#52c41a' }} /> : <CopyOutlined />}
                onClick={handleCopy}
                className={styles.copyBtn}
              />
            </Tooltip>
          </div>
        </div>

        {/* 在新窗口打开 */}
        <div className={styles.actions}>
          <Button
            block
            onClick={() => window.open(previewUrl, '_blank')}
          >
            在新窗口打开预览
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default PublishModal
