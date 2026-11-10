import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { BarChart3, CalendarDays, MapPinned, Wheat } from "lucide-react";
import { getDashboardData, getLookups, getModules, getModuleVariables } from "../services/dashboardService";
import CardProgress from "../components/charts/CardProgress";
import FilterCard from "../components/filters/FilterCard";
import VariableGroupCharts from "../components/charts/VariableGroupCharts";

const tones = { emerald: "text-emerald-700 bg-emerald-100", blue: "text-blue-700 bg-blue-100" };
const padiGroups = [
  { title: "Luas Panen dan Tanam", codes: ["LP_PADI", "LT_PADI", "LT_LLBS"] },
  { title: "Produksi", codes: ["PRD_PADI", "PRD_GKG", "PRD_STR"] },
];

export default function DashboardModul() {
  const { kodeModul } = useParams();
  const [moduleInfo, setModuleInfo] = useState(null);
  const [variables, setVariables] = useState([]);
  const [lookups, setLookups] = useState({ wilayahs: [], periodes: [] });
  const [data, setData] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [selectedYear, setSelectedYear] = useState("");
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([getModules(), getModuleVariables(kodeModul), getLookups()])
      .then(([modules, moduleVariables, lookup]) => {
        if (!active) return;
        setModuleInfo(modules.find((item) => item.kode === kodeModul) || null);
        setVariables(moduleVariables);
        setLookups(lookup);
        setSelectedRegion("All");
        const availableYears = lookup.periodes.map((period) => Number(period.tahun)).filter(Number.isFinite);
        setSelectedYear(availableYears.length ? String(Math.max(...availableYears)) : "");
      })
      .catch(() => { if (active) setError("Data modul tidak dapat dimuat. Pastikan backend berjalan."); });
    return () => { active = false; };
  }, [kodeModul]);

  useEffect(() => {
    if (!selectedYear) return undefined;
    let active = true;
    setLoadingData(true);
    setError("");
    getDashboardData(kodeModul, Number(selectedYear), selectedRegion && selectedRegion !== "All" ? Number(selectedRegion) : undefined)
      .then((rows) => { if (active) setData(rows); })
      .catch(() => { if (active) setError("Data dashboard tidak dapat dimuat."); })
      .finally(() => { if (active) setLoadingData(false); });
    return () => { active = false; };
  }, [kodeModul, selectedYear, selectedRegion]);

  const years = [...new Set(lookups.periodes.map((period) => Number(period.tahun)))].sort((a, b) => b - a);
  const regions = lookups.wilayahs
    .filter((region) => ["provinsi", "kabkot"].includes(region.level_wilayah))
    .map((region) => ({ value: String(region.id), label: region.nama_wilayah }));
  const currentRegionName = regions.find((region) => region.value === selectedRegion)?.label || "Semua Wilayah";

  const latestCards = useMemo(() => {
    const latest = new Map();
    const sorted = [...data].sort((a, b) => Number(b.periode_id) - Number(a.periode_id));
    for (const row of sorted) if (!latest.has(row.variabel_id)) latest.set(row.variabel_id, row);
    return [...latest.values()];
  }, [data]);

  const groups = useMemo(() => {
    if (kodeModul === "PAD") return padiGroups;
    return [{ title: "Perbandingan Variabel", codes: variables.map((variable) => variable.kode) }];
  }, [kodeModul, variables]);

  const theme = moduleInfo?.kode_indikator === "EKO" ? "blue" : "emerald";
  const color = theme === "blue" ? "#2563eb" : "#059669";
  if (!moduleInfo && !error) return <div className="p-10 text-center text-slate-500">Memuat modul…</div>;

  return (
    <div className="space-y-5">
      {error && <div role="alert" className="rounded-2xl bg-amber-50 p-4 text-amber-800">{error}</div>}
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-4">
        <header className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-6 lg:col-span-3">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3"><div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tones[theme]}`}><Wheat size={24}/></div><div><h2 className="text-left text-2xl font-bold text-slate-800 dark:text-slate-100">{moduleInfo?.nama}</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{moduleInfo?.deskripsi}</p></div></div>
            <Link to={`/modul/${kodeModul}/luar-lbs`} className="self-start rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100">Luas Tanam Luar LBS</Link>
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-300"><span className="inline-flex items-center gap-2"><CalendarDays size={16}/>{selectedYear || "—"}</span><span className="inline-flex items-center gap-2"><MapPinned size={16}/>{currentRegionName}</span></div>
        </header>

        <FilterCard
          selectedVariable="All"
          setSelectedVariable={() => {}}
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
          selectedYear={selectedYear}
          setSelectedYear={(year) => setSelectedYear(String(year))}
          regions={regions}
          years={years}
          showVariable={false}
          compact
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {latestCards.map((row) => <CardProgress key={row.variabel_id} title={row.nama} nilaiBps={row.total_bps} nilaiDinas={row.total_dinas} labelPeriode={row.periode_label} tahun={row.tahun} satuan={row.satuan} color={color} icon={BarChart3} moduleCode={kodeModul}/>)}
      </div>

      {loadingData
        ? <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500">Memuat grafik…</div>
        : <div className="space-y-6">{groups.filter((group) => group.codes.some((code) => variables.some((variable) => variable.kode === code))).map((group) => <VariableGroupCharts key={group.title} group={group} data={data} variables={variables}/>)}</div>}
    </div>
  );
}
