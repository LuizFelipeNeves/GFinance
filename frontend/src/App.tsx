import { Toaster } from 'sonner';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { AppLayout } from './components/layout/AppLayout';
import { PrivateRoute } from './components/layout/PrivateRoute';

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
      <ConfigToast />
    </BrowserRouter>
  );
}