import { ShoppingOutlined } from '@ant-design/icons'
import type { ISchema } from '@formily/json-schema'
import styles from './CategoryNav.module.css'

interface Category {
  id: number
  label: string
  icon?: string
  linkUrl?: string
}

interface CategoryNavProps {
  categories?: Category[]
  columns?: number
  showLabel?: boolean
}

const DEFAULT_CATS: Category[] = [
  { id: 1, label: '女装' },
  { id: 2, label: '男装' },
  { id: 3, label: '鞋靴' },
  { id: 4, label: '配饰' },
]

const CategoryNav = ({ categories, columns = 4, showLabel = true }: CategoryNavProps) => {
  const safeCats = Array.isArray(categories) ? categories : DEFAULT_CATS
  const colWidth = `${100 / columns}%`

  return (
    <div className={styles.wrapper}>
      {safeCats.map((cat) => (
        <div key={cat.id} className={styles.item} style={{ width: colWidth }}>
          <div className={styles.iconBox}>
            {cat.icon
              ? <img src={cat.icon} alt={cat.label} className={styles.iconImg} />
              : <ShoppingOutlined className={styles.iconEmoji} />
            }
          </div>
          {showLabel && <span className={styles.label}>{cat.label}</span>}
        </div>
      ))}
    </div>
  )
}

export const categoryNavSchema: ISchema = {
  type: 'object',
  properties: {
    columns: {
      type: 'number', title: '每行列数',
      'x-decorator': 'FormItem', 'x-component': 'NumberPicker',
      'x-component-props': { min: 2, max: 6 },
    },
    showLabel: {
      type: 'boolean', title: '显示标签',
      'x-decorator': 'FormItem', 'x-component': 'Switch',
    },
  },
}

export const categoryNavDefaultProps: CategoryNavProps = {
  categories: DEFAULT_CATS,
  columns: 4,
  showLabel: true,
}

export default CategoryNav
