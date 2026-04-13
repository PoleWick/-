import { useRef } from 'react'
import { useDrag, useDrop, type DropTargetMonitor } from 'react-dnd'
import { Tooltip } from 'antd'
import { DeleteOutlined, HolderOutlined } from '@ant-design/icons'
import { DND_TYPES } from '@/constants/dndTypes'
import { COMPONENT_REGISTRY } from '@/constants/componentRegistry'
import useEditorStore from '@/stores/useEditorStore'
import type { MallComponent } from '@/types'
import styles from './CanvasItem.module.css'

interface Props {
  component: MallComponent
  index: number
}

interface DragItem {
  id: string
  index: number
}

const CanvasItem = ({ component, index }: Props) => {
  const ref = useRef<HTMLDivElement>(null)
  const { selectedId, selectComponent, removeComponent, moveComponent } = useEditorStore()
  const isSelected = selectedId === component.id

  // 使用对象形式（非工厂函数），每次渲染都能拿到最新的 index 和 moveComponent
  const [{ isDragging }, dragRef] = useDrag<DragItem, void, { isDragging: boolean }>({
    type: DND_TYPES.CANVAS_COMPONENT,
    item: { id: component.id, index },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  })

  const [, dropRef] = useDrop<DragItem>({
    accept: DND_TYPES.CANVAS_COMPONENT,
    hover: (item: DragItem, monitor: DropTargetMonitor) => {
      if (!ref.current) return

      const dragIndex = item.index
      const hoverIndex = index
      if (dragIndex === hoverIndex) return

      // 只在鼠标越过元素中线时才执行排序，防止频繁触发导致无限循环
      const rect = ref.current.getBoundingClientRect()
      const midY = (rect.bottom - rect.top) / 2
      const clientOffset = monitor.getClientOffset()
      if (!clientOffset) return
      const hoverY = clientOffset.y - rect.top

      if (dragIndex < hoverIndex && hoverY < midY) return
      if (dragIndex > hoverIndex && hoverY > midY) return

      moveComponent(dragIndex, hoverIndex)
      item.index = hoverIndex
    },
  })

  dragRef(dropRef(ref))

  const registry = COMPONENT_REGISTRY[component.type]
  if (!registry) return null
  const Component = registry.component
  // Immer proxy → 普通对象，避免 .map() 触发 Proxy 只读保护
  const safeProps = JSON.parse(JSON.stringify(component.props)) as Record<string, unknown>

  return (
    <div
      ref={ref}
      className={styles.wrapper}
      style={{
        opacity: isDragging ? 0.4 : 1,
        boxShadow: isSelected ? '0 0 0 2px #ff4d4f' : 'none',
      }}
    >
      <Component {...safeProps} __editorMode={true} />

      {/* 透明遮罩：拦截所有组件内部的点击/交互，由此层统一处理选中逻辑 */}
      <div
        className={styles.interactMask}
        onClick={(e) => { e.stopPropagation(); selectComponent(component.id) }}
      />

      {isSelected && (
        <div className={styles.actionBar}>
          <Tooltip title="拖动排序">
            <span className={styles.actionBtn}><HolderOutlined /></span>
          </Tooltip>
          <Tooltip title="删除组件">
            <span
              className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
              onClick={(e) => { e.stopPropagation(); removeComponent(component.id) }}
            >
              <DeleteOutlined />
            </span>
          </Tooltip>
        </div>
      )}

      {isSelected && (
        <div className={styles.typeLabel}>{registry.label}</div>
      )}
    </div>
  )
}

export default CanvasItem
