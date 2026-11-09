import {
  Sprout,
  ChevronRight,
} from "lucide-react";

export default function CardProgress({
  title,
  nilaiBps,
  nilaiDinas,
  labelPeriode,
  percent,
  color = "#2563eb",
  satuan = "",
  icon: Icon = Sprout,

  kodeVariabel,
  moduleCode,

  onClick,
}) {
  const handleClick = () => {
    if (onClick) return onClick();

    window.location.href = `/modul/${moduleCode}/perbandingan/${kodeVariabel}`;
  };

  return (
    <div
      onClick={handleClick}
      className="relative bg-white rounded-2xl shadow-sm p-5 border-l-4 hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
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

          <p className="text-[10px] font-semibold text-gray-400 flex items-center justify-end gap-1 group-hover:text-sky-600 transition">
            DETAIL
            <ChevronRight size={12} />
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
    </div>
  );
}
