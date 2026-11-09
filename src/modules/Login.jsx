export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        {/* Left Section */}
        <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-slate-900 to-slate-800 text-white p-10 relative">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-2xl shadow-lg">
                📊
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-wide">
                  AKUR JABAR
                </h1>
                <p className="text-sm text-slate-300 tracking-wider uppercase">
                  Modul Strategis Pangan
                </p>
              </div>
            </div>

            <div className="mt-14">
              <h2 className="text-4xl font-bold leading-tight mb-5">
                Sistem Konsolidasi dan Rekonsiliasi Data
              </h2>

              <p className="text-slate-300 text-base leading-relaxed max-w-md">
                Dashboard monitoring dan pengelolaan data statistik
                strategis Jawa Barat berbasis web modern.
              </p>
            </div>
          </div>

          <div className="text-sm text-slate-400 border-t border-slate-700 pt-5 mt-10">
            Badan Pusat Statistik Provinsi Jawa Barat
          </div>

          {/* Decorative blur */}
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl" />
        </div>

        {/* Right Section */}
        <div className="p-8 lg:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">
              Selamat Datang
            </p>

            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Login Sistem
            </h2>

            <p className="text-gray-500 text-sm">
              Masuk menggunakan akun yang telah terdaftar.
            </p>
          </div>

          <form className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email / Username
              </label>

              <input
                type="text"
                placeholder="Masukkan email atau username"
                className="w-full rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none px-4 py-3 transition bg-gray-50"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Password
                </label>

                <button
                  type="button"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Lupa Password?
                </button>
              </div>

              <input
                type="password"
                placeholder="Masukkan password"
                className="w-full rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none px-4 py-3 transition bg-gray-50"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-600">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Ingat saya
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 transition text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-200"
            >
              Masuk ke Dashboard
            </button>
          </form>

          <div className="mt-8 pt-5 border-t border-gray-200 text-sm text-gray-500 text-center">
            © 2026 AKUR JABAR • Badan Pusat Statistik
          </div>
        </div>
      </div>
    </div>
  );
}
