import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Carousel } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import type { ISchema } from '@formily/json-schema'
import styles from './Banner.module.css'

interface BannerItem {
  url: string
}

interface BannerProps {
  images?: BannerItem[]
  height?: number
  autoplay?: boolean
  borderRadius?: number
}

const Banner = ({ images = [], height = 200, autoplay = true, borderRadius = 0 }: BannerProps) => {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)

  const validImages = images.filter((img) => img?.url)

  if (validImages.length === 0) {
    return (
      <div className={styles.placeholder} style={{ height, borderRadius }}>
        暂无图片，请在右侧添加
      </div>
    )
  }

  return (
    <>
      <div className={styles.wrapper} style={{ height, borderRadius }}>
        <Carousel autoplay={autoplay} dots={{ className: styles.dots }}>
          {validImages.map((img, i) => (
            <div key={i}>
              <div
                className={styles.slide}
                style={{ height }}
                onClick={() => setLightboxUrl(img.url)}
              >
                <img src={img.url} alt={`banner-${i + 1}`} className={styles.img} />
              </div>
            </div>
          ))}
        </Carousel>
      </div>

      {/* 图片灯箱：挂载到 body，避免被编辑器 overflow 裁切 */}
      {lightboxUrl && createPortal(
        <div
          className={styles.lightboxOverlay}
          onClick={() => setLightboxUrl(null)}
          role="dialog"
          aria-modal="true"
        >
          <img
            src={lightboxUrl}
            alt="放大图"
            className={styles.lightboxImg}
            onClick={(e) => e.stopPropagation()}
          />
          <CloseOutlined className={styles.lightboxClose} onClick={() => setLightboxUrl(null)} />
        </div>,
        document.body
      )}
    </>
  )
}

export const bannerSchema: ISchema = {
  type: 'object',
  properties: {
    images: {
      type: 'array',
      title: '\u56fe\u7247\u5217\u8868',
      'x-decorator': 'FormItem',
      'x-component': 'ArrayItems',
      items: {
        type: 'object',
        'x-component': 'ArrayItems.Item',
        'x-component-props': {
          style: { flexDirection: 'column', alignItems: 'stretch', gap: 0 },
        },
        properties: {
          url: {
            type: 'string',
            'x-component': 'ImageUploader',
            'x-decorator': 'FormItem',
            'x-decorator-props': { label: null, colon: false, style: { marginBottom: 0 } },
          },
          remove: {
            type: 'void',
            'x-component': 'ArrayItems.Remove',
          },
        },
      },
      properties: {
        add: {
          type: 'void',
          title: '\u6dfb\u52a0\u56fe\u7247',
          'x-component': 'ArrayItems.Addition',
        },
      },
    },
    height: {
      type: 'number',
      title: '\u9ad8\u5ea6(px)',
      'x-decorator': 'FormItem',
      'x-component': 'NumberPicker',
      'x-component-props': { min: 80, max: 600 },
    },
    autoplay: {
      type: 'boolean',
      title: '\u81ea\u52a8\u64ad\u653e',
      'x-decorator': 'FormItem',
      'x-component': 'Switch',
    },
    borderRadius: {
      type: 'number',
      title: '\u5706\u89d2(px)',
      'x-decorator': 'FormItem',
      'x-component': 'NumberPicker',
      'x-component-props': { min: 0, max: 50 },
    },
  },
}

export const bannerDefaultProps: BannerProps = {
  images: [],
  height: 200,
  autoplay: true,
  borderRadius: 0,
}

export default Banner
