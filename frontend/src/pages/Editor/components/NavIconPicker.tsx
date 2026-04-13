import { useState } from 'react'
import { Select, Upload, Button, Spin } from 'antd'
import { UploadOutlined, RollbackOutlined } from '@ant-design/icons'
import { connect } from '@formily/react'
import { NAV_ICON_OPTIONS, ICON_MAP, isImageUrl } from '@/components/mall/NavBar'

const VALID_PRESETS = new Set(NAV_ICON_OPTIONS.map(o => o.value))
import { uploadApi } from '@/apis'

interface Props {
  value?: string
  onChange?: (v: string) => void
}

const NavIconPickerBase = ({ value, onChange }: Props) => {
  const [uploading, setUploading] = useState(false)

  // 过滤掉旧版 emoji 或其他无效值，统一回落到默认预设
  const safeValue = value && (isImageUrl(value) || VALID_PRESETS.has(value))
    ? value
    : 'HomeOutlined'

  const handleUpload = async (file: File) => {
    setUploading(true)
    try {
      const { url } = await uploadApi.image(file)
      onChange?.(url)
    } catch {
      // 上传失败静默处理，保留原值
    } finally {
      setUploading(false)
    }
    return false
  }

  /** 当前值是自定义图片 URL */
  if (safeValue && isImageUrl(safeValue)) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <img
          src={safeValue}
          alt="icon"
          style={{ width: 28, height: 28, objectFit: 'contain', borderRadius: 4, border: '1px solid #d9d9d9' }}
        />
        <Button
          size="small"
          icon={<RollbackOutlined />}
          onClick={() => onChange?.('HomeOutlined')}
        >
          恢复默认
        </Button>
      </div>
    )
  }

  /** 当前值是预设图标名（或空） */
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      <Select
        value={safeValue}
        onChange={(v) => onChange?.(v)}
        options={NAV_ICON_OPTIONS.map(o => ({
          ...o,
          label: (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {ICON_MAP[o.value]}
              {o.label}
            </span>
          ),
        }))}
        size="small"
        style={{ flex: 1 }}
      />
      <Upload
        beforeUpload={(file) => { handleUpload(file); return false }}
        showUploadList={false}
        accept="image/*"
        disabled={uploading}
      >
        <Button
          size="small"
          icon={uploading ? <Spin size="small" /> : <UploadOutlined />}
          disabled={uploading}
          title="上传自定义图标"
        />
      </Upload>
    </div>
  )
}

export const NavIconPicker = connect(NavIconPickerBase)
