import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Wheat,
  MapPinned,
} from "lucide-react";

import LuarLbsTable from "../../components/tables/LuarLbsTable";
import ModalLuarLbs from "../../components/modal/ModalLuarLbs";

export default function LuarLbsPage() {
  const [data, setData] = useState([]);

  const [selectedKecamatan, setSelectedKecamatan] = useState("");

  // ✅ TAMBAHAN WAJIB
  const [openModal, setOpenModal] = useState(false);

  const [formData, setFormData] = useState({
    satuan_dinas: "",
    narasi_dinas: "",
  });

  useEffect(() => {
    setData([
      {
        kecamatan: "Cisayong",
        luas_tanam: 125,
        tanggal_tanam: "2026-01-10",
      },
      {
        kecamatan: "Banjaranyar",
        luas_tanam: 210,
        tanggal_tanam: "2026-02-01",
      },
    ]);
  }, []);

  const kecamatanList = useMemo(() => {
    return [...new Set(data.map((item) => item.kecamatan))];
  }, [data]);

  const filteredData = useMemo(() => {
    if (!selectedKecamatan) return data;
    return data.filter(
      (item) => item.kecamatan === selectedKecamatan
    );
  }, [data, selectedKecamatan]);

  // ✅ HANDLE IMPORT
  const handleSubmit = (importedData) => {
    setData((prev) => [...prev, ...importedData]);
    setOpenModal(false);
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="bg-white p-6 rounded-3xl border">
        <div className="flex justify-between items-center">

          {/* TITLE */}
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
                <Wheat
                    size={28}
                    className="text-emerald-700"
                />
                </div>

                <div>
                <h3 className="text-xl font-bold text-left text-slate-800">
                    Data Luar LBS
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                    Monitoring lokasi tanam di luar
                    wilayah LBS
                </p>
                </div>
            </div>

          {/* ✅ BUTTON OPEN MODAL */}
          <button
            onClick={() => setOpenModal(true)}
            className="px-4 py-2 bg-sky-600 text-white rounded-xl"
          >
            Import Excel
          </button>
        </div>

        {/* FILTER */}
        <div className="mt-4">
          <select
            value={selectedKecamatan}
            onChange={(e) =>
              setSelectedKecamatan(e.target.value)
            }
          >
            <option value="">Semua</option>
            {kecamatanList.map((kec) => (
              <option key={kec}>{kec}</option>
            ))}
          </select>
        </div>
      </div>

      {/* TABLE */}
      <LuarLbsTable
        data={filteredData}
        onImport={() => setOpenModal(true)}
      />

      {/* ✅ MODAL */}
      <ModalLuarLbs
        openModal={openModal}
        setOpenModal={setOpenModal}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
      />
    </div>
  );
}