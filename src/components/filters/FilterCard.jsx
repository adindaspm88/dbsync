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

}) {
  return (
    <Card className="rounded-3xl border border-sky-100 shadow-sm bg-white">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-sky-100 flex items-center justify-center">
          <Filter
            size={20}
            className="text-sky-700"
          />
        </div>

        <div>
          <h2 className="font-semibold text-left text-slate-800">
            Filter Dashboard
          </h2>

          <p className="text-sm text-left text-slate-500">
            Pilih variabel, wilayah, dan tahun
          </p>
        </div>
      </div>

      {/* FILTER */}
      <div
        className={`grid gap-5 ${
          showVariable
            ? "grid-cols-1 lg:grid-cols-3"
            : "grid-cols-1 lg:grid-cols-2"
        }`}
      >
        {/* VARIABEL */}
        {showVariable && (
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-2">
            <Database
              size={16}
              className="text-sky-700"
            />
            Variabel
          </label>

          <select
            className="
              w-full rounded-2xl border border-sky-100
              bg-white px-4 py-3 text-sm
              text-slate-700
              shadow-sm
              focus:border-sky-400
              focus:ring-4 focus:ring-sky-100
              transition-all
            "
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
          <label className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-2">
            <MapPinned
              size={16}
              className="text-sky-700"
            />
            Wilayah
          </label>

          <select
            className="
              w-full rounded-2xl border border-sky-100
              bg-white px-4 py-3 text-sm
              text-slate-700
              shadow-sm
              focus:border-sky-400
              focus:ring-4 focus:ring-sky-100
              transition-all
            "
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
          <label className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-2">
            <CalendarDays
              size={16}
              className="text-sky-700"
            />
            Tahun
          </label>

          <select
            className="
              w-full rounded-2xl border border-sky-100
              bg-white px-4 py-3 text-sm
              text-slate-700
              shadow-sm
              focus:border-sky-400
              focus:ring-4 focus:ring-sky-100
              transition-all
            "
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
