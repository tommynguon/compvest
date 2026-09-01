import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { lazy, Suspense } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { DashboardPage } from './pages/DashboardPage'
import './App.css'

const ComparePage = lazy(() => import('./pages/ComparePage').then((module) => ({ default: module.ComparePage })))
const OfferEditorPage = lazy(() => import('./pages/OfferEditorPage').then((module) => ({ default: module.OfferEditorPage })))

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, staleTime: 30_000 } },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<div className="app-loader">Opening CompVest…</div>}>
        <Routes>
          <Route element={<AppLayout><Outlet /></AppLayout>}>
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
