import { Card } from "flowbite-react";
import {
  Filter,
  MapPinned,
  CalendarDays,
  Database,
} from "lucide-react";

export default function FilterCard({
  selectedVariable,
  setSelectedVariable,

  selectedRegion,
  setSelectedRegion,

  selectedYear,
  setSelectedYear,

  regions = [],
  years = [],

  variables = [],

  showVariable = true,
  compact = false,

}) {
  return (
    <Card className={`rounded-3xl border border-sky-100 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 ${compact ? "!p-3 sm:!p-4" : ""}`}>
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <div className={`flex items-center justify-center rounded-2xl bg-sky-100 ${compact ? "h-9 w-9" : "h-11 w-11"}`}>
          <Filter
            size={compact ? 17 : 20}
            className="text-sky-700"
          />
        </div>

        <div>
          <h2 className="text-left font-semibold text-slate-800 dark:text-slate-100">
            Filter Dashboard
          </h2>

          <p className={`text-left text-slate-500 dark:text-slate-400 ${compact ? "hidden" : "text-sm"}`}>
            Pilih variabel, wilayah, dan tahun
          </p>
        </div>
      </div>

      {/* FILTER */}
      <div
        className={`grid ${compact ? "grid-cols-1 gap-3" : "grid-cols-1 gap-5"} ${
          showVariable ? "lg:grid-cols-3" : compact ? "" : "lg:grid-cols-2"
        }`}
      >
        {/* VARIABEL */}
        {showVariable && (
        <div>
          <label className={`mb-2 flex items-center gap-2 font-medium text-slate-600 dark:text-slate-300 ${compact ? "text-xs" : "text-sm"}`}>
            <Database
              size={16}
              className="text-sky-700"
            />
            Variabel
          </label>

          <select
            className={`
              w-full rounded-xl border border-sky-100
              bg-white px-3 ${compact ? "py-2 text-xs" : "py-2.5 text-sm"}
              text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100
              shadow-sm
              focus:border-sky-400
              focus:ring-4 focus:ring-sky-100
              transition-all
            `}
            value={selectedVariable}
            onChange={(e) =>
              setSelectedVariable(e.target.value)
            }
          >
            <option value="All">
              Semua Variabel
            </option>

            {variables.map((v) => (
              <option
                key={v.kode_variabel}
                value={v.kode_variabel}
              >
                {v.nama_variabel}
              </option>
            ))}
          </select>
        </div>
      )}

        {/* WILAYAH */}
        <div>
          <label className={`mb-2 flex items-center gap-2 font-medium text-slate-600 dark:text-slate-300 ${compact ? "text-xs" : "text-sm"}`}>
            <MapPinned
              size={16}
              className="text-sky-700"
            />
            Wilayah
          </label>

          <select
            className={`
              w-full rounded-xl border border-sky-100
              bg-white px-3 ${compact ? "py-2 text-xs" : "py-2.5 text-sm"}
              text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100
              shadow-sm
              focus:border-sky-400
              focus:ring-4 focus:ring-sky-100
              transition-all
            `}
            value={selectedRegion}
            onChange={(e) =>
              setSelectedRegion(e.target.value)
            }
          >
            <option value="All">
              Semua Wilayah
            </option>

            {regions.map((r) => (
              <option
                key={r.value}
                value={r.value}
              >
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* TAHUN */}
        <div>
          <label className={`mb-2 flex items-center gap-2 font-medium text-slate-600 dark:text-slate-300 ${compact ? "text-xs" : "text-sm"}`}>
            <CalendarDays
              size={16}
              className="text-sky-700"
            />
            Tahun
          </label>

          <select
            className={`
              w-full rounded-xl border border-sky-100
              bg-white px-3 ${compact ? "py-2 text-xs" : "py-2.5 text-sm"}
              text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100
              shadow-sm
              focus:border-sky-400
              focus:ring-4 focus:ring-sky-100
              transition-all
            `}
            value={selectedYear}
            onChange={(e) =>
              setSelectedYear(
                Number(e.target.value)
              )
            }
          >
            {years.map((year) => (
              <option
                key={year}
                value={year}
              >
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Card>
  );
}
