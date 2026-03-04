export const SummaryChartSkeleton = () => (
    <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[2.5rem] border border-slate-100 shadow-sm h-full flex flex-col animate-pulse">
        <div className="mb-2">
            <div className="w-40 h-5 bg-slate-100 rounded mb-1" />
            <div className="w-16 h-3 bg-slate-100 rounded" />
        </div>
        <div className="relative flex-1 w-full min-h-[200px] sm:min-h-[280px] lg:min-h-[320px] flex items-center justify-center">
            <div className="w-40 h-40 bg-slate-100 rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-x-3 sm:gap-x-4 gap-y-2 mt-2 sm:mt-4 pt-4 sm:pt-6 border-t border-slate-50">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                    <div className="w-16 h-3 bg-slate-100 rounded" />
                </div>
            ))}
        </div>
    </div>
);