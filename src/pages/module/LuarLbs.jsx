import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPinned, Wheat } from "lucide-react";
import LuarLbsTable from "../../components/tables/LuarLbsTable";
import ModalPreviewExcel from "../../components/modal/ModalPreviewExcel";
import ModalInputLuarLbs from "../../components/modal/ModalInputLuarLbs";
import MapLocationModal from "../../components/modal/MapLocationModal";
import { parseExcelFile } from "../../utils/excelParser";
import { getLookups, getModuleVariables } from "../../services/dashboardService";
import { getLuarLbsData, importLuarLbs, saveLuarLbs } from "../../services/luarLbsService";

const blank = { wilayah_id:"", nilai_dinas:"", kelompok:"", latitude:"", longitude:"", periode_id:"", polygon:"", foto_fase:"" };
export default function LuarLbsPage() {
  const { kodeModul }=useParams();
  const [data,setData]=useState([]); const [lookups,setLookups]=useState({wilayahs:[],periodes:[]});
  const [variable,setVariable]=useState(null); const [selectedKecamatan,setSelectedKecamatan]=useState("");
  const [showImport,setShowImport]=useState(false); const [showForm,setShowForm]=useState(false); const [selectedLocation,setSelectedLocation]=useState(null); const [previewData,setPreviewData]=useState([]); const [selectedFile,setSelectedFile]=useState(null); const [form,setForm]=useState(blank); const [busy,setBusy]=useState(false); const [error,setError]=useState("");
  const fileInputRef=useRef(null);
  const refresh=async()=>{try{setData(await getLuarLbsData(kodeModul));}catch{setError("Data Luar LBS tidak dapat dimuat.");}};
  useEffect(()=>{Promise.all([getLookups(),getModuleVariables(kodeModul),getLuarLbsData(kodeModul)]).then(([lookup,vars,rows])=>{setLookups(lookup);setVariable(vars.find(v=>["LT_LLBS","L_LBS"].includes(v.kode)));setData(rows);}).catch(()=>setError("Informasi modul atau data Luar LBS tidak dapat dimuat."));},[kodeModul]);
  const kecamatanList=[...new Set(data.map(d=>d.kecamatan).filter(Boolean))];
  const filteredData=selectedKecamatan?data.filter(d=>d.kecamatan===selectedKecamatan):data;
  const handleFileChange=async(e)=>{const file=e.target.files?.[0];if(!file)return;try{setPreviewData(await parseExcelFile(file));setSelectedFile(file);setShowImport(true);}catch{setError("File Excel tidak dapat dibaca.");}e.target.value="";};
  const handleSaveImport=async()=>{if(!selectedFile||!variable)return;setBusy(true);try{await importLuarLbs(selectedFile,variable.id);setShowImport(false);setSelectedFile(null);setPreviewData([]);await refresh();}catch(e){setError(e.response?.data?.detail||"Import gagal. Periksa format kolom Excel.");}finally{setBusy(false);}};
  const handleSaveForm=async()=>{if(!variable||!form.wilayah_id||!form.periode_id){setError("Pilih wilayah dan periode terlebih dahulu.");return;}setBusy(true);try{await saveLuarLbs({variabel_id:variable.id,periode_id:Number(form.periode_id),wilayah_id:Number(form.wilayah_id),nilai:Number(form.nilai_dinas),nama_kelompok:form.kelompok||null,latitude:form.latitude?Number(form.latitude):null,longitude:form.longitude?Number(form.longitude):null,foto_fase:form.foto_fase||null,foto_polygon:form.polygon||null});setShowForm(false);setForm(blank);await refresh();}catch(e){setError(e.response?.data?.detail||"Data gagal disimpan.");}finally{setBusy(false);}};
  return <div className="space-y-6">
    <header className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm"><div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between"><div className="flex items-center gap-4"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100"><Wheat size={28} className="text-emerald-700"/></div><div><h2 className="text-xl font-bold text-slate-800">Data Luar LBS</h2><p className="mt-1 text-sm text-slate-500">Monitoring lokasi tanam di luar wilayah LBS</p></div></div><div className="flex flex-wrap items-center gap-3"><Link to={`/modul/${kodeModul}`} className="inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm text-slate-600"><ArrowLeft size={16}/> Dashboard</Link><div className="relative"><MapPinned size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/><select value={selectedKecamatan} onChange={e=>setSelectedKecamatan(e.target.value)} className="min-w-[220px] rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm"><option value="">Semua Kecamatan</option>{kecamatanList.map(k=><option key={k}>{k}</option>)}</select></div></div></div></header>
    {error&&<div role="alert" className="rounded-2xl bg-amber-50 p-4 text-amber-800">{error}</div>}
    <LuarLbsTable data={filteredData} onImport={()=>fileInputRef.current?.click()} onAdd={()=>{setError("");setShowForm(true);}} onViewLocation={setSelectedLocation}/>
    <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileChange}/>
    <ModalPreviewExcel open={showImport} onClose={()=>setShowImport(false)} data={previewData} onSave={handleSaveImport} loading={busy}/>
    <ModalInputLuarLbs open={showForm} onClose={()=>{setShowForm(false);setForm(blank);}} form={form} setForm={setForm} onSave={handleSaveForm} wilayahs={lookups.wilayahs} periodes={lookups.periodes} />
    <MapLocationModal item={selectedLocation} onClose={()=>setSelectedLocation(null)} />
  </div>;
}
