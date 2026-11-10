import { ChevronLeft, ChevronRight } from "lucide-react";

export default function TablePagination({ totalItems, currentPage, pageSize = 10, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const firstItem = totalItems ? (currentPage - 1) * pageSize + 1 : 0;
  const lastItem = Math.min(currentPage * pageSize, totalItems);
  const pages = [...new Set([1, currentPage - 1, currentPage, currentPage + 1, totalPages])]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);

  if (!totalItems) return null;

  return (
    <nav aria-label="Navigasi halaman tabel" className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p className="text-xs text-slate-500 dark:text-slate-400">Menampilkan {firstItem}–{lastItem} dari {totalItems} data</p>
      <div className="flex flex-wrap items-center gap-1.5">
        <button type="button" onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800">
          <ChevronLeft size={14}/>Sebelumnya
        </button>
        {pages.map((page, index) => (
          <span key={page} className="contents">
            {index > 0 && pages[index - 1] !== page - 1 && <span className="px-1 text-slate-400" aria-hidden="true">…</span>}
            <button type="button" onClick={() => onPageChange(page)} aria-current={page === currentPage ? "page" : undefined} className={`min-w-9 rounded-lg border px-3 py-2 text-xs font-semibold ${page === currentPage ? "border-sky-700 bg-sky-700 text-white" : "border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"}`}>
              {page}
            </button>
          </span>
        ))}
        <button type="button" onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800">
          Berikutnya<ChevronRight size={14}/>
        </button>
      </div>
    </nav>
  );
}
