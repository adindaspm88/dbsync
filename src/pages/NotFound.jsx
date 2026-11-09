import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <AlertTriangle
          size={64}
          className="mx-auto text-red-500 mb-4"
        />

        <h1 className="text-4xl font-bold text-slate-800">
          404
        </h1>

        <p className="text-slate-600 mt-2">
          Halaman yang Anda cari tidak ditemukan.
        </p>

        <Link
          to="/"
          className="inline-block mt-6 px-5 py-3 rounded-xl bg-sky-600 text-white"
        >
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}