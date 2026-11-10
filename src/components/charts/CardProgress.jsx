import {
  Sprout,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CardProgress({
  title,
  nilaiBps,
  nilaiDinas,
  labelPeriode,
  percent,
  color = "#2563eb",
  satuan = "",
  icon: Icon = Sprout,

  moduleCode,

  onClick,
}) {
  const navigate = useNavigate();
  const handleClick = () => {
    if (onClick) return onClick();

    navigate(`/modul/${moduleCode}/perbandingan`);
  };

  return (
    <div
      onClick={handleClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleClick();
        }
      }}
      role="link"
      tabIndex={0}
      aria-label={`Lihat perbandingan seluruh variabel modul untuk ${title}`}
      className="relative bg-white rounded-2xl shadow-sm p-5 border-l-4 hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      style={{ borderColor: color }}
    >
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div
          className="w-11 h-11 flex items-center justify-center rounded-xl"
          style={{
            backgroundColor: `${color}20`,
            color,
          }}
        >
          <Icon size={20} />
        </div>

        <div className="text-right">
          <p
            className="font-bold text-base"
            style={{ color }}
          >
            {title}
          </p>

          <p className="font-semibold text-xs capitalize" style={{color}}>
            {labelPeriode}
          </p>

        </div>
      </div>
          
      {/* VALUE */}
      <div className="mt-4 space-y-3">
        {/* BPS */}
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-slate-500">
            BPS
          </p>

          <p className="font-bold text-slate-800 text-right">
            {Number(nilaiBps ?? 0).toLocaleString(
              "id-ID"
            )}{" "}
            {satuan}
          </p>
        </div>

        {/* DINAS */}
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-slate-500">
            Dinas
          </p>

          <p className="font-bold text-sky-700 text-right">
            {Number(nilaiDinas ?? 0).toLocaleString(
              "id-ID"
            )}{" "}
            {satuan}
          </p>
        </div>

        {/* GAP */}
        <div className="flex items-center justify-between border-t pt-2">
          <p className="text-xs font-medium text-slate-500">
            Gap
          </p>

          <p
            className={`font-semibold text-right ${
              (nilaiDinas ?? 0) - (nilaiBps ?? 0) >= 0
                ? "text-emerald-600"
                : "text-red-600"
            }`}
          >
            {(
              (nilaiDinas ?? 0) -
              (nilaiBps ?? 0)
            ).toLocaleString("id-ID")}{" "}
            {satuan}
          </p>
        </div>
      </div>

      {/* PROGRESS */}
      {percent !== undefined && (
        <div className="mt-4 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-2 rounded-full transition-all duration-700"
            style={{
              width: `${percent}%`,
              backgroundColor: color,
            }}
          />
        </div>
      )}

      <p className="mt-4 flex items-center justify-center gap-1 border-t border-slate-100 pt-3 text-xs font-semibold text-sky-700 transition group-hover:text-sky-900 dark:border-slate-700 dark:text-sky-300 dark:group-hover:text-sky-200">
        Klik di sini untuk lihat detail
        <ChevronRight size={14} aria-hidden="true" />
      </p>
    </div>
  );
}
