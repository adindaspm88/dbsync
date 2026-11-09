import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getComparisonData, saveDinasValue } from "../services/comparisonService";
import { getLookups, getModules, getModuleVariables } from "../services/dashboardService";
import FilterCard from "../components/filters/FilterCard";
import ComparisonTable from "../components/tables/ComparisonTable";
import ModalInput from "../components/modal/ModalInput";

export default function PerbandinganModul() {
  const { kode_modul } = useParams();
  const [data, setData] = useState([]);
  const [moduleInfo, setModuleInfo] = useState(null);
  const [variables, setVariables] = useState([]);
  const [lookups, setLookups] = useState({ wilayahs: [], periodes: [] });
  const [initializedModule, setInitializedModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [selectedYear, setSelectedYear] = useState("");
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState({ nilai_dinas: "", narasi_dinas: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setInitializedModule(null);
    setLoading(true);
    setError("");
    setData([]);
    setSelectedYear("");

    Promise.all([getModules(), getModuleVariables(kode_modul), getLookups()])
      .then(([modules, moduleVariables, lookup]) => {
        if (!active) return;
        setModuleInfo(modules.find((module) => module.kode === kode_modul) || null);
        setVariables(moduleVariables.map((variable) => ({
          id: variable.id,
          kode_variabel: variable.kode,
          nama_variabel: variable.nama,
          satuan: variable.satuan,
        })));
        setLookups(lookup);
        const availableYears = lookup.periodes.map((period) => Number(period.tahun)).filter(Number.isFinite);
        setSelectedYear(availableYears.length ? String(Math.max(...availableYears)) : "");
        setInitializedModule(kode_modul);
      })
      .catch(() => {
        if (!active) return;
        setError("Informasi modul tidak dapat dimuat.");
        setLoading(false);
      });

    return () => { active = false; };
  }, [kode_modul]);

  const refresh = useCallback(async (year = selectedYear) => {
    setLoading(true);
    setError("");
    try {
      const rows = await getComparisonData(kode_modul, year ? Number(year) : undefined);
      setData(rows);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Data perbandingan tidak dapat dimuat.");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [kode_modul, selectedYear]);

  useEffect(() => {
    if (initializedModule === kode_modul) refresh(selectedYear);
  }, [initializedModule, kode_modul, selectedYear, refresh]);

  const changeYear = (year) => setSelectedYear(String(year));
  const regions = lookups.wilayahs
    .filter((region) => ["provinsi", "kabkot"].includes(region.level_wilayah))
    .map((region) => ({ value: String(region.id), label: region.nama_wilayah }));
  const years = [...new Set(lookups.periodes.map((period) => Number(period.tahun)))].sort((a, b) => b - a);
  const filtered = data.filter((row) => selectedRegion === "All" || String(row.wilayah_id) === selectedRegion);

  const groupedData = useMemo(() => Object.values(filtered.reduce((groups, row) => {
    const key = `${row.wilayah_id}-${row.periode_id}`;
    if (!groups[key]) {
      groups[key] = {
        wilayah_id: row.wilayah_id,
        periode_id: row.periode_id,
        kode_kabupaten: row.kode_kabupaten,
        nama_wilayah: row.nama_wilayah,
        bulan: row.periode_label,
        tahun: row.tahun,
        variabels: {},
      };
    }
    groups[key].variabels[row.kode_variabel] = {
      nilai_bps: row.nilai_bps,
      satuan_bps: row.satuan,
      nilai_dinas: row.nilai_dinas,
      satuan_dinas: row.satuan,
      gap: row.nilai_dinas == null ? null : Number(row.nilai_dinas) - Number(row.nilai_bps || 0),
      narasi: row.narasi_dinas,
      status_verifikasi: row.status_verifikasi,
    };
    return groups;
  }, {})).filter((row) => !search || `${row.nama_wilayah} ${row.bulan} ${row.tahun}`.toLowerCase().includes(search.toLowerCase())), [filtered, search]);

  const openEdit = (row, variable, item) => {
    const source = filtered.find((record) => record.wilayah_id === row.wilayah_id
      && record.periode_id === row.periode_id && record.kode_variabel === variable);
    const variableInfo = variables.find((record) => record.kode_variabel === variable);
    const sourceDetails = source || (variableInfo && row.periode_id && row.wilayah_id ? {
      variabel_id: variableInfo.id,
      periode_id: row.periode_id,
      wilayah_id: row.wilayah_id,
      kode_variabel: variableInfo.kode_variabel,
      satuan: variableInfo.satuan,
    } : null);
    if (!sourceDetails) {
      setError("Rincian data untuk baris ini tidak ditemukan.");
      return;
    }
    setSelected({ source: sourceDetails, variable, isEdit: item?.nilai_dinas != null });
    setFormData({ nilai_dinas: item?.nilai_dinas ?? "", narasi_dinas: item?.narasi ?? "" });
    setOpenModal(true);
  };

  const submit = async () => {
    try {
      await saveDinasValue({
        variabel_id: selected.source.variabel_id,
        periode_id: selected.source.periode_id,
        wilayah_id: selected.source.wilayah_id,
        nilai: Number(formData.nilai_dinas),
        justifikasi: formData.narasi_dinas,
      });
      setOpenModal(false);
      await refresh();
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Data gagal disimpan.");
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-left text-2xl font-bold text-slate-800">Perbandingan {moduleInfo?.nama || "Modul"}</h2>
          <p className="mt-1 text-sm text-slate-600">Perbandingan seluruh variabel modul antara data BPS dan Dinas menurut periode dan wilayah.</p>
        </div>
        <input aria-label="Cari" placeholder="Cari wilayah atau periode…" value={search} onChange={(event) => setSearch(event.target.value)} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 md:w-80" />
      </header>
      {error && <div role="alert" className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900">{error}</div>}
      <FilterCard selectedVariable="All" setSelectedVariable={() => {}} selectedRegion={selectedRegion} setSelectedRegion={setSelectedRegion} selectedYear={selectedYear} setSelectedYear={changeYear} regions={regions} years={years} showVariable={false} />
      {loading
        ? <div className="rounded-3xl border bg-white p-10 text-center text-slate-600">Memuat data perbandingan…</div>
        : <ComparisonTable groupedData={groupedData} variables={variables} moduleInfo={moduleInfo} onEdit={openEdit} />}
      <ModalInput openModal={openModal} setOpenModal={setOpenModal} formData={formData} setFormData={setFormData} onSubmit={submit} isEdit={selected?.isEdit ?? false} />
    </div>
  );
}
