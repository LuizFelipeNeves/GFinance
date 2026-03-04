import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useTransactions } from '@/hooks/useTransactions';
import { BaseModal } from '@/components/shared/BaseModal';
import type { Transaction } from '@/data/types';

const transactionSchema = z.object({
  desc: z.string().min(1, 'Descrição obrigatória'),
  cat: z.string().min(1, 'Categoria obrigatória'),
  date: z.string().min(1, 'Data obrigatória'),
  val: z.string().min(1, 'Valor obrigatória'),
  type: z.enum(['in', 'out']),
});

type TransactionData = z.infer<typeof transactionSchema>;

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: Transaction | null;
  onSuccess?: () => void;
}

export const AddTransactionModal = ({ isOpen, onClose, transaction, onSuccess }: AddTransactionModalProps) => {
  const { updateTransaction } = useTransactions();
  const isEditing = !!transaction;

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue, watch } = useForm<TransactionData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      desc: '',
      cat: '',
      date: new Date().toISOString().split('T')[0],
      val: '',
      type: 'out',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (transaction) {
        reset({
          desc: transaction.desc,
          cat: transaction.cat,
          date: transaction.date,
          val: transaction.val.toString(),
          type: transaction.type,
        });
      } else {
        reset({
          desc: '',
          cat: '',
          date: new Date().toISOString().split('T')[0],
          val: '',
          type: 'out',
        });
      }
    }
  }, [isOpen, transaction, reset]);

  const watchType = watch('type');

  const onSubmit = async (data: TransactionData) => {
    try {
      await new Promise(r => setTimeout(r, 500));

      if (isEditing && transaction) {
        updateTransaction(transaction.id, {
          desc: data.desc,
          cat: data.cat,
          date: data.date,
          val: parseFloat(data.val),
          type: data.type,
        });
        onSuccess?.();
      } else {
        toast.success('Transação adicionada com sucesso!');
        onClose();
        reset({
          desc: '',
          cat: '',
          date: new Date().toISOString().split('T')[0],
          val: '',
          type: 'out',
        });
      }
    } catch {
      toast.error('Erro ao salvar transação');
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Transação' : 'Nova Transação'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8 space-y-5">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 ml-1">Tipo</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setValue('type', 'in')}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                watchType === 'in'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              Receita
            </button>
            <button
              type="button"
              onClick={() => setValue('type', 'out')}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                watchType === 'out'
                  ? 'bg-rose-500 text-white'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              Despesa
            </button>
          </div>
          <input type="hidden" {...register('type')} />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 ml-1">Descrição</label>
          <input
            type="text"
            {...register('desc')}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/30 focus:bg-white outline-none transition-all"
            placeholder="Ex: Pagamento aluguel"
          />
          {errors.desc && <p className="text-rose-400 text-[11px] ml-1">{errors.desc.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 ml-1">Categoria</label>
            <input
              type="text"
              {...register('cat')}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/30 focus:bg-white outline-none transition-all"
              placeholder="Ex: Moradia"
            />
            {errors.cat && <p className="text-rose-400 text-[11px] ml-1">{errors.cat.message}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 ml-1">Data</label>
            <input
              type="date"
              {...register('date')}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/30 focus:bg-white outline-none transition-all"
            />
            {errors.date && <p className="text-rose-400 text-[11px] ml-1">{errors.date.message}</p>}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 ml-1">Valor</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">R$</span>
            <input
              type="number"
              step="0.01"
              {...register('val')}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/30 focus:bg-white outline-none transition-all"
              placeholder="0,00"
            />
          </div>
          {errors.val && <p className="text-rose-400 text-[11px] ml-1">{errors.val.message}</p>}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};
