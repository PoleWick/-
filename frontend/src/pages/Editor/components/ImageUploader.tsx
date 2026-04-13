import { useState } from 'react'
import { Upload, Input, Button, Spin, message } from 'antd'
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons'
import { connect } from '@formily/react'
import { uploadApi } from '@/apis'
import styles from './ImageUploader.module.css'

interface Props {
  value?: string
  onChange?: (url: string) => void
  disabled?: boolean
}

const ImageUploaderBase = ({ value, onChange, disabled }: Props) => {
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (file: File) => {
    setUploading(true)
    try {
      const { url } = await uploadApi.image(file)
      onChange?.(url)
    } catch {
      message.error('上传失败')
    } finally {
      setUploading(false)
    }
    return false // 阻止 antd Upload 默认提交行为
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.inputRow}>
        <Input
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="图片 URL，或点击右侧上传"
          size="small"
          disabled={disabled || uploading}
          className={styles.input}
        />
        <Upload
          beforeUpload={(file) => { handleUpload(file); return false }}
          showUploadList={false}
          accept="image/*"
          disabled={disabled || uploading}
        >
          <Button
            size="small"
            icon={uploading ? <Spin size="small" /> : <UploadOutlined />}
            disabled={disabled || uploading}
            title="上传图片"
          />
        </Upload>
        {value && (
          <Button
            size="small"
            icon={<DeleteOutlined />}
            danger
            onClick={() => onChange?.('')}
            title="清除图片"
          />
        )}
      </div>
    </div>
  )
}

// connect 将组件绑定到 Formily 字段，自动注入 value / onChange
export const ImageUploader = connect(ImageUploaderBase)
