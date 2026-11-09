import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getComparisonData, saveDinasValue } from "../services/comparisonService";
import { getLookups, getModules } from "../services/dashboardService";
import FilterCard from "../components/filters/FilterCard";
import ComparisonTable from "../components/tables/ComparisonTable";
import ModalInput from "../components/modal/ModalInput";

export default function PerbandinganModul() {
  const { kode_modul, kode_variabel } = useParams();
  const [data, setData] = useState([]);
  const [moduleInfo, setModuleInfo] = useState(null);
  const [lookups, setLookups] = useState({wilayahs:[],periodes:[]});
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [selectedYear, setSelectedYear] = useState("");
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState({nilai_dinas:"",narasi_dinas:""});
  const [error, setError] = useState("");

  const refresh = async (year = selectedYear) => {
    setLoading(true);
    try { setData(await getComparisonData(kode_modul, year ? Number(year) : undefined)); }
    catch { setError("Data perbandingan tidak dapat dimuat."); }
    finally { setLoading(false); }
  };
  useEffect(() => {
    Promise.all([getModules(), getLookups()]).then(([mods, lookup])=>{
      setModuleInfo(mods.find((m)=>m.kode===kode_modul)); setLookups(lookup);
      const y=String(Math.max(...lookup.periodes.map(p=>Number(p.tahun)))); setSelectedYear(y);
    }).catch(()=>setError("Informasi modul tidak dapat dimuat."));
  },[kode_modul]);
  const changeYear=(year)=>{setSelectedYear(year);refresh(year);};
  const regions=lookups.wilayahs.filter(w=>["provinsi","kabkot"].includes(w.level_wilayah)).map(w=>({value:String(w.id),label:w.nama_wilayah}));
  const years=[...new Set(lookups.periodes.map(p=>Number(p.tahun)))].sort((a,b)=>b-a);
  const variables=useMemo(()=>[...new Map(data.map(r=>[r.kode_variabel,{kode_variabel:r.kode_variabel,nama_variabel:r.nama_variabel}])).values()], [data]);
  const filtered=data.filter(r=>(selectedRegion==="All"||String(r.wilayah_id)===selectedRegion)&&(!kode_variabel||r.kode_variabel===kode_variabel));
  const groupedData=useMemo(()=>Object.values(filtered.reduce((acc,row)=>{
    const key=`${row.wilayah_id}-${row.periode_id}`;
    if(!acc[key]) acc[key]={kode_kabupaten:row.kode_kabupaten,nama_wilayah:row.nama_wilayah,bulan:row.periode_label,tahun:row.tahun,variabels:{}};
    acc[key].variabels[row.kode_variabel]={nilai_bps:row.nilai_bps,satuan_bps:row.satuan,nilai_dinas:row.nilai_dinas,satuan_dinas:row.satuan,gap:row.nilai_dinas==null?null:Number(row.nilai_dinas)-Number(row.nilai_bps||0),narasi:row.narasi_dinas, status_verifikasi:row.status_verifikasi};
    return acc;
  },{})).filter(row=>!search||`${row.nama_wilayah} ${row.bulan} ${row.tahun}`.toLowerCase().includes(search.toLowerCase())),[filtered,search]);

  const openEdit=(row,variable,item)=>{
    const source=filtered.find(r=>r.wilayah_id===row.wilayah_id&&r.periode_label===row.bulan&&r.kode_variabel===variable);
    if(!source){setError("Rincian data untuk baris ini tidak ditemukan.");return;}
    setSelected({source,variable}); setFormData({nilai_dinas:item?.nilai_dinas??"",narasi_dinas:item?.narasi??""}); setOpenModal(true);
  };
  const submit=async()=>{
    try {
      await saveDinasValue({variabel_id:selected.source.variabel_id,periode_id:selected.source.periode_id,wilayah_id:selected.source.wilayah_id,nilai:Number(formData.nilai_dinas),justifikasi:formData.narasi_dinas});
      setOpenModal(false); await refresh();
    } catch(e) { setError(e.response?.data?.detail||"Data gagal disimpan."); }
  };
  return <div className="space-y-6">
    <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><h2 className="text-2xl text-left font-bold text-slate-800">Perbandingan {moduleInfo?.nama||"Modul"}</h2><p className="mt-1 text-sm text-slate-500">Perbandingan data BPS dan Dinas menurut variabel, periode, dan wilayah.</p></div><input aria-label="Cari" placeholder="Cari wilayah atau periode…" value={search} onChange={e=>setSearch(e.target.value)} className="w-full md:w-80 rounded-2xl border border-slate-200 px-4 py-3 text-sm"/></header>
    {error&&<div role="alert" className="rounded-2xl bg-amber-50 p-4 text-amber-800">{error}</div>}
    <FilterCard selectedVariable="All" setSelectedVariable={()=>{}} selectedRegion={selectedRegion} setSelectedRegion={setSelectedRegion} selectedYear={selectedYear} setSelectedYear={changeYear} regions={regions} years={years} showVariable={false}/>
    {loading?<div className="rounded-3xl border bg-white p-10 text-center text-slate-500">Memuat data perbandingan…</div>:<ComparisonTable groupedData={groupedData} variables={variables} onEdit={openEdit}/>}
    <ModalInput openModal={openModal} setOpenModal={setOpenModal} formData={formData} setFormData={setFormData} onSubmit={submit} isEdit={!!selected?.source.nilai_dinas}/>
  </div>;
}
