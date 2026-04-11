import type { ISchema } from '@formily/json-schema'
import styles from './TopBar.module.css'

interface TopBarProps {
  title?:           string
  backUrl?:         string
  backgroundColor?: string
  textColor?:       string
  __editorMode?:    boolean
}

const TopBar = ({
  title           = '\u8FD4\u56DE',
  backUrl,
  backgroundColor = '#ffffff',
  textColor       = '#333333',
  __editorMode    = false,
}: TopBarProps) => {
  const handleBack = () => {
    if (__editorMode) return
    if (backUrl) window.location.href = backUrl
    else window.history.back()
  }

  return (
    <div
      className={styles.bar}
      style={{
        backgroundColor,
        position: __editorMode ? 'relative' : undefined,
      }}
    >
      <button className={styles.back} onClick={handleBack} style={{ color: textColor }}>
        {'‹ \u8FD4\u56DE'}
      </button>
      <span className={styles.title} style={{ color: textColor }}>{title}</span>
    </div>
  )
}

export const topBarSchema: ISchema = {
  type: 'object',
  properties: {
    title: {
      type: 'string',
      title: '\u9875\u9762\u6807\u9898',
      'x-decorator': 'FormItem',
      'x-component': 'Input',
      'x-component-props': { placeholder: '\u786E\u8BA4\u8BA2\u5355' },
    },
    backUrl: {
      type: 'string',
      title: '\u8FD4\u56DE\u94FE\u63A5',
      'x-decorator': 'FormItem',
      'x-component': 'Input',
      'x-component-props': { placeholder: '/preview/123\uFF08\u7559\u7A7A\u5219\u8FD4\u56DE\u4E0A\u4E00\u9875\uFF09' },
    },
    backgroundColor: {
      type: 'string',
      title: '\u80CC\u666F\u8272',
      'x-decorator': 'FormItem',
      'x-component': 'Input',
      'x-component-props': { placeholder: '#ffffff' },
    },
    textColor: {
      type: 'string',
      title: '\u6587\u5B57\u989C\u8272',
      'x-decorator': 'FormItem',
      'x-component': 'Input',
      'x-component-props': { placeholder: '#333333' },
    },
  },
}

export const topBarDefaultProps: TopBarProps = {
  title:           '\u786E\u8BA4\u8BA2\u5355',
  backUrl:         '',
  backgroundColor: '#ffffff',
  textColor:       '#333333',
}

export default TopBar
