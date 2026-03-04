import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Mail, Lock, User, ArrowRight } from 'lucide-react';

const loginSchema = z.object({
  email: z.email('E-mail inválido'),
  password: z.string().min(6, 'Senha curta demais'),
});

const registerSchema = z.object({
  name: z.string().min(3, 'Nome muito curto'),
  email: z.email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

const LoginForm = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: any) => {
    await new Promise(r => setTimeout(r, 1500));
    console.log('Login:', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 animate-in fade-in duration-500">
      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-500 ml-1">E-mail</label>
        <div className="relative group">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
          <input {...register('email')} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/30 focus:bg-white outline-none transition-all" placeholder="seu@email.com" />
        </div>
        {errors.email && <p className="text-rose-400 text-[11px] ml-1">{errors.email.message as string}</p>}
      </div>

      <div className="space-y-1">
        <div className="flex justify-between ml-1">
          <label className="text-xs font-semibold text-slate-500">Senha</label>
          <a href="#" className="text-xs font-medium text-emerald-600">Esqueceu?</a>
        </div>
        <div className="relative group">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
          <input type="password" {...register('password')} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/30 focus:bg-white outline-none transition-all" placeholder="••••••••" />
        </div>
        {errors.password && <p className="text-rose-400 text-[11px] ml-1">{errors.password.message as string}</p>}
      </div>

      <button disabled={isSubmitting} className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-medium py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 mt-2">
        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Acessar Conta'}
      </button>
    </form>
  );
};

const RegisterForm = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: any) => {
    await new Promise(r => setTimeout(r, 1500));
    console.log('Registro:', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 animate-in fade-in duration-500">
      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-500 ml-1">Nome Completo</label>
        <div className="relative group">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
          <input {...register('name')} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/30 focus:bg-white outline-none transition-all" placeholder="Como quer ser chamado?" />
        </div>
        {errors.name && <p className="text-rose-400 text-[11px] ml-1">{errors.name.message as string}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-500 ml-1">E-mail</label>
        <div className="relative group">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
          <input {...register('email')} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/30 focus:bg-white outline-none transition-all" placeholder="seu@email.com" />
        </div>
        {errors.email && <p className="text-rose-400 text-[11px] ml-1">{errors.email.message as string}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 ml-1">Senha</label>
          <input type="password" {...register('password')} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all" placeholder="••••••" />
          {errors.password && <p className="text-rose-400 text-[10px]">{errors.password.message as string}</p>}
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 ml-1">Confirmar</label>
          <input type="password" {...register('confirmPassword')} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all" placeholder="••••••" />
          {errors.confirmPassword && <p className="text-rose-400 text-[10px]">{errors.confirmPassword.message as string}</p>}
        </div>
      </div>

      <button disabled={isSubmitting} className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-medium py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 mt-2">
        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Criar conta <ArrowRight className="h-4 w-4" /></>}
      </button>
    </form>
  );
};

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