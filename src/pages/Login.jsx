import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Database,
  Eye,
  EyeOff,
  LockKeyhole,
  LogIn,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { login } from "../services/authService";
import ThemeToggle from "../components/ThemeToggle";
import { useTheme } from "../components/ThemeContext";

function Brand({ compact = false }) {
  return (
    <a href="/" aria-label="DBSYNC beranda" className="inline-flex items-center gap-3">
      <span className={`flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-2 shadow-sm ${compact ? "h-12 w-12" : "h-14 w-14"}`}>
        <img src="/favicon.ico" alt="" className="h-full w-full object-contain" />
      </span>
      <span>
        <span className={`${compact ? "text-xl" : "text-2xl"} block font-bold tracking-tight text-white`}>DBSYNC</span>
        <span className="mt-0.5 block text-sm text-blue-100">Dinas BPS Synchronize</span>
      </span>
    </a>
  );
}

const features = [
  { icon: Database, title: "Integrasi Data", description: "Menghubungkan data BPS dan Dinas." },
  { icon: BarChart3, title: "Perbandingan Statistik", description: "Mengidentifikasi kesesuaian dan perbedaan data." },
  { icon: ShieldCheck, title: "Validasi dan Akuntabilitas", description: "Mendokumentasikan alasan setiap perbedaan." },
];

function BrandPanel() {
  return (
    <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0B3675] to-[#145CA8] p-10 text-white lg:flex xl:p-12">
      <div aria-hidden="true" className="absolute -right-32 -top-32 h-96 w-96 rounded-full border border-white/10" />
      <div aria-hidden="true" className="absolute -right-20 -top-20 h-72 w-72 rounded-full border border-white/10" />
      <div aria-hidden="true" className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-blue-300/15 blur-3xl" />

      <div className="relative z-10"><Brand /></div>

      <div className="relative z-10 my-12 max-w-lg">
        <div className="mb-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-100">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Platform Sinkronisasi Data
        </div>
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-white xl:text-4xl">
          Menyatukan Data,
          <span className="mt-2 block text-blue-100">Menyelaraskan Informasi.</span>
        </h1>
        <p className="mt-5 max-w-md text-sm leading-6 text-blue-100">
          Kolaborasi BPS dan Dinas untuk membandingkan, memvalidasi, serta menjaga konsistensi data statistik sektoral.
        </p>
        <div className="mt-9 space-y-5">
          {features.map(({ icon: Icon, title, description }) => (
            <div className="flex items-center gap-4" key={title}>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white"><Icon size={21} aria-hidden="true" /></span>
              <span><span className="block text-sm font-semibold text-white">{title}</span><span className="mt-0.5 block text-xs leading-5 text-blue-100">{description}</span></span>
            </div>
          ))}
        </div>
      </div>

      <footer className="relative z-10 flex items-center justify-between border-t border-white/20 pt-5 text-xs text-blue-100">
        <span>© 2026 Badan Pusat Statistik</span><span className="font-semibold">Jawa Barat</span>
      </footer>
    </section>
  );
}

function LoginField({ id, label, type = "text", icon: Icon, value, onChange, placeholder, autoComplete, trailing }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</label>
      <div className="relative">
        <Icon size={18} aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
        <input
          id={id} type={type} autoComplete={autoComplete} required value={value}
          onChange={onChange} placeholder={placeholder}
          className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3 pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/15 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400 dark:focus:border-blue-400 dark:focus:bg-slate-800 dark:focus:ring-blue-400/20"
        />
        {trailing}
      </div>
    </div>
  );
}

function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await login(email.trim(), password);
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Email atau password tidak sesuai. Silakan coba kembali.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-7">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200"><LogIn size={23} aria-hidden="true" /></div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Selamat Datang</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">Masuk ke akun DBSYNC untuk mengakses dashboard dan monitoring data.</p>
      </div>

      {error && <div role="alert" className="mb-6 flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 p-4 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100"><AlertCircle size={19} aria-hidden="true" className="mt-0.5 shrink-0" /><p className="text-sm leading-5">{error}</p></div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <LoginField id="email" label="Email" icon={Mail} value={email} autoComplete="username" placeholder="nama@bps.go.id" onChange={(event) => { setEmail(event.target.value); setError(""); }} />
        <LoginField
          id="password" label="Password" icon={LockKeyhole} type={showPassword ? "text" : "password"}
          value={password} autoComplete="current-password" placeholder="Masukkan password"
          onChange={(event) => { setPassword(event.target.value); setError(""); }}
          trailing={<button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"} className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-600 transition hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:text-slate-300 dark:hover:text-white"><span className="sr-only">{showPassword ? "Sembunyikan password" : "Tampilkan password"}</span>{showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}</button>}
        />
        <button type="submit" disabled={loading} className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1254A4] py-3.5 text-sm font-semibold text-white shadow-md shadow-blue-900/15 transition hover:bg-[#0B3675] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60">
          {loading ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />Memproses...</> : <>Masuk ke DBSYNC<ArrowRight size={17} aria-hidden="true" className="transition-transform group-hover:translate-x-1" /></>}
        </button>
      </form>
    </>
  );
}

export default function Login() {
  const { theme, setTheme } = useTheme();

  return (
    <main className={theme === "dark" ? "dark min-h-screen bg-slate-950 text-slate-100" : "min-h-screen bg-[#F3F6FB] text-slate-900"}>
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="relative grid min-h-[620px] w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30 lg:grid-cols-2">
          <BrandPanel />
          <section className="flex flex-col justify-center px-6 py-9 sm:px-10 lg:px-10 xl:px-14">
            <div className="mb-9 flex items-center justify-between gap-4 lg:justify-end">
              <div className="lg:hidden"><Brand compact /></div>
              <ThemeToggle theme={theme} onToggle={() => setTheme((current) => current === "dark" ? "light" : "dark")} />
            </div>
            <div className="mx-auto w-full max-w-md">
              <LoginForm />
              <footer className="mt-8 border-t border-slate-200 pt-6 text-center dark:border-slate-700">
                <p className="flex items-center justify-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300"><span className="h-2 w-2 rounded-full bg-emerald-500" />Sistem Monitoring dan Sinkronisasi Data</p>
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Badan Pusat Statistik · 2026</p>
              </footer>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
