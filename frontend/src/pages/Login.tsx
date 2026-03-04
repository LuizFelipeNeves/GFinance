import { useState } from 'react';
import { LoginForm, RegisterForm } from '@/components/features/auth';

export const Login = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] p-4 font-sans antialiased text-slate-600">
      <div className="max-w-md w-full">
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3">
            <div className="w-5 h-5 rounded-md bg-emerald-500 shadow-sm" />
          </div>
          <span className="text-2xl font-bold text-slate-900 tracking-tight">GFinance</span>
        </div>
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 md:p-10">
          <div className="flex p-1 bg-slate-50 rounded-2xl mb-8">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${activeTab === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Entrar
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${activeTab === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Cadastrar
            </button>
          </div>

          {activeTab === 'login' ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>
    </div>
  );
};
