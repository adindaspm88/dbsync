import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Wheat,
} from "lucide-react";

import { useParams } from "react-router-dom";
import ComparisonTable from "../../components/tables/ComparisonTable";
import ModalInput from "../../components/modal/ModalInput";

export default function PerbandinganPadi() {
  const { kode_variabel } = useParams();

  const [data, setData] = useState([]);
  
  /* SEARCH */
  const [search, setSearch] = useState("");

  // Modal
  const [openModal, setOpenModal] =
  useState(false);

  const [selectedItem, setSelectedItem] =
    useState(null);

  const [formData, setFormData] = useState({
    nilai_dinas: "",
    satuan_dinas: "",
    narasi_dinas: "",
  });
  
  useEffect(() => {
    const staticData = [
      {
        kode_variabel: "PROD_PADI",
        kode_kabupaten: "3201",
        tahun: 2025,
        bulan: "Januari",
        nilai_bps: 125000,
        satuan_bps: 'ton',
        nilai_dinas: 127500,
        satuan_dinas: 'ton',
        narasi_dinas:
          "Perbedaan disebabkan adanya pembaruan data laporan panen dari kecamatan.",
      },

      {
        kode_variabel: "PROD_PADI",
        kode_kabupaten: "3202",
        tahun: 2025,
        bulan: "Februari",
        nilai_bps: 98000,
        satuan_bps: 'ton',
        nilai_dinas: 95000,
        satuan_dinas: 'ton',
        narasi_dinas:
          "Data dinas masih menggunakan rekap sementara sebelum validasi akhir.",
      },

      {
        kode_variabel: "PROD_PADI",
        kode_kabupaten: "3202",
        tahun: 2025,
        bulan: "Maret",
        nilai_bps: 98000,
        satuan_bps: 'ton',
        nilai_dinas: null,
        satuan_dinas: null,
        narasi_dinas: null,
      },

      {
        kode_variabel: "PROD_BERAS",
        kode_kabupaten: "3202",
        tahun: 2025,
        bulan: "Februari",
        nilai_bps: 88000,
        satuan_bps: 'ton',
        nilai_dinas: 91000,
        satuan_dinas: 'ton',
        narasi_dinas:
          "Perbedaan data berasal dari pembaruan laporan penggilingan.",
      },
    ];

    /* FILTER SESUAI URL */
    const filtered =
      staticData.filter(
        (item) =>
          item.kode_variabel ===
          kode_variabel
      );

    setData(filtered);
  }, [kode_variabel]);

  /* VARIABLES */
  const variables = useMemo(() => {
    return [
      ...new Set(
        data.map(
          (item) => item.kode_variabel
        )
      ),
    ];
  }, [data]);

  /* GROUP DATA */
  const groupedData = useMemo(() => {
    return Object.values(
      data.reduce((acc, item) => {
        const key = `${item.kode_kabupaten}-${item.bulan}-${item.tahun}`;

        if (!acc[key]) {
          acc[key] = {
            kode_kabupaten:
              item.kode_kabupaten,
            bulan: item.bulan,
            tahun: item.tahun,
            variabels: {},
          };
        }

        acc[key].variabels[
          item.kode_variabel
        ] = {
          nilai_bps: item.nilai_bps,
          satuan_bps: item.satuan_bps,
          nilai_dinas:
            item.nilai_dinas,
          satuan_dinas: item.satuan_dinas,
          gap:
            item.nilai_dinas -
            item.nilai_bps,
          narasi:
            item.narasi_dinas,
        };

        return acc;
      }, {})
    );
  }, [data]);

  

  /* FILTER SEARCH */
  const filteredGroupedData = useMemo(() => {
    if (!search) return groupedData;

    return groupedData.filter((row) => {
      const keyword = search.toLowerCase();

      /* wilayah + periode */
      const mainMatch =
        row.kode_kabupaten
          .toLowerCase()
          .includes(keyword) ||
        row.bulan
          .toLowerCase()
          .includes(keyword) ||
        String(row.tahun).includes(keyword);

      /* variabel */
      const variableMatch = Object.entries(
        row.variabels
      ).some(([key, value]) => {
        return (
          key.toLowerCase().includes(keyword) ||
          value.narasi
            ?.toLowerCase()
            .includes(keyword)
        );
      });

      return mainMatch || variableMatch;
    });
  }, [groupedData, search]);

  // OPEN MODAL
  const handleOpenModal = (
    row,
    variable,
    item
  ) => {
    setSelectedItem({
      row,
      variable,
      isEdit: !!item,
    });

    setFormData({
      nilai_dinas:
        item?.nilai_dinas || "",
      satuan_dinas:
        item?.satuan_dinas || "",
      narasi_dinas:
        item?.narasi || "",
    });

    setOpenModal(true);
  };

  const handleSubmit = () => {
    let found = false;

    const updated = data.map((item) => {
      if (
        item.kode_variabel ===
          selectedItem.variable &&
        item.kode_kabupaten ===
          selectedItem.row.kode_kabupaten &&
        item.bulan ===
          selectedItem.row.bulan &&
        item.tahun ===
          selectedItem.row.tahun
      ) {
        found = true;

        return {
          ...item,
          nilai_dinas: Number(
            formData.nilai_dinas
          ),
          satuan_dinas:
            formData.satuan_dinas,
          narasi_dinas:
            formData.narasi_dinas,
        };
      }

      return item;
    });

    // kalau data belum ada
    if (!found) {
      updated.push({
        kode_variabel:
          selectedItem.variable,
        kode_kabupaten:
          selectedItem.row.kode_kabupaten,
        bulan: selectedItem.row.bulan,
        tahun: selectedItem.row.tahun,

        nilai_bps: 0,
        satuan_bps: "",

        nilai_dinas: Number(
          formData.nilai_dinas
        ),
        satuan_dinas:
          formData.satuan_dinas,
        narasi_dinas:
          formData.narasi_dinas,
      });
    }

    setData(updated);

    setOpenModal(false);
  };
  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="bg-white border border-sky-100 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center">
                <Wheat
                  size={24}
                  className="text-sky-700"
                />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  Tabel Perbandingan Data{" "}
                  {kode_variabel}
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Monitoring data statistik BPS dan Dinas
                </p>
              </div>
            </div>
          </div>

          {/* SEARCH */}
          <div className="w-full md:w-80">
            <input
              type="text"
              placeholder="Cari wilayah, bulan, variabel..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>
        </div>
      </div>

      <ComparisonTable
        groupedData={filteredGroupedData}
        variables={variables}
        onEdit={handleOpenModal}
      />
      <ModalInput
        openModal={openModal}
        setOpenModal={setOpenModal}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isEdit={selectedItem?.isEdit}
      />
    </div>
  );
}