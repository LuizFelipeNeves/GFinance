export const StatCardSkeleton = () => (
    <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl sm:rounded-[2.5rem] border border-slate-100 shadow-sm animate-pulse">
        <div className="flex justify-between items-start mb-3 sm:mb-4">
            <div className="p-2.5 sm:p-3 bg-slate-100 rounded-xl sm:rounded-2xl">
                <div className="w-5 h-5 bg-slate-200 rounded" />
            </div>
            <div className="w-12 h-6 bg-slate-100 rounded-full" />
        </div>
        <div>
            <div className="w-20 h-3 bg-slate-100 rounded mb-2" />
            <div className="w-32 h-7 bg-slate-100 rounded" />
        </div>
    </div>
);