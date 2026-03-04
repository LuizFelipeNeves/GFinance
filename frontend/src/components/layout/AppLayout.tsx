import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Receipt, LogOut, Wallet } from 'lucide-react';
import { RemoveAuthToken } from '../../utils/token';

export const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    RemoveAuthToken();
    navigate('/login');
  };

  const menuItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Transações', path: '/transactions', icon: Receipt },
  ];

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] font-sans antialiased text-slate-600 overflow-hidden">
      <aside className="w-64 bg-white border-r border-slate-100 hidden lg:flex flex-col">
        <div className="p-8 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white shadow-sm shadow-emerald-200">
            <Wallet size={18} />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">GFinance</span>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-emerald-50 text-emerald-600' 
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                }`}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-50">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all"
          >
            <LogOut size={20} />
            Sair da conta
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 lg:h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 lg:px-10 flex items-center justify-between sticky top-0 z-40">
          <div className="lg:hidden flex items-center gap-2">
             <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                <Wallet size={16} />
             </div>
             <span className="font-bold text-slate-900">Finance.io</span>
          </div>
          
          <div className="hidden lg:block">
            <h2 className="text-sm font-medium text-slate-400">Bem-vindo de volta!</h2>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};