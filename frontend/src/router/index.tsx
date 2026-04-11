import { createBrowserRouter, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { Spin } from 'antd'
import useUserStore from '@/stores/useUserStore'

const Login         = lazy(() => import('@/pages/Login'))
const Register      = lazy(() => import('@/pages/Register'))
const Dashboard     = lazy(() => import('@/pages/Dashboard'))
const ProjectDetail = lazy(() => import('@/pages/ProjectDetail'))
const Editor        = lazy(() => import('@/pages/Editor'))
const Preview       = lazy(() => import('@/pages/Preview'))
const PaymentResult = lazy(() => import('@/pages/PaymentResult'))

const Loading = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <Spin size="large" />
  </div>
)

// initializing 阶段由 AppRoot 全屏 Spin 处理，此处 AppRoot 已保证 initializing=false
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const user = useUserStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

const GuestGuard = ({ children }: { children: React.ReactNode }) => {
  const user = useUserStore((s) => s.user)
  if (user) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<Loading />}>
    <Component />
  </Suspense>
)

const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { path: '/login', element: <GuestGuard>{withSuspense(Login)}</GuestGuard> },
  { path: '/register', element: <GuestGuard>{withSuspense(Register)}</GuestGuard> },
  { path: '/dashboard',            element: <AuthGuard>{withSuspense(Dashboard)}</AuthGuard> },
  { path: '/projects/:projectId', element: <AuthGuard>{withSuspense(ProjectDetail)}</AuthGuard> },
  { path: '/editor/:id?',         element: <AuthGuard>{withSuspense(Editor)}</AuthGuard> },
  { path: '/preview/:id',    element: withSuspense(Preview) },
  { path: '/payment/result', element: withSuspense(PaymentResult) },
])

export default router
