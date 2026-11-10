import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, Database, Pencil, Plus, ShieldCheck, Users, X } from "lucide-react";
import TablePagination from "../components/tables/TablePagination";
import {
  createAdminUser, createMasterRow, getAdminOptions, getAdminUsers,
  getCurrentUser, getMasterRows, setAdminUserActive, updateAdminUser, updateMasterRow,
} from "../services/adminService";

const masterConfigs = {
  indikator: { title: "Master Indikator", columns: ["kode", "nama", "deskripsi", "is_active"], fields: [
    ["kode", "Kode", "text", true], ["nama", "Nama indikator", "text", true], ["deskripsi", "Deskripsi", "textarea", true], ["is_active", "Status aktif", "checkbox"],
  ] },
  instansi: { title: "Master Instansi", columns: ["kode_instansi", "nama_instansi", "jenis_instansi", "wilayah_id", "is_active"], fields: [
    ["kode_instansi", "Kode instansi", "text", true], ["nama_instansi", "Nama instansi", "text", true], ["jenis_instansi", "Jenis instansi", "select", true, [["bps", "BPS"], ["dinas", "Dinas"]]], ["wilayah_id", "Wilayah", "wilayah_instansi", true], ["is_active", "Status aktif", "checkbox"],
  ] },
  modul: { title: "Master Modul", columns: ["indikator_id", "kode", "nama", "deskripsi", "is_active"], fields: [
    ["indikator_id", "Indikator", "indikator", true], ["kode", "Kode", "text", true], ["nama", "Nama modul", "text", true], ["deskripsi", "Deskripsi", "textarea", true], ["is_active", "Status aktif", "checkbox"],
  ] },
  variabel: { title: "Master Variabel", columns: ["modul_id", "kode", "nama", "satuan", "deskripsi", "is_active"], fields: [
    ["modul_id", "Modul", "modul", true], ["kode", "Kode", "text", true], ["nama", "Nama variabel", "text", true], ["satuan", "Satuan", "text"], ["deskripsi", "Deskripsi", "textarea"], ["is_active", "Status aktif", "checkbox"],
  ] },
  wilayah: { title: "Master Wilayah", columns: ["kode_wilayah", "nama_wilayah", "level_wilayah", "parent_id"], fields: [
    ["kode_wilayah", "Kode wilayah", "text", true], ["nama_wilayah", "Nama wilayah", "text", true], ["level_wilayah", "Tingkat wilayah", "select", true, [["provinsi", "Provinsi"], ["kabkot", "Kabupaten/Kota"], ["kecamatan", "Kecamatan"], ["deskel", "Desa/Kelurahan"]]], ["parent_id", "Wilayah induk", "wilayah_parent"],
  ] },
};

const emptyUser = { nama: "", email: "", password: "", role_id: "", instansi_id: "", wilayah_id: "" };
const inputClass = "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-400";

function optionRows(type, options, form) {
  if (type === "indikator") return options.indikator || [];
  if (type === "modul") return options.modul || [];
  if (type === "wilayah_instansi") return (options.wilayah || []).filter((area) => ["provinsi", "kabkot"].includes(area.level_wilayah));
  if (type === "wilayah_parent") {
    const parentLevel = { kabkot: "provinsi", kecamatan: "kabkot", deskel: "kecamatan" }[form.level_wilayah];
    return (options.wilayah || []).filter((area) => area.level_wilayah === parentLevel);
  }
  return [];
}

function fieldOptions(type, options, form) {
  if (type === "indikator") return optionRows(type, options).map((row) => [row.id, `${row.kode} · ${row.nama}`]);
  if (type === "modul") return optionRows(type, options).map((row) => [row.id, `${row.kode} · ${row.nama}`]);
  if (type === "wilayah_instansi" || type === "wilayah_parent") return optionRows(type, options, form).map((row) => [row.id, `${row.kode_wilayah} · ${row.nama_wilayah}`]);
  return [];
}

