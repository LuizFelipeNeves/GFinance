import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Mail, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { SetAuthToken } from '@/utils/token';
import { useNavigate } from 'react-router';

const loginSchema = z.object({
  email: z.email('E-mail inválido'),
  password: z.string().min(6, 'Senha curta demais'),
});

type LoginData = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginData>({
    resolver: zodResolver(loginSchema)
  });

  const navigate = useNavigate();

  const onSubmit = async (_data: LoginData) => {
    try {
      await new Promise(r => setTimeout(r, 1500));
      toast('Bem-vindo de volta!', {
        description: 'Login realizado com sucesso no GFinance',
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
      });
      SetAuthToken('fake-token');
      navigate('/dashboard');
    } catch {
      toast('Erro ao fazer login', {
        description: 'Tente novamente mais tarde.',
        icon: <AlertCircle className="h-5 w-5 text-rose-500" />,
      });
    }
  };

  const forgotPassword = () => {
    toast('Recuperação de senha', {
      description: 'Funcionalidade de recuperação de senha ainda não implementada.',
      icon: <Loader2 className="h-5 w-5 text-slate-400 animate-spin" />,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 animate-in fade-in duration-500">
      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-500 ml-1">E-mail</label>
        <div className="relative group">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
          <input
            {...register('email')}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/30 focus:bg-white outline-none transition-all"
            placeholder="seu@email.com"
          />
        </div>
        {errors.email && <p className="text-rose-400 text-[11px] ml-1">{errors.email.message}</p>}
      </div>

      <div className="space-y-1">
        <div className="flex justify-between ml-1">
          <label className="text-xs font-semibold text-slate-500">Senha</label>
          <span onClick={forgotPassword} className="text-xs font-medium text-emerald-600 cursor-pointer">Esqueceu?</span>
        </div>
        <div className="relative group">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="password"
            {...register('password')}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/30 focus:bg-white outline-none transition-all"
            placeholder="••••••••"
          />
        </div>
        {errors.password && <p className="text-rose-400 text-[11px] ml-1">{errors.password.message}</p>}
      </div>

      <button
        disabled={isSubmitting}
        className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-medium py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 mt-2"
      >
        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Acessar Conta'}
      </button>
    </form>
  );
};
