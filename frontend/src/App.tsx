import { lazy, Suspense } from 'react';
import { Toaster } from 'sonner';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { PrivateRoute } from './components/layout/PrivateRoute';

const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Transactions = lazy(() => import('./pages/Transactions').then(m => ({ default: m.Transactions })));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const ConfigToast = () => (
  <Toaster
    position="top-center"
    expand={false}
    richColors={false}
    toastOptions={{
      unstyled: true,
      classNames: {
        toast: 'w-full flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 font-sans',
        title: 'text-sm font-semibold text-slate-900',
        description: 'text-xs text-slate-500',
        icon: 'text-emerald-500',
        error: 'border-rose-100 bg-rose-50 text-rose-600',
        success: 'border-emerald-100 bg-emerald-50 text-emerald-600',
      },
    }}
  />
);

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<PrivateRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/transactions" element={<Transactions />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <ConfigToast />
    </BrowserRouter>
  );
}
