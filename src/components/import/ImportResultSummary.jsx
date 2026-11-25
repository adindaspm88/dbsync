import { AlertTriangle, CheckCircle2, X } from "lucide-react";

const countFormat = new Intl.NumberFormat("id-ID");

export default function ImportResultSummary({ result, onDismiss }) {
  if (!result) return null;

  const imported = Number(result.imported || 0);
  const skipped = Number(result.skipped || 0);
  const partial = skipped > 0;
  const reasons = Object.entries(result.skipped_by_reason || {});
  const skippedRows = result.skipped_rows || [];

  return (
    <section
      role={partial ? "alert" : "status"}
      aria-live="polite"
      className={`rounded-2xl border p-4 shadow-sm ${partial
        ? "border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100"
        : "border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-100"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          {partial ? <AlertTriangle size={19} className="mt-0.5 shrink-0"/> : <CheckCircle2 size={19} className="mt-0.5 shrink-0"/>}
          <div>
            <h2 className="font-bold">{partial ? "Import selesai dengan beberapa baris dilewati" : "Import berhasil"}</h2>
            <p className="mt-1 text-sm opacity-90">{result.message || "Hasil import berhasil diproses."}</p>
          </div>
        </div>
        {onDismiss && <button type="button" onClick={onDismiss} aria-label="Tutup informasi hasil import" className="rounded-lg p-1 opacity-70 transition hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/10"><X size={18}/></button>}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:max-w-sm">
        <div className="rounded-xl bg-white/70 px-3 py-2 dark:bg-slate-900/50">
          <span className="block text-xs opacity-75">Berhasil diproses</span>
          <strong className="text-lg">{countFormat.format(imported)}</strong>
        </div>
        <div className="rounded-xl bg-white/70 px-3 py-2 dark:bg-slate-900/50">
          <span className="block text-xs opacity-75">Dilewati</span>
          <strong className="text-lg">{countFormat.format(skipped)}</strong>
        </div>
      </div>

      {skipped > 0 && <div className="mt-4 space-y-3">
        {reasons.length > 0 && <div>
          <h3 className="text-sm font-bold">Alasan baris dilewati</h3>
          <ul className="mt-1 list-inside list-disc space-y-1 text-sm">
            {reasons.map(([reason, count]) => <li key={reason}><strong>{countFormat.format(count)} baris:</strong> {reason}</li>)}
          </ul>
        </div>}

        {skippedRows.length > 0 && <div>
          <h3 className="text-sm font-bold">Rincian baris Excel</h3>
          <ul className="mt-1 max-h-48 space-y-1 overflow-y-auto rounded-xl bg-white/70 p-3 text-sm dark:bg-slate-900/50">
            {skippedRows.map((item, index) => <li key={`${item.row}-${index}`}><strong>Baris {item.row}:</strong> {item.reason}</li>)}
          </ul>
          {result.skipped_details_truncated && <p className="mt-1 text-xs opacity-80">Rincian dibatasi sampai {countFormat.format(skippedRows.length)} baris; jumlah seluruh baris per alasan tetap ditampilkan di atas.</p>}
        </div>}
      </div>}
    </section>
  );
}
