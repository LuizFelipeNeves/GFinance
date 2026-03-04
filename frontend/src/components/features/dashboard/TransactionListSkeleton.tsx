export const TransactionListSkeleton = () => (
    <div className="bg-white rounded-2xl sm:rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
        <div className="p-4 sm:p-6 border-b border-slate-50 flex justify-between items-center">
            <div className="w-32 h-5 bg-slate-100 rounded" />
            <div className="w-16 h-3 bg-slate-100 rounded" />
        </div>
        <div className="divide-y divide-slate-50">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="px-4 sm:px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-xl" />
                        <div>
                            <div className="w-32 h-4 bg-slate-100 rounded mb-1" />
                            <div className="w-24 h-3 bg-slate-100 rounded" />
                        </div>
                    </div>
                    <div className="w-16 h-4 bg-slate-100 rounded" />
                </div>
            ))}
        </div>
    </div>
);