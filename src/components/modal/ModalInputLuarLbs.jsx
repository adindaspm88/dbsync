import {
  Modal,
  Label,
  TextInput,
} from "flowbite-react";

import {
  Save,
  X,
  Wheat,
} from "lucide-react";

export default function ModalInputLuarLbs({
  open,
  onClose,
  form,
  setForm,
  onSave,
  isEdit = false,
  wilayahs = [],
  periodes = [],
}) {
  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Modal
      show={open}
      size="4xl"
      onClose={onClose}
      popup
    >
      <Modal.Body className="p-0">
        <div className="overflow-hidden rounded-md">
          {/* HEADER */}
          <div className="relative px-6 py-5 bg-gradient-to-r from-emerald-700 via-emerald-600 to-lime-600">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-xl bg-white" />
              <div className="absolute bottom-0 left-10 w-24 h-24 rounded-xl bg-white" />
            </div>

            <div className="relative flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
                  <Wheat
                    size={22}
                    className="text-white"
                  />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white">
                    {isEdit
                      ? "Edit Data Luar LBS"
                      : "Tambah Data Luar LBS"}
                  </h3>

                  <p className="text-sm text-emerald-100 mt-1">
                    Input data lokasi tanam di luar wilayah LBS.
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
          <div className="px-6 py-5 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Wilayah */}
              <div className="space-y-2">
                <Label value="Kelurahan/Desa" />
                <select value={form.wilayah_id} onChange={(e) => handleChange("wilayah_id", e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <option value="">Pilih wilayah</option>
                  {wilayahs.filter((w) => w.level_wilayah === "deskel").map((w) => <option key={w.id} value={w.id}>{w.nama_wilayah}</option>)}
                </select>
              </div>

              {/* Luas Tanam */}
              <div className="space-y-2">
                <Label value="Luas Tanam (Ha)" />
                <TextInput
                  type="number"
                  placeholder="0"
                  value={form.nilai_dinas}
                  onChange={(e) =>
                    handleChange(
                      "nilai_dinas",
                      e.target.value
                    )
                  }
                  className="[&_input]:rounded-xl [&_input]:bg-slate-50"
                />
              </div>

              {/* Kelompok */}
              <div className="space-y-2">
                <Label value="Kelompok" />
                <TextInput
                  placeholder="Nama Kelompok"
                  value={form.kelompok}
                  onChange={(e) =>
                    handleChange(
                      "kelompok",
                      e.target.value
                    )
                  }
                  className="[&_input]:rounded-xl [&_input]:bg-slate-50"
                />
              </div>

              {/* Latitude */}
              <div className="space-y-2">
                <Label value="Latitude" />
                <TextInput
                  placeholder="-6.123456"
                  value={form.latitude}
                  onChange={(e) =>
                    handleChange(
                      "latitude",
                      e.target.value
                    )
                  }
                  className="[&_input]:rounded-xl [&_input]:bg-slate-50"
                />
              </div>

              {/* Longitude */}
              <div className="space-y-2">
                <Label value="Longitude" />
                <TextInput
                  placeholder="107.123456"
                  value={form.longitude}
                  onChange={(e) =>
                    handleChange(
                      "longitude",
                      e.target.value
                    )
                  }
                  className="[&_input]:rounded-xl [&_input]:bg-slate-50"
                />
              </div>

              {/* Periode */}
              <div className="space-y-2">
                <Label value="Periode Data" />
                <select value={form.periode_id} onChange={(e) => handleChange("periode_id", e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <option value="">Pilih periode</option>
                  {periodes.map((p) => <option key={p.id} value={p.id}>{p.periode_label}</option>)}
                </select>
              </div>

              {/* Polygon */}
              <div className="space-y-2">
                <Label value="URL Polygon" />
                <TextInput
                  placeholder="https://..."
                  value={form.polygon}
                  onChange={(e) =>
                    handleChange(
                      "polygon",
                      e.target.value
                    )
                  }
                  className="[&_input]:rounded-xl [&_input]:bg-slate-50"
                />
              </div>

              {/* Foto Fase */}
              <div className="space-y-2">
                <Label value="URL Foto Fase" />
                <TextInput
                  placeholder="https://..."
                  value={form.foto_fase}
                  onChange={(e) =>
                    handleChange(
                      "foto_fase",
                      e.target.value
                    )
                  }
                  className="[&_input]:rounded-xl [&_input]:bg-slate-50"
                />
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
              <button
                onClick={onClose}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition font-medium"
              >
                <X size={14} />
                Batal
              </button>

              <button
                onClick={onSave}
                className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 font-semibold"
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
