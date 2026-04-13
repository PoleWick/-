import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { ISchema } from '@formily/json-schema'
import useCartStore, { makeCartKey } from '@/stores/useCartStore'
import styles from './ProductList.module.css'

interface Product {
  id?: number
  name: string
  price: number
  originalPrice?: number  // 划线原价（可选）
  image: string
  badge?: string
}

interface ProductListProps {
  title?: string
  columns?: number
  products?: Product[]
}

const DEFAULT_PRODUCTS: Product[] = [
  { name: '\u793a\u4f8b\u5546\u54c1 A', price: 12.9, originalPrice: 15.0, image: '', badge: '\u65b0\u54c1' },
  { name: '\u793a\u4f8b\u5546\u54c1 B', price: 8.9,  originalPrice: 10.0, image: '', badge: '\u70ed\u9500' },
  { name: '\u793a\u4f8b\u5546\u54c1 C', price: 19.9, image: '' },
]

const MAX_COLUMNS = 3

const ProductList = ({ title = '\u70ed\u9500\u5546\u54c1', columns = 2, products }: ProductListProps) => {
  const safeProducts = Array.isArray(products) && products.length > 0 ? products : DEFAULT_PRODUCTS
  const safeColumns  = Math.min(Math.max(columns ?? 2, 1), MAX_COLUMNS)
  const cardWidth    = `calc(${100 / safeColumns}% - ${8 * (safeColumns - 1) / safeColumns + 1}px)`

  // 搜索过滤
  const [searchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const displayProducts = useMemo(() =>
    q ? safeProducts.filter(p => p.name.toLowerCase().includes(q.toLowerCase())) : safeProducts,
    [safeProducts, q],
  )

  // 购物车 store
  const { items, add, decrease } = useCartStore()
  const getQty = (p: Product) =>
    items.find((i) => i.key === makeCartKey(p.name, p.price))?.quantity ?? 0
  const changeQty = (p: Product, delta: number) => {
    if (delta > 0) {
      add({ name: p.name, price: p.price, originalPrice: p.originalPrice, image: p.image })
    } else {
      decrease(makeCartKey(p.name, p.price))
    }
  }

  return (
    <div className={styles.wrapper}>
      {title && <div className={styles.title}>{title}</div>}
      {q && displayProducts.length === 0 && (
        <div className={styles.empty}>未找到与「{q}」相关的商品</div>
      )}
      <div className={styles.grid}>
        {displayProducts.map((p, i) => (
          <div key={i} className={styles.card} style={{ width: cardWidth, minWidth: cardWidth }}>

            {/* 商品图片区 */}
            <div className={styles.imgBox}>
              {p.image
                ? <img src={p.image} alt={p.name} className={styles.img} />
                : <span className={styles.noImg}>{'暂无图片'}</span>
              }
              {p.badge && <span className={styles.badge}>{p.badge}</span>}
            </div>

            {/* 商品信息区 */}
            <div className={styles.info}>
              <div className={styles.name}>{p.name || '\u672a\u547d\u540d\u5546\u54c1'}</div>

              <div className={styles.priceGroup}>
                <span className={styles.price}>
                  &yen;{(Number(p.price) || 0).toFixed(1)}
                </span>
                {p.originalPrice && p.originalPrice > p.price && (
                  <span className={styles.originalPrice}>
                    &yen;{Number(p.originalPrice).toFixed(1)}
                  </span>
                )}
              </div>

              {/* 数量控件：下一行居中，qty=0 只显示红圆 +；qty>0 展开 − N + */}
              <div className={styles.qtyControls}>
                {getQty(p) > 0 && (
                  <>
                    <button
                      className={styles.qtyCircle}
                      onClick={() => changeQty(p, -1)}
                      aria-label="\u51cf\u5c11\u6570\u91cf"
                    >
                      &minus;
                    </button>
                    <span className={styles.qtyNum}>{getQty(p)}</span>
                  </>
                )}
                <button
                  className={`${styles.qtyCircle} ${styles.qtyCircleAdd}`}
                  onClick={() => changeQty(p, +1)}
                  aria-label="\u589e\u52a0\u6570\u91cf"
                >
                  &#43;
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export const productListSchema: ISchema = {
  type: 'object',
  properties: {
    title: {
      type: 'string',
      title: '\u6807\u9898',
      'x-decorator': 'FormItem',
      'x-component': 'Input',
    },
    columns: {
      type: 'number',
      title: '\u6bcf\u884c\u5217\u6570',
      'x-decorator': 'FormItem',
      'x-component': 'NumberPicker',
      'x-component-props': { min: 1, max: MAX_COLUMNS, placeholder: `\u6700\u591a ${MAX_COLUMNS} \u5217` },
    },
    products: {
      type: 'array',
      title: '\u5546\u54c1\u5217\u8868',
      'x-decorator': 'FormItem',
      'x-component': 'ArrayItems',
      items: {
        type: 'object',
        'x-component': 'ArrayItems.Item',
        'x-component-props': {
          style: { flexDirection: 'column', alignItems: 'stretch', gap: 0 },
        },
        properties: {
          image: {
            type: 'string',
            title: '\u5546\u54c1\u56fe\u7247',
            'x-decorator': 'FormItem',
            'x-component': 'ImageUploader',
          },
          name: {
            type: 'string',
            title: '\u5546\u54c1\u540d\u79f0',
            'x-decorator': 'FormItem',
            'x-component': 'Input',
            'x-component-props': { placeholder: '\u8bf7\u8f93\u5165\u5546\u54c1\u540d\u79f0' },
          },
          price: {
            type: 'number',
            title: '\u73b0\u4ef7(\u00a5)',
            'x-decorator': 'FormItem',
            'x-component': 'NumberPicker',
            'x-component-props': { min: 0, precision: 1, placeholder: '0.0' },
          },
          originalPrice: {
            type: 'number',
            title: '\u5212\u7ebf\u539f\u4ef7',
            'x-decorator': 'FormItem',
            'x-component': 'NumberPicker',
            'x-component-props': { min: 0, precision: 1, placeholder: '\u4e0d\u586b\u5219\u4e0d\u663e\u793a' },
          },
          badge: {
            type: 'string',
            title: '\u5fbd\u7ae0',
            'x-decorator': 'FormItem',
            'x-component': 'Input',
            'x-component-props': { placeholder: '\u65b0\u54c1 / \u70ed\u9500 / \u63a8\u8350...' },
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
          title: '\u6dfb\u52a0\u5546\u54c1',
          'x-component': 'ArrayItems.Addition',
        },
      },
    },
  },
}

export const productListDefaultProps: ProductListProps = {
  title: '\u70ed\u9500\u5546\u54c1',
  columns: 2,
  products: DEFAULT_PRODUCTS,
}

export default ProductList
