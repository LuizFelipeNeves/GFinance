interface PeriodSelectorProps {
    value: string;
    onChange: (value: string) => void;
    isLoading?: boolean;
}

const PERIODS = [
    { value: 'monthly', label: 'Mensal' },
    { value: 'quarterly', label: 'Trimestral' },
    { value: 'yearly', label: 'Anual' },
];

export const PeriodSelector = ({ value, onChange, isLoading }: PeriodSelectorProps) => {
    return (
        <div className={`flex gap-1 bg-slate-100 p-1 rounded-lg transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
            {PERIODS.map((p) => (
                <button
                    key={p.value}
                    onClick={() => onChange(p.value)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                        value === p.value
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    {p.label}
                </button>
            ))}
        </div>
    );
};
