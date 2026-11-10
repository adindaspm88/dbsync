import {
  MapPinned,
  CalendarDays,
  Image as ImageIcon,
  Sprout,
  Map,
  Plus,
  Upload,
} from "lucide-react";

const formatNumber = (value) =>
  new Intl.NumberFormat("id-ID").format(value);

const hasCoordinates = (item) => item.latitude !== null && item.latitude !== undefined && item.latitude !== ""
  && item.longitude !== null && item.longitude !== undefined && item.longitude !== ""
  && Number.isFinite(Number(item.latitude)) && Number.isFinite(Number(item.longitude));

export default function LuarLbsTable({
  data = [],
  onImport,
  onAdd,
  onViewLocation,
}) {
  return (
    <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm overflow-hidden">
      {/* HEADER */}
      <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-white via-emerald-50/50 to-lime-50/40 dark:border-slate-700 dark:from-slate-900 dark:via-slate-800 dark:to-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* LEFT */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <Sprout
                size={22}
                className="text-emerald-700"
              />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                Data Luar LBS
              </h2>

              <p className="text-sm text-slate-500 mt-1 dark:text-slate-300">
                Monitoring lokasi tanam di luar wilayah LBS
              </p>
            </div>
          </div>

          {/* RIGHT ACTION */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* TOTAL DATA */}
            <div className="px-4 py-2 rounded-2xl bg-emerald-100 text-emerald-700 text-sm font-semibold">
              {data.length} Data
            </div>

            {/* IMPORT EXCEL */}
            <button
              onClick={onImport}
              className="
                inline-flex items-center gap-2
                px-4 py-2.5
                rounded-2xl
                border border-slate-200
                bg-white
                hover:bg-slate-50
                hover:border-emerald-300
                text-slate-700
                text-sm font-medium
                transition-all
                shadow-sm
              "
            >
              <Upload size={16} />

              Import Excel
            </button>

            {/* TAMBAH DATA */}
            <button
              onClick={onAdd}
              className="
                inline-flex items-center gap-2
                px-4 py-2.5
                rounded-2xl
                bg-emerald-600
                hover:bg-emerald-700
                text-white
                text-sm font-medium
                transition-all
                shadow-sm
              "
            >
              <Plus size={16} />

              Tambah Data
            </button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-sm">
          <thead className="sticky top-0 z-10">
            <tr>
              <th className="bg-emerald-700 text-white px-5 py-4 text-left font-semibold min-w-[220px]">
                Kecamatan
              </th>

              <th className="bg-emerald-700 text-white px-5 py-4 text-left font-semibold min-w-[220px]">
                Kelurahan
              </th>

              <th className="bg-emerald-700 text-white px-5 py-4 text-center font-semibold min-w-[220px]">
                Luas Tanam di Luar LBS (Ha)
              </th>

              <th className="bg-emerald-700 text-white px-5 py-4 text-center font-semibold min-w-[180px]">
                Kelompok
              </th>

              <th className="bg-emerald-700 text-white px-5 py-4 text-center font-semibold min-w-[180px]">
                Latitude
              </th>

              <th className="bg-emerald-700 text-white px-5 py-4 text-center font-semibold min-w-[180px]">
                Longitude
              </th>

              <th className="bg-emerald-700 text-white px-5 py-4 text-center font-semibold min-w-[160px]">
                Lihat Lokasi
              </th>

              <th className="bg-emerald-700 text-white px-5 py-4 text-center font-semibold min-w-[180px]">
                Tanggal Tanam
              </th>

              <th className="bg-emerald-700 text-white px-5 py-4 text-center font-semibold min-w-[180px]">
                Tanggal Panen
              </th>

              <th className="bg-emerald-700 text-white px-5 py-4 text-center font-semibold min-w-[170px]">
                Polygon
              </th>

              <th className="bg-emerald-700 text-white px-5 py-4 text-center font-semibold min-w-[170px]">
                Foto Fase
              </th>
            </tr>
          </thead>

          <tbody>
            {data.map((item, index) => (
              <tr
                key={index}
                className="hover:bg-emerald-50/30 transition-all"
              >
                {/* KECAMATAN */}
                <td className="px-5 py-5 border-b border-slate-100 bg-white align-top">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                      <MapPinned
                        size={18}
                        className="text-emerald-700"
                      />
                    </div>

                    <div>
                      <p className="font-semibold text-slate-800">
                        {item.kecamatan}
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        Wilayah Kecamatan
                      </p>
                    </div>
                  </div>
                </td>
                {/* KELURAHAN */}
                <td className="px-5 py-5 border-b border-slate-100 bg-white align-top">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                      <MapPinned
                        size={18}
                        className="text-emerald-700"
                      />
                    </div>

                    <div>
                      <p className="font-semibold text-slate-800">
                        {item.wilayah_name}
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        Wilayah Kelurahan
                      </p>
                    </div>
                  </div>
                </td>

                {/* LUAS TANAM */}
                <td className="px-5 py-5 border-b border-slate-100 bg-white text-center align-top">
                  <div>
                    <p className="font-bold text-emerald-700 text-base">
                      {formatNumber(item.nilai_dinas ?? 0)}
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      Hektare
                    </p>
                  </div>
                </td>

                {/* KELOMPOK */}
                <td className="px-5 py-5 border-b border-slate-100 bg-white text-center align-top">
                  <div>
                    <p className="font-bold text-emerald-700 text-base">
                      {item.kelompok || "—"}
                    </p>
                  </div>
                </td>

                {/* LATITUDE */}
                <td className="px-5 py-5 border-b border-slate-100 bg-white text-center align-top">
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 inline-block">
                    <p className="font-medium text-slate-700">
                      {item.latitude ?? "—"}
                    </p>
                  </div>
                </td>

                {/* LONGITUDE */}
                <td className="px-5 py-5 border-b border-slate-100 bg-white text-center align-top">
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 inline-block">
                    <p className="font-medium text-slate-700">
                      {item.longitude ?? "—"}
                    </p>
                  </div>
                </td>

                {/* LIHAT LOKASI */}
                <td className="px-5 py-5 border-b border-slate-100 bg-white text-center align-top">
                  {hasCoordinates(item) ? (
                    <button
                      type="button"
                      onClick={() => onViewLocation?.(item)}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    >
                      <MapPinned size={15} />
                      Lihat lokasi
                    </button>
                  ) : (
                    <span className="text-slate-400">Koordinat kosong</span>
                  )}
                </td>

                {/* TANGGAL TANAM */}
                <td className="px-5 py-5 border-b border-slate-100 bg-white align-top">
                  <div className="flex items-center justify-center gap-2 text-slate-700">
                    <CalendarDays
                      size={16}
                      className="text-emerald-600"
                    />

                    <span className="font-medium">
                      {item.tanggal_tanam || "—"}
                    </span>
                  </div>
                </td>

                {/* TANGGAL PANEN */}
                <td className="px-5 py-5 border-b border-slate-100 bg-white align-top">
                  <div className="flex items-center justify-center gap-2 text-slate-700">
                    <CalendarDays
                      size={16}
                      className="text-orange-500"
                    />

                    <span className="font-medium">
                      {item.tanggal_panen || "—"}
                    </span>
                  </div>
                </td>

                {/* POLYGON */}
                <td className="px-5 py-5 border-b border-slate-100 bg-white text-center align-top">
                  {item.polygon ? (
                    <a
                      href={item.polygon}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-sky-100 hover:bg-sky-200 text-sky-700 text-xs font-semibold transition"
                    >
                      <Map size={15} />
                      View Image
                    </a>
                  ) : (
                    <span className="text-slate-300">
                      —
                    </span>
                  )}
                </td>

                {/* FOTO FASE */}
                <td className="px-5 py-5 border-b border-slate-100 bg-white text-center align-top">
                  {item.foto_fase ? (
                    <a
                      href={item.foto_fase}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-xs font-semibold transition"
                    >
                      <ImageIcon size={15} />
                      View Image
                    </a>
                  ) : (
                    <span className="text-slate-300">
                      —
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* EMPTY */}
      {data.length === 0 && (
        <div className="py-20 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Sprout
              size={28}
              className="text-slate-400"
            />
          </div>

          <h3 className="font-semibold text-slate-700">
            Tidak ada data
          </h3>

          <p className="text-sm text-slate-500 mt-1">
            Data luar LBS belum tersedia
          </p>
        </div>
      )}
    </div>
  );
}
