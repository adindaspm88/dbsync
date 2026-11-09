
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogIn,
  Mail,
  Lock,
  BarChart3,
  Database,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

import { login } from "../services/authService";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const data = await login(email, password);

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/");
    } catch (error) {
      setError(
        error.response?.data?.detail ||
        "Email atau password tidak sesuai. Silakan coba kembali."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4 sm:p-6">

      <div className="w-full max-w-5xl min-h-[450px] overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/60 border border-slate-200/70 grid grid-cols-1 lg:grid-cols-2">

        {/* =========================================
            LEFT SIDE
        ========================================= */}

        <section className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0B3675] to-[#145CA8] p-10 xl:p-12 text-white">

          {/* Subtle decoration */}
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full border border-white/[0.08]" />
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full border border-white/[0.08]" />
          <div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-blue-400/10 blur-3xl" />

          {/* Brand */}
          <div className="relative z-10 flex items-center gap-4">

            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white p-2 shadow-lg">
              <img
                src="/favicon.ico"
                alt="DBSYNC"
                className="h-full w-full object-contain"
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-blue-100">
                DBSYNC
              </h1>

              <p className="mt-0.5 text-sm text-blue-100">
                Dinas BPS Synchronize
              </p>
            </div>
          </div>

          {/* Main content */}
          <div className="relative z-10 my-12 max-w-lg">

            <div className="mb-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Data Synchronization Platform
            </div>

            <h2 className="text-3xl xl:text-4xl font-bold leading-[1.2] tracking-tight text-blue-200">
              Menyatukan Data,
              <span className="block mt-2 text-blue-200">
                Menyelaraskan Informasi.
              </span>
            </h2>

            {/* <p className="mt-6 max-w-md text-base leading-8 text-blue-100">
              Platform kolaborasi BPS dan Dinas untuk
              membandingkan, memvalidasi, serta memastikan
              konsistensi data statistik sektoral.
            </p> */}

            {/* Features */}
            <div className="mt-10 space-y-4">

              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-blue-100">
                  <Database size={21} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    Integrasi Data
                  </p>
                  <p className="mt-0.5 text-xs text-blue-200">
                    Menghubungkan data BPS dan Dinas.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-blue-100">
                  <BarChart3 size={21} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    Perbandingan Statistik
                  </p>
                  <p className="mt-0.5 text-xs text-blue-200">
                    Mengidentifikasi kesesuaian dan perbedaan data.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-blue-100">
                  <ShieldCheck size={21} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    Validasi dan Akuntabilitas
                  </p>
                  <p className="mt-0.5 text-xs text-blue-200">
                    Mendokumentasikan alasan setiap perbedaan.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="relative z-10 flex items-center justify-between border-t border-white/15 pt-6">
            <p className="text-xs text-blue-200">
              © 2026 Badan Pusat Statistik
            </p>

            <p className="text-xs font-medium text-blue-200">
              Jawa Barat
            </p>
          </div>

        </section>

        {/* =========================================
            RIGHT SIDE - LOGIN FORM
        ========================================= */}

        <section className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-10 xl:px-14">

          <div className="mx-auto w-full max-w-md">

            {/* Mobile Brand */}
            <div className="mb-10 flex items-center gap-3 lg:hidden">

              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white border border-slate-200 p-2">
                <img
                  src="/favicon.ico"
                  alt="DBSYNC"
                  className="h-full w-full object-contain"
                />
              </div>

              <div>
                <h1 className="text-xl font-bold text-[#1254A4]">
                  DBSYNC
                </h1>
                <p className="text-xs text-slate-500">
                  Dinas BPS Synchronize
                </p>
              </div>

            </div>

            {/* Form Header */}
            <div className="mb-7">

              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#1254A4]">
                <LogIn size={23} />
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-slate-800">
                Selamat Datang
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Masuk ke akun DBSYNC untuk mengakses
                dashboard dan monitoring data.
              </p>

            </div>

            {/* Error Message */}
            {error && (
              <div
                role="alert"
                className="mb-6 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4"
              >
                <AlertCircle
                  size={19}
                  className="mt-0.5 shrink-0 text-red-500"
                />

                <p className="text-sm leading-5 text-red-700">
                  {error}
                </p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email
                </label>

                <div className="relative">

                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="email"
                    type="email"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    placeholder="nama@bps.go.id"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />

                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Password
                </label>

                <div className="relative">

                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="Masukkan password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-3 pl-11 pr-12 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="group mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1254A4] py-3 text-sm font-semibold text-white shadow-md shadow-blue-900/10 transition hover:bg-[#0B3675] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Memproses...
                  </>
                ) : (
                  <>
                    Masuk ke DBSYNC
                    <ArrowRight
                      size={17}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>

            </form>

            {/* Footer */}
            <div className="mt-7 border-t border-slate-100 pt-6 text-center">

              <div className="flex items-center justify-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <p className="text-xs font-medium text-slate-500">
                  Sistem Monitoring dan Sinkronisasi Data
                </p>
              </div>

              <p className="mt-3 text-xs text-slate-400">
                Badan Pusat Statistik · 2026
              </p>

            </div>

          </div>

        </section>

      </div>
    </div>
  );
}
