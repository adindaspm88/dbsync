import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { BarChart3, CalendarDays, MapPinned, Wheat } from "lucide-react";
import { getDashboardData, getLookups, getModules, getModuleVariables } from "../services/dashboardService";
import CardProgress from "../components/charts/CardProgress";
import FilterCard from "../components/filters/FilterCard";
import LineChart from "../components/charts/LineChart";
import BarChartCard from "../components/charts/BarChartCard";

  const tones = { emerald: "text-emerald-700 bg-emerald-100", blue: "text-blue-700 bg-blue-100", amber: "text-amber-700 bg-amber-100" };
export default function DashboardModul() {
  const { kodeModul } = useParams();
  const [moduleInfo, setModuleInfo] = useState(null);
  const [variables, setVariables] = useState([]);
  const [lookups, setLookups] = useState({ wilayahs: [], periodes: [] });
  const [data, setData] = useState([]);
  const [selectedVariable, setSelectedVariable] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getModules(), getModuleVariables(kodeModul), getLookups()]).then(([mods, vars, lookup]) => {
      setModuleInfo(mods.find((item) => item.kode === kodeModul));
      setVariables(vars);
      setLookups(lookup);
      setSelectedVariable((current) => current || String(vars[0]?.id || ""));
      setSelectedRegion((current) => current || "All");
      setSelectedYear((current) => current || String(Math.max(...lookup.periodes.map((p) => Number(p.tahun)))));
    }).catch(() => setError("Data modul tidak dapat dimuat. Pastikan backend berjalan."));
  }, [kodeModul]);

  useEffect(() => {
    if (!selectedYear) return;
    getDashboardData(kodeModul, Number(selectedYear), selectedRegion && selectedRegion !== "All" ? Number(selectedRegion) : undefined).then(setData).catch(() => setError("Data dashboard tidak dapat dimuat."));
  }, [kodeModul, selectedYear, selectedRegion]);

  const years = [...new Set(lookups.periodes.map((p) => Number(p.tahun)))].sort((a,b) => b-a);
  const regions = lookups.wilayahs.filter((w) => ["provinsi", "kabkot"].includes(w.level_wilayah)).map((w) => ({ value: String(w.id), label: w.nama_wilayah }));
  const currentVariable = variables.find((v) => String(v.id) === selectedVariable);
  const currentRegionName = regions.find((r) => r.value === selectedRegion)?.label;
  const latestCards = useMemo(() => {
    const latest = new Map();
    for (const row of data) if (!latest.has(row.variabel_id)) latest.set(row.variabel_id, row);
    return [...latest.values()];
  }, [data]);
  const chartData = useMemo(() => data.filter((row) => String(row.variabel_id) === selectedVariable)
    .sort((a,b) => Number(a.nomor_periode)-Number(b.nomor_periode))
    .map((row) => ({ month: row.periode_label, nilai_bps: Number(row.total_bps), nilai_dinas: Number(row.total_dinas) })), [data, selectedVariable]);
  const bySubround = useMemo(() => {
    const groups = ["Jan-Apr", "Mei-Agu", "Sep-Des"];
    return groups.map((month, i) => {
      const rows = chartData.filter((row) => {
        const source = data.find((d) => String(d.variabel_id) === selectedVariable && d.periode_label === row.month);
        const n = Number(source?.nomor_periode);
        return n >= i*4+1 && n <= i*4+4;
      });
      return { month, nilai_bps: rows.reduce((s,r)=>s+r.nilai_bps,0), nilai_dinas: rows.reduce((s,r)=>s+r.nilai_dinas,0) };
    }).filter((r) => r.nilai_bps || r.nilai_dinas);
  }, [chartData, data, selectedVariable]);
  const theme = moduleInfo?.kode_indikator === "EKO" ? "blue" : "emerald";
  const color = theme === "blue" ? "#2563eb" : "#059669";
  if (!moduleInfo && !error) return <div className="p-10 text-center text-slate-500">Memuat modul…</div>;
  return <div className="space-y-6">
    {error && <div role="alert" className="rounded-2xl bg-amber-50 p-4 text-amber-800">{error}</div>}
    <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3"><div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tones[theme]}`}><Wheat size={24}/></div><div><h2 className="text-2xl font-bold text-left text-slate-800">{moduleInfo?.nama}</h2><p className="mt-1 text-sm text-slate-500">{moduleInfo?.deskripsi}</p></div></div>
        <Link to={`/modul/${kodeModul}/luar-lbs`} className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-100">Luas Tanam Luar LBS</Link>
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600"><span className="inline-flex items-center gap-2"><CalendarDays size={16}/>{selectedYear || "—"}</span><span className="inline-flex items-center gap-2"><MapPinned size={16}/>{currentRegionName || "Pilih wilayah"}</span></div>
    </header>
    <FilterCard selectedVariable={selectedVariable} setSelectedVariable={setSelectedVariable} selectedRegion={selectedRegion} setSelectedRegion={setSelectedRegion} selectedYear={selectedYear} setSelectedYear={(v)=>setSelectedYear(String(v))} regions={regions} years={years} variables={variables.map((v)=>({kode_variabel:String(v.id),nama_variabel:v.nama}))}/>
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      {latestCards.map((row)=><CardProgress key={row.variabel_id} title={row.nama} nilaiBps={row.total_bps} nilaiDinas={row.total_dinas} labelPeriode={row.periode_label} tahun={row.tahun} satuan={row.satuan} color={color} icon={BarChart3} moduleCode={kodeModul} kodeVariabel={row.kode}/>) }
    </div>
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <BarChartCard data={bySubround} title={`Perbandingan ${currentVariable?.nama || "data"}`} subtitle="Rekap per empat bulan" satuan={currentVariable?.satuan || ""}/>
      <LineChart data={chartData} title={`Tren ${currentVariable?.nama || "data"}`} subtitle={`Perbandingan BPS dan Dinas · ${currentRegionName || ""}`} satuan={currentVariable?.satuan || ""} color={theme === "blue" ? "sky" : "emerald"}/>
    </div>
  </div>;
}
