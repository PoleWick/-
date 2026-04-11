import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Layout, Button, Space, Typography, Input, Spin, Tooltip, App, Breadcrumb } from 'antd'
import useMessage from '@/hooks/useMessage'
import {
  SaveOutlined, EyeOutlined, ExportOutlined,
  ArrowLeftOutlined, SettingOutlined,
} from '@ant-design/icons'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import useEditorStore from '@/stores/useEditorStore'
import { pagesApi } from '@/apis'
import ComponentPanel from './components/ComponentPanel'
import EditorCanvas from './components/EditorCanvas'
import PropsPanel from './components/PropsPanel'
import PageSettingsPanel from './components/PageSettingsPanel'
import ExportModal from './components/ExportModal'
import styles from './Editor.module.css'

const { Header, Sider, Content } = Layout
const { Text } = Typography

const RIGHT_WIDTH_KEY = 'editor_right_width'
const RIGHT_MIN = 220
const RIGHT_MAX = 560

const Editor = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [exportOpen,   setExportOpen]   = useState(false)
  const [projectId,   setProjectId]   = useState<number | null>(null)
  const [projectName, setProjectName] = useState<string>('')

  // 右侧面板宽度（持久化到 localStorage）
  const [rightWidth, setRightWidth] = useState(
    () => Number(localStorage.getItem(RIGHT_WIDTH_KEY)) || 280
  )
  const rightRef = useRef<HTMLDivElement>(null)

  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const startX  = e.clientX
    const startW  = rightRef.current?.offsetWidth ?? rightWidth

    const onMove = (ev: MouseEvent) => {
      const w = Math.min(RIGHT_MAX, Math.max(RIGHT_MIN, startW + startX - ev.clientX))
      setRightWidth(w)
    }
    const onUp = (ev: MouseEvent) => {
      const w = Math.min(RIGHT_MAX, Math.max(RIGHT_MIN, startW + startX - ev.clientX))
      localStorage.setItem(RIGHT_WIDTH_KEY, String(w))
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [rightWidth])
  const message = useMessage()
  const { modal } = App.useApp()

  const {
    pageTitle, isDirty, pageId,
    setPageTitle, loadConfig, exportConfig, resetEditor,
  } = useEditorStore()

  // 编辑器要求必须有页面 ID，无 ID 时重定向
  useEffect(() => {
    if (!id) { navigate('/dashboard', { replace: true }); return }
    setLoading(true)
    pagesApi.getDetail(Number(id))
      .then((data) => {
        loadConfig(data.config, data.id, data.title)
        setProjectId(data.project_id)
        setProjectName(data.project?.name ?? '')
      })
      .catch(() => { message.error('\u52A0\u8F7D\u9875\u9762\u5931\u8D25'); navigate('/dashboard') })
      .finally(() => setLoading(false))
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  // 离开前提示未保存
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) { e.preventDefault(); e.returnValue = '' }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  const handleSave = async () => {
    if (!pageId) return
    setSaving(true)
    try {
      const config = exportConfig()
      await pagesApi.update(pageId, { title: pageTitle, config })
      message.success('\u4FDD\u5B58\u6210\u529F')
      useEditorStore.setState({ isDirty: false })
    } catch {
      message.error('\u4FDD\u5B58\u5931\u8D25')
    } finally {
      setSaving(false)
    }
  }

  const handleExport = () => {
    if (!pageId) {
      modal.confirm({
        title: '请先保存页面',
        content: '需要保存页面后才能生成分享链接，是否立即保存？',
        okText: '立即保存',
        cancelText: '取消',
        onOk: handleSave,
      })
      return
    }
    setExportOpen(true)
  }

  const backTarget = projectId ? `/projects/${projectId}` : '/dashboard'

  const handleBack = () => {
    if (!isDirty) { navigate(backTarget); return }
    modal.confirm({
      title: '\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539',
      content: '\u5F53\u524D\u9875\u9762\u6709\u672A\u4FDD\u5B58\u7684\u5185\u5BB9\uFF0C\u76F4\u63A5\u79BB\u5F00\u5C06\u4E22\u5931\u4FEE\u6539\u3002',
      okText: '\u76F4\u63A5\u79BB\u5F00',
      okButtonProps: { danger: true },
      cancelText: '\u7EE7\u7EED\u7F16\u8F91',
      onOk: () => navigate(backTarget),
    })
  }

  if (loading) return (
    <div className={styles.loadingScreen}>
      <Space direction="vertical" align="center" size={12}>
        <Spin size="large" />
        <Text type="secondary">加载页面中...</Text>
      </Space>
    </div>
  )

  return (
    <DndProvider backend={HTML5Backend}>
      <Layout className={styles.editorLayout}>
        {/* 顶部工具栏 */}
        <Header className={styles.editorHeader}>
          <div className={styles.headerLeft}>
            <Tooltip title="\u8FD4\u56DE\u9879\u76EE">
              <Button icon={<ArrowLeftOutlined />} type="text" onClick={handleBack} />
            </Tooltip>
            {projectName && (
              <Breadcrumb
                className={styles.breadcrumb}
                items={[
                  { title: <Link to="/dashboard">{'\u6211\u7684\u9879\u76EE'}</Link> },
                  { title: projectId
                    ? <Link to={`/projects/${projectId}`}>{projectName}</Link>
                    : projectName },
                ]}
              />
            )}
            <Tooltip title="\u70B9\u51FB\u4FEE\u6539\u9875\u9762\u540D\u79F0" placement="bottom" mouseEnterDelay={0.8}>
              <Input
                value={pageTitle}
                onChange={(e) => setPageTitle(e.target.value)}
                className={styles.titleInput}
                variant="borderless"
                placeholder="\u672A\u547D\u540D\u9875\u9762"
              />
            </Tooltip>
            {isDirty && (
              <Text type="secondary" className={styles.unsavedHint}>{'● \u672A\u4FDD\u5B58'}</Text>
            )}
          </div>
          <Space>
            <Tooltip title={'\u9875\u9762\u5168\u5C40\u8BBE\u7F6E'}>
              <Button icon={<SettingOutlined />} onClick={() => setSettingsOpen(true)} />
            </Tooltip>
            <Button
              icon={<EyeOutlined />}
              onClick={() => pageId && window.open(`/preview/${pageId}`, '_blank')}
              disabled={!pageId}
            >
              预览
            </Button>
            <Button icon={<ExportOutlined />} onClick={handleExport}>导出</Button>
            <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave}>
              保存
            </Button>
          </Space>
        </Header>

        <Layout>
          {/* 左侧：组件面板 */}
          <Sider width={200} className={styles.leftSider} theme="light">
            <ComponentPanel />
          </Sider>

          {/* 中间：画布 */}
          <Content className={styles.canvasArea}>
            <EditorCanvas />
          </Content>

          {/* 右侧：属性配置（可拖拽调宽） */}
          <div
            ref={rightRef}
            className={styles.rightSider}
            style={{ width: rightWidth, minWidth: rightWidth }}
          >
            <div className={styles.resizeHandle} onMouseDown={startResize} />
            <PropsPanel />
          </div>
        </Layout>
      </Layout>

      {/* 页面全局设置弹窗 */}
      <PageSettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* 导出/分享弹窗 */}
      {pageId && (
        <ExportModal
          open={exportOpen}
          pageId={pageId}
          pageTitle={pageTitle}
          onClose={() => setExportOpen(false)}
        />
      )}

    </DndProvider>
  )
}

export default Editor
