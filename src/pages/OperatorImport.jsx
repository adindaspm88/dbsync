import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { AlertCircle, CheckCircle2, FileSpreadsheet, Upload } from "lucide-react";
import { getCurrentUser } from "../services/adminService";
import { getModules, getModuleVariables } from "../services/dashboardService";
import { importData } from "../services/importService";
import { parseExcelFile } from "../utils/excelParser";

const inputClass = "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

export default function OperatorImport() {
  const [user, setUser] = useState(null);
  const [modules, setModules] = useState([]);
  const [variables, setVariables] = useState([]);
  const [moduleCode, setModuleCode] = useState("");
  const [variableId, setVariableId] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([getCurrentUser(), getModules()]).then(([profile, moduleRows]) => {
      if (!active) return;
      setUser(profile);
      setModules(moduleRows);
      setModuleCode(moduleRows[0]?.kode || "");
    }).catch((requestError) => {
      if (active) setError(requestError.response?.data?.detail || "Informasi operator tidak dapat dimuat.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!moduleCode) return;
    getModuleVariables(moduleCode).then((rows) => {
      setVariables(rows);
      setVariableId((current) => rows.some((row) => String(row.id) === current) ? current : String(rows[0]?.id || ""));
    }).catch((requestError) => setError(requestError.response?.data?.detail || "Variabel modul tidak dapat dimuat."));
  }, [moduleCode]);

  if (loading) return <div className="p-10 text-center text-slate-500">Memuat formulir impor…</div>;
  if (!user || user.role !== "Operator") return <Navigate to={user ? "/" : "/login"} replace />;

  const source = user?.jenis_instansi === "bps" ? "bps" : "dinas";
  const sourceLabel = source === "bps" ? "BPS" : "Dinas";

  const selectFile = async (selectedFile) => {
    setError(""); setNotice(""); setFile(null); setPreview([]);
    if (!selectedFile) return;
    if (!/\.xlsx?$/i.test(selectedFile.name)) {
      setError("Pilih file Excel dengan format .xls atau .xlsx.");
      return;
    }
    try {
      const rows = await parseExcelFile(selectedFile);
      if (!rows.length) throw new Error("File Excel tidak berisi baris data.");
      setFile(selectedFile);
      setPreview(rows.slice(0, 6));
    } catch (parseError) {
      setError(parseError.message || "File Excel tidak dapat dibaca.");
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!file || !variableId) {
      setError("Pilih variabel dan file Excel terlebih dahulu.");
      return;
    }
    setBusy(true); setError(""); setNotice("");
    try {
      const result = await importData(file, source, variableId);
      setNotice(result.message || "Impor data berhasil.");
      setFile(null); setPreview([]);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Impor gagal. Periksa struktur kolom file Excel.");
    } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800"><Upload size={22}/></span><div><h1 className="text-2xl font-bold text-slate-800">Import Data</h1><p className="mt-1 text-sm text-slate-600">Unggah Excel untuk variabel yang dipilih. Data akan masuk ke sumber {sourceLabel} sesuai instansi Anda.</p></div></div>
      </header>

      {error && <div role="alert" className="flex items-start gap-2 rounded-2xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-800"><AlertCircle size={18}/>{error}</div>}
      {notice && <div role="status" className="flex items-start gap-2 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-800"><CheckCircle2 size={18}/>{notice}</div>}

      <form onSubmit={submit} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="space-y-2 text-sm font-semibold text-slate-700">Modul<select required value={moduleCode} onChange={(event) => setModuleCode(event.target.value)} className={inputClass}><option value="">Pilih modul</option>{modules.map((item) => <option key={item.kode} value={item.kode}>{item.nama}</option>)}</select></label>
          <label className="space-y-2 text-sm font-semibold text-slate-700">Variabel<select required value={variableId} onChange={(event) => setVariableId(event.target.value)} className={inputClass}><option value="">Pilih variabel</option>{variables.map((item) => <option key={item.id} value={item.id}>{item.nama} ({item.satuan || "tanpa satuan"})</option>)}</select></label>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-950">
          <p className="font-bold">Sumber tujuan: {sourceLabel}</p>
          <p>Impor operator BPS disimpan ke <code>data_bps</code>; instansi selain BPS disimpan ke <code>data_dinas</code>. Sumber ditentukan otomatis dari instansi akun.</p>
          <p className="mt-2">Kolom periode dapat memakai <code>Tanggal</code> atau <code>Tgl Tanam</code>, atau pasangan <code>Tahun</code> dan <code>Bulan</code>. Kolom nilai: <code>{source === "bps" ? "Nilai BPS" : "Nilai Dinas, Nilai, atau Luas"}</code>. Lokasi dapat memakai kode/nama wilayah; jika kosong, wilayah akun digunakan.</p>
        </div>

        <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center transition hover:border-blue-400 hover:bg-blue-50">
          <FileSpreadsheet size={30} className="text-emerald-700"/>
          <span className="font-semibold text-slate-800">{file ? file.name : "Pilih file Excel untuk diunggah"}</span>
          <span className="text-xs text-slate-500">Format yang didukung: .xls dan .xlsx</span>
          <input type="file" accept=".xls,.xlsx" className="sr-only" onChange={(event) => selectFile(event.target.files?.[0])}/>
        </label>

        {preview.length > 0 && <div className="space-y-2"><h2 className="font-semibold text-slate-800">Pratinjau (maksimal 6 baris)</h2><div className="overflow-x-auto rounded-xl border border-slate-200"><table className="min-w-full text-left text-xs"><thead className="bg-slate-100 text-slate-700"><tr>{Object.keys(preview[0]).map((key) => <th key={key} className="whitespace-nowrap px-3 py-2">{key}</th>)}</tr></thead><tbody>{preview.map((row, index) => <tr key={index} className="border-t border-slate-100">{Object.values(row).map((value, col) => <td key={col} className="whitespace-nowrap px-3 py-2 text-slate-700">{String(value ?? "")}</td>)}</tr>)}</tbody></table></div></div>}

        <div className="flex justify-end"><button type="submit" disabled={!file || !variableId || busy} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"><Upload size={17}/>{busy ? "Mengimpor…" : "Import data"}</button></div>
      </form>
    </div>
  );
}
