import { useState } from 'react'
import { Button, Badge } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import type { ISchema } from '@formily/json-schema'
import useCartStore from '@/stores/useCartStore'
import styles from './CartEntry.module.css'

interface CartEntryProps {
  checkoutUrl?: string
  buttonColor?: string
  /** 由编辑器画布注入，禁用 sticky 定位以避免在画布内错位 */
  __editorMode?: boolean
}

const CartEntry = ({
  checkoutUrl = '',
  buttonColor = '#ff4d4f',
  __editorMode = false,
}: CartEntryProps) => {
  const [open, setOpen] = useState(false)
  const { items, add, decrease, clear } = useCartStore()

  const totalCount = items.reduce((s, i) => s + (i.quantity || 0), 0)
  const totalPrice = items.reduce((s, i) => s + (Number(i.price) || 0) * (i.quantity || 0), 0)

  const handleCheckout = () => {
    if (checkoutUrl) window.location.href = checkoutUrl
  }

  return (
    <>
      {/* ===== 底部结算栏 ===== */}
      <div className={styles.bar} style={__editorMode ? { position: 'relative', zIndex: 1 } : undefined}>
        {/* 购物袋图标 + 总数 */}
        <div className={styles.bagWrap} onClick={() => setOpen(true)}>
          <Badge count={totalCount} size="small" color={buttonColor} offset={[-2, 2]}>
            <div className={styles.bagIcon} style={{ background: buttonColor }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"
                  stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
            </div>
          </Badge>
          <div className={styles.priceInfo}>
            {totalCount > 0
              ? <span className={styles.totalPrice}>&yen;{(totalPrice || 0).toFixed(1)}</span>
              : <span className={styles.emptyHint}>{'购物车空空如也'}</span>
            }
          </div>
        </div>

        {/* 去结算按钮 */}
        <button
          className={styles.checkoutBtn}
          style={{ background: totalCount > 0 ? buttonColor : '#ccc' }}
          disabled={totalCount === 0}
          onClick={handleCheckout}
        >
          {'去结算'}
        </button>
      </div>

      {/* ===== 自定义底部浮层（替代 Drawer，避免 scroll-lock 抖动） ===== */}
      {/* 遮罩 */}
      <div
        className={`${styles.mask} ${open ? styles.maskVisible : ''}`}
        onClick={() => setOpen(false)}
      />
      {/* 面板 */}
      <div className={`${styles.sheet} ${open ? styles.sheetOpen : ''}`}>
        {/* 面板头部 */}
        <div className={styles.drawerHeader}>
          <span>{'已选商品'}</span>
          {items.length > 0 && (
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              onClick={clear}
              className={styles.clearBtn}
            >
              {'清空'}
            </Button>
          )}
        </div>
        {/* 面板内容 */}
        <div className={styles.sheetBody}>
          {items.length === 0 ? (
            <div className={styles.emptyCart}>{'购物车还没有商品哦~'}</div>
          ) : (
            <div className={styles.itemList}>
              {items.map((item) => (
                <div key={item.key} className={styles.itemRow}>
                  <div className={styles.itemImg}>
                    {item.image
                      ? <img src={item.image} alt={item.name} className={styles.itemImgEl} />
                      : <div className={styles.itemImgPlaceholder} />
                    }
                  </div>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemName}>{item.name}</div>
                    <div className={styles.itemPriceRow}>
                      <span className={styles.itemPrice}>&yen;{(Number(item.price) || 0).toFixed(1)}</span>
                      {item.originalPrice && Number(item.originalPrice) > Number(item.price) && (
                        <span className={styles.itemOriginalPrice}>
                          &yen;{Number(item.originalPrice).toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={styles.itemQty}>
                    <button className={styles.qtyCircle} onClick={() => decrease(item.key)} aria-label="减少">
                      &minus;
                    </button>
                    <span className={styles.qtyNum}>{item.quantity}</span>
                    <button
                      className={`${styles.qtyCircle} ${styles.qtyCircleAdd}`}
                      onClick={() => add({ name: item.name, price: item.price, originalPrice: item.originalPrice, image: item.image })}
                      aria-label="增加"
                    >
                      &#43;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export const cartEntrySchema: ISchema = {
  type: 'object',
  properties: {
    checkoutUrl: {
      type: 'string',
      title: '\u7ed3\u7b97\u8df3\u8f6c\u9875\u9762',
      'x-decorator': 'FormItem',
      'x-component': 'PagePicker',
    },
    buttonColor: {
      type: 'string',
      title: '\u6309\u9215\u989c\u8272',
      'x-decorator': 'FormItem',
      'x-component': 'Input',
      'x-component-props': { placeholder: '#ff4d4f' },
    },
  },
}

export const cartEntryDefaultProps: CartEntryProps = {
  checkoutUrl: '',
  buttonColor: '#ff4d4f',
}

export default CartEntry