export default function AdminManagement() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authorized, setAuthorized] = useState(false);
  const [section, setSection] = useState("users");
  const [masterName, setMasterName] = useState("indikator");
  const [options, setOptions] = useState({ roles: [], instansi: [], wilayah: [], indikator: [], modul: [] });
  const [users, setUsers] = useState([]);
  const [masterRows, setMasterRows] = useState([]);
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyUser);
  const [search, setSearch] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [masterPage, setMasterPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadUsers = async () => setUsers(await getAdminUsers());
  const loadMaster = async (name = masterName) => setMasterRows(await getMasterRows(name));

  useEffect(() => {
    let active = true;
    Promise.all([getCurrentUser(), getAdminOptions()]).then(([user, adminOptions]) => {
      if (!active) return;
      setCurrentUser(user);
      const isSuperAdmin = user.role === "Super Admin";
      const canManageUsers = isSuperAdmin || user.role === "Admin Wilayah";
      setAuthorized(canManageUsers);
      setOptions((old) => ({ ...old, ...adminOptions }));
      if (canManageUsers) {
        const loads = isSuperAdmin
          ? Promise.all([getAdminUsers(), getMasterRows("indikator")])
          : getAdminUsers().then((userRows) => [userRows, []]);
        return loads.then(([userRows, indicatorRows]) => {
          if (active) { setUsers(userRows); setMasterRows(indicatorRows); }
        });
      }
      return undefined;
    }).catch((requestError) => {
      if (active) setError(requestError.response?.data?.detail || "Data manajemen tidak dapat dimuat.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const isSuperAdmin = currentUser?.role === "Super Admin";

  useEffect(() => {
    if (isSuperAdmin && section === "masters") {
      setLoading(true);
      loadMaster(masterName).catch((requestError) => setError(requestError.response?.data?.detail || "Data master tidak dapat dimuat.")).finally(() => setLoading(false));
    }
  }, [isSuperAdmin, section, masterName]);

  useEffect(() => {
    if (isSuperAdmin && section === "masters") {
      Promise.all([getMasterRows("indikator"), getMasterRows("modul")]).then(([indikator, modul]) => setOptions((old) => ({ ...old, indikator, modul }))).catch(() => {});
    }
  }, [isSuperAdmin, section, masterName]);

  const visibleUsers = useMemo(() => users.filter((user) => `${user.nama} ${user.email} ${user.role} ${user.nama_instansi || ""} ${user.nama_wilayah || ""}`.toLowerCase().includes(search.toLowerCase())), [users, search]);
  const visibleMasters = useMemo(() => masterRows.filter((row) => Object.values(row).join(" ").toLowerCase().includes(search.toLowerCase())), [masterRows, search]);
  const pageSize = 10;
  const paginatedUsers = useMemo(() => visibleUsers.slice((userPage - 1) * pageSize, userPage * pageSize), [visibleUsers, userPage]);
  const paginatedMasters = useMemo(() => visibleMasters.slice((masterPage - 1) * pageSize, masterPage * pageSize), [visibleMasters, masterPage]);
  useEffect(() => { setUserPage(1); }, [search, section]);
  useEffect(() => { setMasterPage(1); }, [search, masterName]);
  useEffect(() => { setUserPage((page) => Math.min(page, Math.max(1, Math.ceil(visibleUsers.length / pageSize)))); }, [visibleUsers.length]);
  useEffect(() => { setMasterPage((page) => Math.min(page, Math.max(1, Math.ceil(visibleMasters.length / pageSize)))); }, [visibleMasters.length]);
  const config = masterConfigs[masterName];

  if (loading && !currentUser) return <div className="p-10 text-center text-slate-500">Memuat manajemen…</div>;
  if (!loading && !authorized) return <Navigate to="/" replace />;

  const beginUserEdit = (user) => {
    setEditing(user.id);
    setFormOpen(true);
    setForm({ nama: user.nama, email: user.email, password: "", role_id: String(user.role_id), instansi_id: user.instansi_id ? String(user.instansi_id) : "", wilayah_id: user.wilayah_id ? String(user.wilayah_id) : "" });
    setNotice("");
  };

  const beginMasterEdit = (row) => {
    setEditing(row.id);
    setFormOpen(true);
    setForm(Object.fromEntries(config.fields.map(([name, , type]) => [name, type === "checkbox" ? Boolean(row[name]) : row[name] == null ? "" : String(row[name])] )));
    setNotice("");
  };

  const beginCreate = () => {
    setEditing(null);
    setFormOpen(true);
    setForm(section === "users" ? { ...emptyUser, role_id: String(options.roles[0]?.id || "") } : Object.fromEntries(config.fields.map(([name, , type]) => [name, type === "checkbox" ? true : ""])));
    setNotice("");
  };

  const saveUser = async (event) => {
    event.preventDefault(); setError(""); setNotice("");
    const payload = { ...form, role_id: Number(form.role_id), instansi_id: form.instansi_id ? Number(form.instansi_id) : null, wilayah_id: form.wilayah_id ? Number(form.wilayah_id) : null };
    if (!payload.password) delete payload.password;
    try {
      if (editing) await updateAdminUser(editing, payload);
      else await createAdminUser(payload);
      await loadUsers(); setEditing(null); setFormOpen(false); setNotice(editing ? "Data pengguna diperbarui." : "Pengguna berhasil ditambahkan.");
    } catch (requestError) { setError(requestError.response?.data?.detail || "Pengguna gagal disimpan."); }
  };

  const saveMaster = async (event) => {
    event.preventDefault(); setError(""); setNotice("");
    const payload = Object.fromEntries(config.fields.map(([name, , type]) => [name, type === "checkbox" ? Number(Boolean(form[name])) : ["indikator", "modul", "wilayah_instansi", "wilayah_parent"].includes(type) || ["modul_id", "indikator_id", "wilayah_id", "parent_id"].includes(name) ? (form[name] ? Number(form[name]) : null) : form[name]]).filter(([name]) => name in form));
    try {
      if (editing) await updateMasterRow(masterName, editing, payload);
      else await createMasterRow(masterName, payload);
      await loadMaster(); setEditing(null); setFormOpen(false); setNotice(editing ? "Data master diperbarui." : "Data master ditambahkan.");
    } catch (requestError) { setError(requestError.response?.data?.detail || "Data master gagal disimpan."); }
  };

  const toggleUser = async (user) => {
    setError(""); setNotice("");
    try { await setAdminUserActive(user.id, !user.is_active); await loadUsers(); setNotice(`Pengguna ${user.is_active ? "dinonaktifkan" : "diaktifkan"}.`); }
    catch (requestError) { setError(requestError.response?.data?.detail || "Status pengguna gagal diperbarui."); }
  };

  const toggleMaster = async (row) => {
    setError(""); setNotice("");
    try { await updateMasterRow(masterName, row.id, { is_active: row.is_active ? 0 : 1 }); await loadMaster(); setNotice("Status master diperbarui."); }
    catch (requestError) { setError(requestError.response?.data?.detail || "Status master gagal diperbarui."); }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold text-slate-800">Manajemen Sistem</h1><p className="mt-1 text-sm text-slate-600">Kelola akun pengguna dan data master aplikasi.</p></div>
        <Link to="/" className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"><ArrowLeft size={16}/>Kembali</Link>
      </header>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => { setSection("users"); setEditing(null); setFormOpen(false); setSearch(""); setError(""); }} className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${section === "users" ? "bg-blue-700 text-white" : "border border-slate-200 bg-white text-slate-700"}`}><Users size={17}/>Manajemen Pengguna</button>
        {isSuperAdmin && <button type="button" onClick={() => { setSection("masters"); setEditing(null); setFormOpen(false); setSearch(""); setError(""); }} className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${section === "masters" ? "bg-blue-700 text-white" : "border border-slate-200 bg-white text-slate-700"}`}><Database size={17}/>Manajemen Master</button>}
      </div>

      {error && <div role="alert" className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>}
      {notice && <div role="status" className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</div>}

      {section === "users" ? (
        <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-bold text-slate-800">Pengguna</h2><p className="mt-1 text-sm text-slate-600">Tambah akun, ubah role, dan aktifkan atau nonaktifkan akses.</p></div><button type="button" onClick={beginCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"><Plus size={17}/>Tambah pengguna</button></div>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama, email, role, instansi…" className={inputClass}/>
          {formOpen ? (
            <form onSubmit={saveUser} className="grid gap-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 md:grid-cols-2 dark:border-slate-600 dark:bg-slate-800">
              <label className="space-y-1.5 text-sm font-semibold text-slate-700">Nama<input required value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} className={inputClass}/></label>
              <label className="space-y-1.5 text-sm font-semibold text-slate-700">Email<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass}/></label>
              <label className="space-y-1.5 text-sm font-semibold text-slate-700">{editing ? "Password baru (opsional)" : "Password"}<input required={!editing} minLength={8} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputClass} placeholder={editing ? "Kosongkan jika tidak diubah" : "Minimal 8 karakter"}/></label>
              <label className="space-y-1.5 text-sm font-semibold text-slate-700">Role<select required value={form.role_id} onChange={(e) => setForm({ ...form, role_id: e.target.value })} className={inputClass} disabled={!isSuperAdmin}><option value="">Pilih role</option>{options.roles.map((role) => <option key={role.id} value={role.id}>{role.nama_role}</option>)}</select></label>
              {isSuperAdmin && <label className="space-y-1.5 text-sm font-semibold text-slate-700">Instansi (opsional)<select value={form.instansi_id} onChange={(e) => setForm({ ...form, instansi_id: e.target.value })} className={inputClass}><option value="">Tidak ditentukan</option>{options.instansi.map((item) => <option key={item.id} value={item.id}>{item.nama_instansi}</option>)}</select></label>}
              {isSuperAdmin && <label className="space-y-1.5 text-sm font-semibold text-slate-700">Wilayah (opsional)<select value={form.wilayah_id} onChange={(e) => setForm({ ...form, wilayah_id: e.target.value })} className={inputClass}><option value="">Tidak ditentukan</option>{options.wilayah.filter((area) => ["provinsi", "kabkot"].includes(area.level_wilayah)).map((area) => <option key={area.id} value={area.id}>{area.kode_wilayah} · {area.nama_wilayah}</option>)}</select></label>}
              <div className="flex gap-3 md:col-span-2"><button className="rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white">{editing ? "Simpan perubahan" : "Buat pengguna"}</button><button type="button" onClick={() => { setEditing(null); setForm(emptyUser); setFormOpen(false); }} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700"><X size={16}/>Batal</button></div>
            </form>
          ) : null}
          <div className="max-h-[65vh] overflow-auto rounded-2xl border border-slate-200"><table className="min-w-full text-left text-sm"><thead className="sticky top-0 z-10 bg-slate-100 text-slate-700"><tr>{["Pengguna", "Role", "Instansi / Wilayah", "Status", "Aksi"].map((title) => <th key={title} className="px-4 py-3 font-semibold">{title}</th>)}</tr></thead><tbody>{paginatedUsers.map((user) => <tr key={user.id} className="border-t border-slate-100"><td className="px-4 py-3"><span className="block font-semibold text-slate-800">{user.nama}</span><span className="text-xs text-slate-500">{user.email}</span></td><td className="px-4 py-3"><span className="inline-flex items-center gap-1.5"><ShieldCheck size={15}/>{user.role}</span></td><td className="px-4 py-3 text-slate-600">{user.nama_instansi || "—"}<span className="block text-xs text-slate-500">{user.nama_wilayah || "—"}</span></td><td className="px-4 py-3"><span className={user.is_active ? "rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800" : "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"}>{user.is_active ? "Aktif" : "Nonaktif"}</span></td><td className="space-x-2 whitespace-nowrap px-4 py-3"><button type="button" onClick={() => beginUserEdit(user)} className="rounded-lg p-2 text-blue-700 hover:bg-blue-50" aria-label={`Edit ${user.nama}`}><Pencil size={16}/></button><button type="button" onClick={() => toggleUser(user)} className={`rounded-lg px-3 py-2 text-xs font-semibold ${user.is_active ? "text-rose-700 hover:bg-rose-50" : "text-emerald-700 hover:bg-emerald-50"}`}>{user.is_active ? "Nonaktifkan" : "Aktifkan"}</button></td></tr>)}</tbody></table>{visibleUsers.length === 0 && <p className="p-8 text-center text-sm text-slate-500">Tidak ada pengguna ditemukan.</p>}</div><TablePagination totalItems={visibleUsers.length} currentPage={userPage} pageSize={pageSize} onPageChange={setUserPage}/>
        </section>
      ) : (
        <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-bold text-slate-800">{config.title}</h2><p className="mt-1 text-sm text-slate-600">Tambah dan perbarui data master sistem.</p></div><div className="flex flex-wrap gap-2"><select value={masterName} onChange={(e) => { setMasterName(e.target.value); setEditing(null); setForm({}); setFormOpen(false); }} className={`${inputClass} min-w-48`}>{Object.entries(masterConfigs).map(([key, item]) => <option key={key} value={key}>{item.title}</option>)}</select><button type="button" onClick={beginCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"><Plus size={17}/>Tambah</button></div></div>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari data master…" className={inputClass}/>
          {formOpen ? (
            <form onSubmit={saveMaster} className="grid gap-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 md:grid-cols-2 dark:border-slate-600 dark:bg-slate-800">
              {config.fields.map(([name, label, type, required, choices]) => {
                if (type === "checkbox") return <label key={name} className="flex items-center gap-3 self-center text-sm font-semibold text-slate-700"><input type="checkbox" checked={Boolean(form[name])} onChange={(e) => setForm({ ...form, [name]: e.target.checked })}/>{label}</label>;
                if (type === "textarea") return <label key={name} className="space-y-1.5 text-sm font-semibold text-slate-700">{label}<textarea required={required} value={form[name] || ""} onChange={(e) => setForm({ ...form, [name]: e.target.value })} className={`${inputClass} min-h-24`} /></label>;
                const opts = choices || (type === "select" ? [] : fieldOptions(type, options, form));
                const select = ["select", "indikator", "modul", "wilayah_instansi", "wilayah_parent"].includes(type);
                return <label key={name} className="space-y-1.5 text-sm font-semibold text-slate-700">{label}{select ? <select required={required} value={form[name] || ""} onChange={(e) => setForm({ ...form, [name]: e.target.value, ...(name === "level_wilayah" ? { parent_id: "" } : {}) })} className={inputClass}><option value="">{type === "wilayah_parent" ? "Tanpa induk" : `Pilih ${label.toLowerCase()}`}</option>{opts.map(([value, title]) => <option key={value} value={value}>{title}</option>)}</select> : <input required={required} value={form[name] || ""} onChange={(e) => setForm({ ...form, [name]: e.target.value })} className={inputClass}/>}</label>;
              })}
              <div className="flex gap-3 md:col-span-2"><button className="rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white">{editing ? "Simpan perubahan" : "Simpan master"}</button><button type="button" onClick={() => { setEditing(null); setForm({}); setFormOpen(false); }} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700"><X size={16}/>Batal</button></div>
            </form>
          ) : null}
          <div className="max-h-[65vh] overflow-auto rounded-2xl border border-slate-200"><table className="min-w-full text-left text-sm"><thead className="sticky top-0 z-10 bg-slate-100 text-slate-700"><tr>{config.columns.map((column) => <th key={column} className="whitespace-nowrap px-4 py-3 font-semibold">{column.replaceAll("_", " ")}</th>)}<th className="px-4 py-3 font-semibold">Aksi</th></tr></thead><tbody>{paginatedMasters.map((row) => <tr key={row.id} className="border-t border-slate-100">{config.columns.map((column) => <td key={column} className="max-w-sm px-4 py-3 text-slate-700">{column === "is_active" ? <span className={row[column] ? "text-emerald-700" : "text-slate-500"}>{row[column] ? "Aktif" : "Nonaktif"}</span> : String(row[column] ?? "—")}</td>)}<td className="whitespace-nowrap px-4 py-3"><button type="button" onClick={() => beginMasterEdit(row)} aria-label="Edit master" className="rounded-lg p-2 text-blue-700 hover:bg-blue-50"><Pencil size={16}/></button>{config.fields.some(([name]) => name === "is_active") && <button type="button" onClick={() => toggleMaster(row)} className="ml-1 rounded-lg px-2 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100">{row.is_active ? "Nonaktifkan" : "Aktifkan"}</button>}</td></tr>)}</tbody></table>{visibleMasters.length === 0 && <p className="p-8 text-center text-sm text-slate-500">Tidak ada data master.</p>}</div><TablePagination totalItems={visibleMasters.length} currentPage={masterPage} pageSize={pageSize} onPageChange={setMasterPage}/>
          {masterName === "wilayah" && <p className="text-xs text-slate-500">Master wilayah tidak menyediakan kolom status aktif. Data hanya dapat ditambah dan diedit agar relasi wilayah dan data historis tetap terjaga.</p>}
        </section>
      )}
    </div>
  );
}
