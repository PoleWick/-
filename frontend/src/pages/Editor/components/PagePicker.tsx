import { useEffect, useState } from 'react'
import { Select } from 'antd'
import { pagesApi } from '@/apis/pages'

interface PagePickerProps {
  value?:    string
  onChange?: (v: string) => void
  disabled?: boolean
}

/**
 * 在编辑器属性面板中选择项目内的页面，返回 /preview/:id 形式的 URL。
 * 自动从当前编辑器 URL 的 pageId 推断所属项目的页面列表。
 */
const PagePicker = ({ value, onChange, disabled }: PagePickerProps) => {
  const [options, setOptions] = useState<{ label: string; value: string }[]>([])

  useEffect(() => {
    const m = window.location.pathname.match(/\/editor\/(\d+)/)
    if (!m) return
    pagesApi.getDetail(Number(m[1]))
      .then(page => {
        const pages = page.project?.pages ?? []
        setOptions(
          pages.map((p: { id: number; title: string; page_type: string }) => ({
            label: `${p.title}（${p.page_type}）`,
            value: `/preview/${p.id}`,
          }))
        )
      })
      .catch(() => {})
  }, [])

  return (
    <Select
      value={value || undefined}
      onChange={onChange}
      options={options}
      placeholder={'选择页面（自动生成链接）'}
      allowClear
      disabled={disabled}
      style={{ width: '100%' }}
    />
  )
}

export default PagePicker
