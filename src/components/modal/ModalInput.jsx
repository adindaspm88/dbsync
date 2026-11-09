import {
  Modal,
  Label,
  TextInput,
  Textarea,
} from "flowbite-react";

import {
  Save,
  X,
  FileText,
  Database,
} from "lucide-react";

export default function DinasModal({
  openModal,
  setOpenModal,
  formData,
  setFormData,
  onSubmit,
  isEdit = false,
}) {
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Modal
      show={openModal}
      size="xl"
      onClose={() => setOpenModal(false)}
      popup
    >
      <Modal.Body className="p-0">
        <div className="overflow-hidden rounded-md">
          {/* HEADER */}
          <div className="relative px-6 py-5 bg-gradient-to-r from-sky-700 via-sky-600 to-cyan-600">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-xl bg-white"></div>
              <div className="absolute bottom-0 left-10 w-24 h-24 rounded-xl bg-white"></div>
            </div>

            <div className="relative flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
                  <Database
                    size={22}
                    className="text-white"
                  />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white">
                    {isEdit
                      ? "Edit Data Dinas"
                      : "Tambah Data Dinas"}
                  </h3>

                  <p className="text-sm text-sky-100 mt-1">
                    Input nilai dinas dan
                    narasi penjelasan data
                    statistik.
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  setOpenModal(false)
                }
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
          <div className="px-6 py-5 bg-white">
            <div className="space-y-6">
              {/* NILAI DINAS */}
              <div className="space-y-2">
                <Label
                  value="Nilai Dinas"
                  className="text-slate-700 font-semibold"
                />

                <div className="relative">
                  <TextInput
                    type="number"
                    placeholder="Masukkan nilai dinas"
                    value={
                      formData.nilai_dinas ||
                      ""
                    }
                    onChange={(e) =>
                      handleChange(
                        "nilai_dinas",
                        e.target.value
                      )
                    }
                    sizing="md"
                    className="[&_input]:rounded-xl [&_input]:border-slate-200 [&_input]:bg-slate-50 [&_input]:focus:border-sky-400 [&_input]:focus:ring-sky-400"
                  />

                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                    Total
                  </div>
                </div>
              </div>

              {/* SATUAN */}
              <div className="space-y-2">
                <Label
                  value="Satuan Dinas"
                  className="text-slate-700 font-semibold"
                />

                <TextInput
                  type="text"
                  placeholder="Contoh: Ton"
                  value={
                    formData.satuan_dinas ||
                    ""
                  }
                  onChange={(e) =>
                    handleChange(
                      "satuan_dinas",
                      e.target.value
                    )
                  }
                  sizing="md"
                  className="[&_input]:rounded-xl [&_input]:border-slate-200 [&_input]:bg-slate-50 [&_input]:focus:border-sky-400 [&_input]:focus:ring-sky-400"
                />
              </div>

              {/* NARASI */}
              <div className="space-y-2">
                <Label
                  value="Narasi Dinas"
                  className="text-slate-700 font-semibold"
                />

                <div className="relative">
                  <Textarea
                    rows={4}
                    placeholder="Masukkan narasi atau alasan perbedaan data..."
                    value={
                      formData.narasi_dinas ||
                      ""
                    }
                    onChange={(e) =>
                      handleChange(
                        "narasi_dinas",
                        e.target.value
                      )
                    }
                    className="rounded-xl border-slate-200 bg-slate-50 focus:border-sky-400 focus:ring-sky-400 text-sm leading-relaxed px-4 py-3"
                  />

                  <div className="absolute top-4 right-4">
                    <FileText
                      size={18}
                      className="text-slate-300"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
              <button
                onClick={() =>
                  setOpenModal(false)
                }
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition font-medium"
              >
                <X size={13} />
                Batal
              </button>

              <button
                onClick={onSubmit}
                className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-sky-600 text-white hover:bg-sky-700 transition shadow-lg shadow-sky-200 font-semibold"
              >
                <Save size={14} />

                {isEdit
                  ? "Update Data"
                  : "Simpan Data"}
              </button>
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}