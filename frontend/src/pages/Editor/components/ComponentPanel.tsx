import { useDrag } from 'react-dnd'
import { Typography } from 'antd'
import { AppstoreOutlined } from '@ant-design/icons'
import { DND_TYPES } from '@/constants/dndTypes'
import { COMPONENT_LIST } from '@/constants/componentRegistry'
import type { ComponentType } from '@/types'
import * as Icons from '@ant-design/icons'
import type { FC } from 'react'
import styles from './ComponentPanel.module.css'

const { Text } = Typography

interface DraggableItemProps {
  type: ComponentType
  label: string
  icon: string
}

const DraggableItem: FC<DraggableItemProps> = ({ type, label, icon }) => {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: DND_TYPES.NEW_COMPONENT,
    item: { componentType: type },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComp = (Icons as any)[icon] as FC<{ className?: string }> | undefined

  return (
    <div
      ref={dragRef as unknown as React.RefObject<HTMLDivElement>}
      className={`${styles.item} ${isDragging ? styles.itemDragging : ''}`}
    >
      {IconComp
        ? <IconComp className={styles.icon} />
        : <AppstoreOutlined className={styles.icon} />
      }
      <Text className={styles.label}>{label}</Text>
    </div>
  )
}

const ComponentPanel = () => (
  <div className={styles.panel}>
    <Text type="secondary" className={styles.hint}>拖拽组件到画布</Text>
    <div className={styles.grid}>
      {COMPONENT_LIST.map((comp) => (
        <DraggableItem key={comp.type} type={comp.type} label={comp.label} icon={comp.icon} />
      ))}
    </div>
  </div>
)

export default ComponentPanel
