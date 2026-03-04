export const TransactionRowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="px-4 md:px-8 py-3 md:py-4 align-middle">
      <div className="flex items-center gap-3 md:gap-4">
        <div className="shrink-0 w-8 h-8 md:w-10 md:h-10 bg-slate-100 rounded-xl md:rounded-2xl" />
        <div className="flex flex-col gap-1 min-w-0">
          <div className="w-28 md:w-40 h-3 md:h-4 bg-slate-100 rounded" />
          <div className="w-20 md:w-24 h-2 md:h-3 bg-slate-100 rounded" />
        </div>
      </div>
    </td>
    <td className="hidden md:table-cell px-4 md:px-8 py-3 md:py-4 align-middle text-right">
      <div className="w-16 md:w-20 h-3 md:h-4 bg-slate-100 rounded ml-auto" />
    </td>
    <td className="px-2 md:px-4 py-3 md:py-4 align-middle text-right">
      <div className="flex gap-1 justify-end">
        <div className="w-6 h-6 bg-slate-100 rounded" />
        <div className="w-6 h-6 bg-slate-100 rounded" />
      </div>
    </td>
  </tr>
);
