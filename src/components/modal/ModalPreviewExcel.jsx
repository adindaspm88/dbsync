import {
  Modal,
  ModalBody,
} from "flowbite-react";

import {
  Upload,
  Save,
  X,
  FileSpreadsheet,
  Database,
} from "lucide-react";

export default function ModalPreviewExcel({
  open,
  onClose,
  data = [],
  onSave,
  loading = false,
}) {
  return (
    <Modal
      show={open}
      size="7xl"
      onClose={onClose}
      popup
    >
      <ModalBody className="p-0">
        <div className="overflow-hidden rounded-md">
          {/* HEADER */}
          <div className="relative px-6 py-5 bg-gradient-to-r from-emerald-700 via-emerald-600 to-lime-600">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-xl bg-white"></div>
              <div className="absolute bottom-0 left-10 w-24 h-24 rounded-xl bg-white"></div>
            </div>

            <div className="relative flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
                  <FileSpreadsheet
                    size={22}
                    className="text-white"
                  />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white">
                    Preview Import Excel
                  </h3>

                  <p className="text-sm text-emerald-100 mt-1">
                    Periksa data sebelum
                    disimpan ke dalam sistem.
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition"
              >
                <X
                  size={18}
                  className="text-white"
                />
              </button>
            </div>
          </div>

          {/* CONTENT */}
          <div className="bg-white px-6 py-5">
            {/* SUMMARY */}
            <div className="mb-5 flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-100 text-emerald-700 text-sm font-semibold">
                <Database size={16} />
                {data.length} Data
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 text-slate-700 text-sm font-medium">
                <Upload size={16} />
                Siap Diimport
              </div>
            </div>

            {/* TABLE */}
            {data.length > 0 ? (
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="overflow-auto max-h-[500px]">
                  <table className="min-w-full text-sm">
                    <thead className="sticky top-0 z-10">
                      <tr>
                        {Object.keys(data[0]).map(
                          (key) => (
                            <th
                              key={key}
                              className="
                                bg-emerald-700
                                text-white
                                px-4 py-3
                                text-left
                                font-semibold
                                whitespace-nowrap
                              "
                            >
                              {key}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>

                    <tbody>
                      {data.map(
                        (row, rowIndex) => (
                          <tr
                            key={rowIndex}
                            className="hover:bg-emerald-50 transition"
                          >
                            {Object.values(
                              row
                            ).map(
                              (
                                value,
                                colIndex
                              ) => (
                                <td
                                  key={
                                    colIndex
                                  }
                                  className="
                                    px-4 py-3
                                    border-b
                                    border-slate-100
                                    text-slate-700
                                    whitespace-nowrap
                                  "
                                >
                                  {String(
                                    value ?? ""
                                  )}
                                </td>
                              )
                            )}
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="py-14 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                  <FileSpreadsheet
                    size={28}
                    className="text-slate-400"
                  />
                </div>

                <h3 className="font-semibold text-slate-700">
                  Tidak ada data
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  File Excel belum berisi
                  data yang dapat diimport.
                </p>
              </div>
            )}

            {/* FOOTER */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-6 pt-6 border-t border-slate-100">
              <button
                onClick={onClose}
                className="
                  inline-flex items-center
                  justify-center gap-2
                  px-4 py-2
                  rounded-xl
                  border border-slate-200
                  bg-white
                  text-slate-600
                  hover:bg-slate-50
                  transition
                  font-medium
                "
              >
                <X size={14} />
                Batal
              </button>

              <button
                onClick={onSave}
                disabled={
                  data.length === 0 || loading
                }
                className="
                  inline-flex items-center
                  justify-center gap-2
                  px-5 py-2
                  rounded-xl
                  bg-emerald-600
                  text-white
                  hover:bg-emerald-700
                  transition
                  shadow-lg
                  shadow-emerald-200
                  font-semibold
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
              >
                <Save size={14} />
                {loading
                  ? "Mengirim..."
                  : "Simpan Data"}
              </button>
            </div>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}