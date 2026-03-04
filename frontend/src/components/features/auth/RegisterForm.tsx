import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Mail, User, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { SetAuthToken } from '@/utils/token';
import { useNavigate } from 'react-router';

const registerSchema = z.object({
  name: z.string().min(3, 'Nome muito curto'),
  email: z.email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type RegisterData = z.infer<typeof registerSchema>;

export const RegisterForm = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema)
  });

  const navigate = useNavigate();

  const onSubmit = async (_data: RegisterData) => {
    try {
      await new Promise(r => setTimeout(r, 1500));
      toast('Conta criada com sucesso!', {
        description: 'Bem-vindo ao GFinance, sua jornada financeira começa agora.',
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
      });
      SetAuthToken('fake-token');
      navigate('/dashboard');
    } catch {
      toast('Erro ao criar conta', {
        description: 'Tente novamente mais tarde.',
        icon: <AlertCircle className="h-5 w-5 text-rose-500" />,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 animate-in fade-in duration-500">
      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-500 ml-1">Nome Completo</label>
        <div className="relative group">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
          <input
            {...register('name')}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/30 focus:bg-white outline-none transition-all"
            placeholder="Como quer ser chamado?"
          />
        </div>
        {errors.name && <p className="text-rose-400 text-[11px] ml-1">{errors.name.message}</p>}
      </div>

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

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 ml-1">Senha</label>
          <input
            type="password"
            {...register('password')}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all"
            placeholder="••••••"
          />
          {errors.password && <p className="text-rose-400 text-[10px]">{errors.password.message}</p>}
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 ml-1">Confirmar</label>
          <input
            type="password"
            {...register('confirmPassword')}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all"
            placeholder="••••••"
          />
          {errors.confirmPassword && <p className="text-rose-400 text-[10px]">{errors.confirmPassword.message}</p>}
        </div>
      </div>

      <button
        disabled={isSubmitting}
        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-medium py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 mt-2"
      >
        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Criar conta <ArrowRight className="h-4 w-4" /></>}
      </button>
    </form>
  );
};
