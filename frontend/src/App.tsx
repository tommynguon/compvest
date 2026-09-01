import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { lazy, Suspense } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { api } from './lib/api'
import type { User } from './lib/types'
import { AuthPage } from './pages/AuthPage'
import { DashboardPage } from './pages/DashboardPage'
import './App.css'

const ComparePage = lazy(() => import('./pages/ComparePage').then((module) => ({ default: module.ComparePage })))
const OfferEditorPage = lazy(() => import('./pages/OfferEditorPage').then((module) => ({ default: module.OfferEditorPage })))

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, staleTime: 30_000 } },
})

function ProtectedRoute() {
  const { data, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => api<{ user: User }>('/api/v1/me'),
  })

  if (isLoading) return <div className="app-loader">Opening your workspace…</div>
  if (!data?.user) return <Navigate to="/welcome" replace />

  return <AppLayout user={data.user}><Outlet /></AppLayout>
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<div className="app-loader">Preparing your workspace…</div>}>
        <Routes>
          <Route path="/welcome" element={<AuthPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/offers/new" element={<OfferEditorPage />} />
            <Route path="/offers/:offerId/edit" element={<OfferEditorPage />} />
            <Route path="/compare" element={<ComparePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </QueryClientProvider>
  )
}
