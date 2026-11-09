import React, {
  useState,
  useEffect,
} from "react";
import {
  FileBarChart2,
  Pencil,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Wheat,
  TrendingUp,
  Factory,
  BarChart3,
} from "lucide-react";

const icons = {
  pangan: Wheat,
  inflasi: TrendingUp,
  industri: Factory,
};

const Icon =
  // icons[moduleInfo?.kode] ||
  BarChart3;

const formatNumber = (value) =>
  new Intl.NumberFormat("id-ID").format(value);

export default function ComparisonTable({
  groupedData,
  variables,
  moduleInfo,
  onEdit,
}) {
  
  const [currentPage, setCurrentPage] =
    useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.max(

    1,

    Math.ceil(groupedData.length / itemsPerPage)

  );

  const paginatedData = groupedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  useEffect(() => {

    setCurrentPage(1);

  }, [groupedData]);
  const visiblePages = Array.from(

    { length: totalPages },

    (_, i) => i + 1

  ).filter(

    (page) =>

      page >= currentPage - 2 &&

      page <= currentPage + 2

  );
  return (
    <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm overflow-hidden">
      {/* HEADER */}
      <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-white via-sky-50/50 to-cyan-50/40">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center">
                <Icon
                  size={22}
                  className="text-sky-700"
                />
              </div>

              <div>
                <h2 className="text-xl text-left font-bold text-slate-800">
                  {moduleInfo?.nama ||
                    "Perbandingan Data Statistik"}
                </h2>

                <p className="text-sm text-left text-slate-500 mt-1">
                  {moduleInfo?.deskripsi ||
                    "Monitoring perbandingan data BPS dan Dinas"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-sky-100 text-sky-700 text-sm font-semibold">
              {groupedData.length} Data
            </div>

            <div className="px-4 py-2 rounded-2xl bg-emerald-100 text-emerald-700 text-sm font-semibold">
              {variables.length} Variabel
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-sm">
          <thead className="sticky top-0 z-10">
            {/* HEADER 1 */}
            <tr>
              <th
                rowSpan="2"
                className="bg-sky-700 text-white px-5 py-4 text-center font-semibold border-b border-slate-800 min-w-[180px]"
              >
                Wilayah
              </th>

              <th
                rowSpan="2"
                className="bg-sky-700 text-white px-5 py-4 text-center font-semibold border-b border-slate-800 min-w-[160px]"
              >
                Periode
              </th>

              {variables.map((variable) => (
                <th
                  key={variable.kode_variabel}
                  colSpan="4"
                  className="bg-sky-700 text-white px-4 py-4 text-center font-semibold border-b border-sky-600"
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-white"></div>

                    {variable.nama_variabel}
                  </div>
                </th>
              ))}
            </tr>

            {/* HEADER 2 */}
            <tr>
              {variables.map((variable) => (
                <React.Fragment
                  key={`col-${variable.kode_variabel}`}
                >
                  <th className="bg-sky-50 text-slate-700 px-4 py-3 font-semibold border-b border-slate-200 min-w-[140px]">
                    BPS
                  </th>

                  <th className="bg-sky-50 text-slate-700 px-4 py-3 font-semibold border-b border-slate-200 min-w-[170px]">
                    Dinas
                  </th>

                  <th className="bg-sky-50 text-slate-700 px-4 py-3 font-semibold border-b border-slate-200 min-w-[130px]">
                    Gap
                  </th>

                  <th className="bg-sky-50 text-slate-700 px-4 py-3 font-semibold border-b border-slate-200 min-w-[320px]">
                    Keterangan
                  </th>
                </React.Fragment>
              ))}
            </tr>
          </thead>

          <tbody>
            {paginatedData.map((row) => (
              <tr
                key={`${row.kode_kabupaten}-${row.bulan}-${row.tahun}`}
                className="group hover:bg-sky-50/30 transition-all"
              >
                {/* WILAYAH */}
                <td className="px-5 py-5 border-b border-slate-100 align-top bg-white">
                  <div>
                    <p className="font-semibold text-slate-800">
                      {row.nama_wilayah}
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      {row.level_wilayah}
                    </p>
                  </div>
                </td>

                {/* PERIODE */}
                <td className="px-5 py-5 border-b border-slate-100 align-top bg-white">
                  <div>
                    <p className="font-semibold text-slate-700">
                      {row.bulan}
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      Tahun {row.tahun}
                    </p>
                  </div>
                </td>

                {/* DATA */}
                {variables.map((variable) => {
                  const item =
                    row.variabels?.[
                      variable.kode_variabel
                    ];

                  const gap = item
                    ? item.nilai_dinas -
                      item.nilai_bps
                    : 0;

                  const isPositive = gap >= 0;

                  return (
                    <React.Fragment

                      key={`${row.kode_kabupaten}-${row.bulan}-${row.tahun}-${variable.kode_variabel}`}

                    >
                      {/* BPS */}
                      <td className="px-4 py-5 border-b border-slate-100 text-right align-top bg-white">
                        {item ? (
                          <div>
                            <p className="font-bold text-slate-800">
                              {formatNumber(
                                item.nilai_bps
                              )}
                            </p>

                            <p className="text-[11px] text-slate-400 mt-1">
                              {item.satuan_bps}
                            </p>
                          </div>
                        ) : (
                          <span className="text-slate-300">
                            —
                          </span>
                        )}
                      </td>

                      {/* DINAS */}
                      <td className="px-4 py-5 border-b border-slate-100 align-top bg-white">
                        {item ? (
                          <div className="flex items-start justify-between gap-3">
                            <div className="text-right flex-1">
                              <p className="font-bold text-sky-700">
                                {formatNumber(
                                  item.nilai_dinas
                                )}
                              </p>

                              <p className="text-[11px] text-slate-400 mt-1">
                                {item.satuan_dinas}
                              </p>
                            </div>

                            <button
                              onClick={() =>
                                onEdit(
                                  row,
                                  variable.kode_variabel,
                                  item
                                )
                              }
                              className="w-8 h-8 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-700 flex items-center justify-center transition"
                            >
                              <Pencil size={14} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              onEdit(
                                row,
                                variable.kode_variabel,
                                item
                              )
                            }
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-700 text-xs font-semibold transition"
                          >
                            <Plus size={14} />
                            Tambah
                          </button>
                        )}
                      </td>

                      {/* GAP */}
                      <td className="px-4 py-5 border-b border-slate-100 align-top bg-white">
                        {item ? (
                          <div
                            className={`inline-flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-semibold ${
                              isPositive
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {isPositive ? (
                              <ArrowUpRight
                                size={14}
                              />
                            ) : (
                              <ArrowDownRight
                                size={14}
                              />
                            )}

                            {formatNumber(
                              Math.abs(gap)
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-300">
                            —
                          </span>
                        )}
                      </td>

                      {/* NARASI */}
                      <td className="px-4 py-5 border-b border-slate-100 align-top bg-white">
                        {item ? (
                          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                            <p className="text-slate-600 leading-relaxed text-[13px]">
                              {item.narasi}
                            </p>
                          </div>
                        ) : (
                          <span className="text-slate-300">
                            —
                          </span>
                        )}
                      </td>
                    </React.Fragment>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {groupedData.length > 0 && (

        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-white">

          <div className="text-sm text-slate-500">

            Menampilkan{" "}

            {(currentPage - 1) * itemsPerPage + 1}

            {" - "}

            {Math.min(

              currentPage * itemsPerPage,

              groupedData.length

            )}

            {" dari "}

            {groupedData.length} data

          </div>



          <div className="flex items-center gap-2">

            <button

              onClick={() =>

                setCurrentPage((prev) =>

                  Math.max(prev - 1, 1)

                )

              }

              disabled={currentPage === 1}

              className="px-3 py-2 rounded-xl border border-slate-200 text-sm disabled:opacity-50"

            >

              Sebelumnya

            </button>



            {visiblePages.map((page) => (

              <button

                key={page}

                onClick={() => setCurrentPage(page)}

              >

                {page}

              </button>

            ))}



            <button

              onClick={() =>

                setCurrentPage((prev) =>

                  Math.min(

                    prev + 1,

                    totalPages

                  )

                )

              }

              disabled={

                currentPage === totalPages

              }

              className="px-3 py-2 rounded-xl border border-slate-200 text-sm disabled:opacity-50"

            >

              Berikutnya

            </button>

          </div>

        </div>

      )}

      {/* EMPTY */}
      {groupedData.length === 0 && (
        <div className="py-20 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <FileBarChart2
              size={28}
              className="text-slate-400"
            />
          </div>

          <h3 className="font-semibold text-slate-700">
            Tidak ada data
          </h3>

          <p className="text-sm text-slate-500 mt-1">
            Data perbandingan belum tersedia
          </p>
        </div>
      )}
    </div>
  );
}