
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Search,
  Sprout,
  Fish,
  Wheat,
  Users,
  Building2,
  BarChart3,
  Leaf,
  Waves,
  Database,
  RefreshCw,
  LayoutGrid,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getModules } from "../services/dashboardService";

// Tema warna dan ikon setiap modul
const moduleConfig = [
  {
    keywords: ["tan", "pertanian", "tanaman"],
    icon: Sprout,
    color: "emerald",
    label: "Pertanian",
  },
  {
    keywords: ["per", "perikanan", "ikan"],
    icon: Fish,
    color: "blue",
    label: "Perikanan",
  },
  {
    keywords: ["hor", "hortikultura"],
    icon: Wheat,
    color: "lime",
    label: "Hortikultura",
  },
  {
    keywords: ["eko", "ekonomi"],
    icon: BarChart3,
    color: "sky",
    label: "Ekonomi",
  },
  {
    keywords: ["sos", "sosial"],
    icon: Users,
    color: "violet",
    label: "Sosial",
  },
  {
    keywords: ["pad", "industri", "perusahaan"],
    icon: Building2,
    color: "orange",
    label: "Industri",
  },
];

const colorThemes = {
  emerald: {
    icon: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white",
    accent: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700",
    glow: "group-hover:border-emerald-200",
  },
  blue: {
    icon: "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
    accent: "bg-blue-500",
    badge: "bg-blue-50 text-blue-700",
    glow: "group-hover:border-blue-200",
  },
  lime: {
    icon: "bg-lime-50 text-lime-700 group-hover:bg-lime-600 group-hover:text-white",
    accent: "bg-lime-500",
    badge: "bg-lime-50 text-lime-700",
    glow: "group-hover:border-lime-200",
  },
  sky: {
    icon: "bg-sky-50 text-sky-600 group-hover:bg-sky-600 group-hover:text-white",
    accent: "bg-sky-500",
    badge: "bg-sky-50 text-sky-700",
    glow: "group-hover:border-sky-200",
  },
  violet: {
    icon: "bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white",
    accent: "bg-violet-500",
    badge: "bg-violet-50 text-violet-700",
    glow: "group-hover:border-violet-200",
  },
  orange: {
    icon: "bg-orange-50 text-orange-600 group-hover:bg-orange-500 group-hover:text-white",
    accent: "bg-orange-500",
    badge: "bg-orange-50 text-orange-700",
    glow: "group-hover:border-orange-200",
  },
  default: {
    icon: "bg-slate-100 text-slate-600 group-hover:bg-blue-600 group-hover:text-white",
    accent: "bg-blue-500",
    badge: "bg-slate-100 text-slate-600",
    glow: "group-hover:border-blue-200",
  },
};

function getModuleMeta(item) {
  const code = String(item.kode_indikator || "").toLowerCase();
  const name = String(item.nama || "").toLowerCase();

  const config = moduleConfig.find((module) =>
    module.keywords.some(
      (keyword) => code === keyword || name.includes(keyword)
    )
  );

  if (!config) {
    return {
      icon: BarChart3,
      color: "default",
      label: "Data Statistik",
    };
  }

  return config;
}

