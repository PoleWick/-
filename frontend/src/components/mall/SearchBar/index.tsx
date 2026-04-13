import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SearchOutlined } from '@ant-design/icons'
import type { ISchema } from '@formily/json-schema'
import styles from './SearchBar.module.css'

interface SearchBarProps {
  placeholder?:     string
  backgroundColor?: string
  borderRadius?:    number
  __editorMode?:    boolean
}

const SearchBar = ({
  placeholder     = '搜索商品',
  backgroundColor = '#f5f5f5',
  borderRadius    = 20,
  __editorMode    = false,
}: SearchBarProps) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [value, setValue] = useState(searchParams.get('q') || '')

  const commit = (v: string) => {
    const next = new URLSearchParams(searchParams)
    if (v.trim()) next.set('q', v.trim())
    else next.delete('q')
    setSearchParams(next, { replace: true })
  }

  if (__editorMode) {
    return (
      <div className={styles.outer}>
        <div className={styles.inner} style={{ background: backgroundColor, borderRadius, padding: '8px 14px' }}>
          <SearchOutlined style={{ color: '#bbb', fontSize: 16 }} />
          <span className={styles.text}>{placeholder}</span>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.outer}>
      <div className={styles.inner} style={{ background: backgroundColor, borderRadius, padding: '4px 14px' }}>
        <SearchOutlined style={{ color: '#bbb', fontSize: 16, flexShrink: 0 }} />
        <input
          className={styles.input}
          value={value}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && commit(value)}
        />
        {value && (
          <button
            className={styles.clear}
            onClick={() => { setValue(''); commit('') }}
            aria-label="清空"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}

export const searchBarSchema: ISchema = {
  type: 'object',
  properties: {
    placeholder: {
      type: 'string', title: '占位文字',
      'x-decorator': 'FormItem', 'x-component': 'Input',
    },
    backgroundColor: {
      type: 'string', title: '背景颜色',
      'x-decorator': 'FormItem', 'x-component': 'Input',
    },
    borderRadius: {
      type: 'number', title: '圆角(px)',
      'x-decorator': 'FormItem', 'x-component': 'NumberPicker',
      'x-component-props': { min: 0, max: 30 },
    },
  },
}

export const searchBarDefaultProps: SearchBarProps = {
  placeholder:     '搜索商品',
  backgroundColor: '#f5f5f5',
  borderRadius:    20,
}

export default SearchBar