function ModuleHome() {
  const [modules, setModules] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchModules = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getModules();
      setModules(data || []);
    } catch {
      setError("Modul belum dapat dimuat. Silakan coba kembali.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const filteredModules = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) return modules;

    return modules.filter((item) =>
      [
        item.nama,
        item.deskripsi,
        item.kode,
        item.kode_indikator,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    );
  }, [modules, search]);

  return (
    <div className="space-y-8 pb-10">

      {/* HERO SECTION */}
      {/* <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B3675] via-[#1254A4] to-[#1678C8] px-7 py-9 sm:px-10 sm:py-11 shadow-lg shadow-blue-900/10"> */}

        {/* Background decoration */}
        {/* <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full border-[35px] border-white/[0.06]" />
        <div className="absolute -right-5 -bottom-40 h-72 w-72 rounded-full bg-emerald-400/10 blur-2xl" />
        <div className="absolute right-1/3 top-0 h-40 w-40 rounded-full bg-blue-300/10 blur-3xl" />

        <div className="relative z-10 max-w-2xl">

          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-blue-50 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            DINAS BPS SYNCHRONIZE
          </div>

          <h1 className="mt-6 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
            Satu Data,
            <br />
            <span className="text-blue-200">
              Satu Keselarasan.
            </span>
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-7 text-blue-100 sm:text-base">
            Platform integrasi dan perbandingan data Dinas dan BPS
            untuk mewujudkan data yang konsisten, terukur, dan
            dapat dipertanggungjawabkan.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3 text-sm text-blue-100">
            <div className="flex items-center gap-2">
              <Database size={16} />
              <span>Integrasi Data</span>
            </div>

            <span className="text-blue-300/50">•</span>

            <div className="flex items-center gap-2">
              <RefreshCw size={15} />
              <span>Sinkronisasi</span>
            </div>

            <span className="text-blue-300/50">•</span>

            <div className="flex items-center gap-2">
              <BarChart3 size={16} />
              <span>Analisis Statistik</span>
            </div>
          </div>
        </div> */}

        {/* Decorative graphic */}
        {/* <div className="absolute bottom-8 right-12 hidden lg:flex h-36 w-36 items-center justify-center rounded-[2rem] border border-white/15 bg-white/10 shadow-2xl backdrop-blur-md rotate-6">
          <div className="flex items-end gap-2">
            <div className="h-10 w-5 rounded-t-md bg-blue-300" />
            <div className="h-16 w-5 rounded-t-md bg-emerald-400" />
            <div className="h-24 w-5 rounded-t-md bg-orange-400" />
          </div>
        </div>
      </section> */}

      {/* MODULE SECTION HEADER */}
      <section className="space-y-5">

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-600">
              <LayoutGrid size={15} />
              DATA PORTAL
            </div>

            <h2 className="mt-2 text-2xl text-left font-bold tracking-tight text-slate-800">
              Pilih Modul Data
            </h2>

            <p className="mt-1.5 text-sm text-slate-500">
              Pilih sektor untuk mengakses dashboard dan perbandingan data.
            </p>
          </div>

          {!loading && !error && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="font-semibold text-slate-800">
                {modules.length}
              </span>
              Modul tersedia
            </div>
          )}
        </div>

        {/* SEARCH */}
        <div className="relative max-w-md">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari modul, sektor, atau kategori..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
          />
        </div>
      </section>

      {/* ERROR STATE */}
      {error && (
        <div className="flex flex-col gap-3 rounded-2xl border border-orange-100 bg-orange-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-orange-800">
              Terjadi kesalahan
            </p>
            <p className="mt-1 text-sm text-orange-700">
              {error}
            </p>
          </div>

          <button
            onClick={fetchModules}
            className="inline-flex items-center gap-2 self-start rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700"
          >
            <RefreshCw size={15} />
            Coba lagi
          </button>
        </div>
      )}

      {/* LOADING STATE */}
      {loading && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-3xl border border-slate-100 bg-white p-6"
            >
              <div className="h-14 w-14 rounded-2xl bg-slate-100" />
              <div className="mt-6 h-5 w-2/3 rounded bg-slate-100" />
              <div className="mt-3 h-3 w-full rounded bg-slate-100" />
              <div className="mt-2 h-3 w-4/5 rounded bg-slate-100" />
              <div className="mt-7 h-4 w-1/3 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      )}

      {/* MODULE CARDS */}
      {!loading && !error && (
        <>
          {filteredModules.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

              {filteredModules.map((item) => {
                const meta = getModuleMeta(item);
                const Icon = meta.icon;
                const theme = colorThemes[meta.color];

                return (
                  <Link
                    key={item.id}
                    to={`/modul/${item.kode}`}
                    className={`group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60 ${theme.glow}`}
                  >
                    {/* Top accent */}
                    <div
                      className={`absolute left-0 top-0 h-1 w-full ${theme.accent} opacity-70 transition-all duration-300 group-hover:h-1.5`}
                    />

                    <div className="flex items-start justify-between">

                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 ${theme.icon}`}
                      >
                        <Icon size={27} strokeWidth={1.8} />
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${theme.badge}`}
                      >
                        {meta.label}
                      </span>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-lg font-bold text-slate-800 transition-colors group-hover:text-blue-700">
                        {item.nama}
                      </h3>

                      <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-500">
                        {item.deskripsi ||
                          `Dashboard dan perbandingan data ${item.nama}.`}
                      </p>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">

                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
                        Buka modul
                        <ChevronRight
                          size={16}
                          className="transition-transform duration-300 group-hover:translate-x-1"
                        />
                      </span>

                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white">
                        <ArrowUpRight size={17} />
                      </div>
                    </div>
                  </Link>
                );
              })}

            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Search size={27} />
              </div>

              <h3 className="mt-5 font-bold text-slate-800">
                Modul tidak ditemukan
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Coba gunakan kata kunci atau nama sektor lainnya.
              </p>

              <button
                onClick={() => setSearch("")}
                className="mt-5 text-sm font-semibold text-blue-600 hover:text-blue-800"
              >
                Hapus pencarian
              </button>
            </div>
          )}
        </>
      )}

      {/* FOOTER INFO */}
      {!loading && !error && modules.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-400">
            DBSYNC · Dinas BPS Synchronize
          </p>

          <p className="text-xs text-slate-400">
            Mewujudkan Data yang Selaras dan Terpercaya
          </p>
        </div>
      )}
    </div>
  );
}

export default ModuleHome;
