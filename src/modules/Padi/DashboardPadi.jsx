import { useState } from "react";
import {
  Wheat,
  TrendingUp,
  MapPinned,
  CalendarDays,
} from "lucide-react";

import CardProgress from "../../components/charts/CardProgress";
import FilterCard from "../../components/filters/FilterCard";
import LineChart from "../../components/charts/LineChart";
import BarChartCard from "../../components/charts/BarChartCard";

const data = [
  {
    kode_variabel: "PROD_PADI",
    kode_kabupaten: "3200",
    tahun: 2024,
    bulan: "januari",

    nilai_bps: 477312.18,
    satuan_bps: "Ton",
    status: "Tetap",

    nilai_dinas: 482100.52,
    satuan_dinas: "Ton",

    narasi_dinas:
      "Perbedaan disebabkan adanya pembaruan laporan luas panen dari beberapa kecamatan yang belum masuk saat rilis BPS.",

    is_verified: true,
  },

  {
    kode_variabel: "PROD_PADI",
    kode_kabupaten: "3200",
    tahun: 2024,
    bulan: "februari",

    nilai_bps: 599116.5,
    satuan_bps: "Ton",
    status: "Tetap",

    nilai_dinas: 590004.11,
    satuan_dinas: "Ton",

    narasi_dinas:
      "Data dinas lebih rendah karena terdapat koreksi terhadap estimasi panen awal.",

    is_verified: true,
  },

  {
    kode_variabel: "PROD_PADI",
    kode_kabupaten: "3201",
    tahun: 2024,
    bulan: "maret",

    nilai_bps: 1322270.78,
    satuan_bps: "Ton",
    status: "Tetap",

    nilai_dinas: 1345100.24,
    satuan_dinas: "Ton",

    narasi_dinas:
      "Dinas memasukkan tambahan laporan hasil panen dari wilayah terdampak banjir yang sebelumnya belum tervalidasi.",

    is_verified: false,
  },

  {
    kode_variabel: "PROD_BERAS",
    kode_kabupaten: "3201",
    tahun: 2025,
    bulan: "januari",

    nilai_bps: 842312.22,
    satuan_bps: "Ton",
    status: "Sementara",

    nilai_dinas: 856210.91,
    satuan_dinas: "Ton",

    narasi_dinas:
      "Perbedaan masih dalam proses sinkronisasi antar instansi terkait data produksi beras bulanan.",

    is_verified: false,
  },

  {
    kode_variabel: "LUAS_PANEN",
    kode_kabupaten: "3202",
    tahun: 2025,
    bulan: "februari",

    nilai_bps: 218995.7,
    satuan_bps: "Ha",
    status: "Sementara",

    nilai_dinas: 220154.8,
    satuan_dinas: "Ha",

    narasi_dinas:
      "Dinas menggunakan hasil monitoring lapangan terbaru sehingga terdapat sedikit selisih dibandingkan data BPS.",

    is_verified: true,
  },

  {
    kode_variabel: "PROD_PADI",
    kode_kabupaten: "3203",
    tahun: 2025,
    bulan: "maret",

    nilai_bps: 930552.12,
    satuan_bps: "Ton",
    status: "Tetap",

    nilai_dinas: 930552.12,
    satuan_dinas: "Ton",

    narasi_dinas:
      "Tidak terdapat perbedaan antara data BPS dan data dinas.",

    is_verified: true,
  },

  {
    kode_variabel: "PROD_BERAS",
    kode_kabupaten: "3204",
    tahun: 2025,
    bulan: "april",

    nilai_bps: 512221.33,
    satuan_bps: "Ton",
    status: "Sementara",

    nilai_dinas: 500876.1,
    satuan_dinas: "Ton",

    narasi_dinas:
      "Sebagian data penggilingan padi masih menunggu verifikasi administrasi dari kabupaten.",

    is_verified: false,
  },

  {
    kode_variabel: "LUAS_PANEN",
    kode_kabupaten: "3205",
    tahun: 2025,
    bulan: "mei",

    nilai_bps: 145200.88,
    satuan_bps: "Ha",
    status: "Tetap",

    nilai_dinas: 146050.22,
    satuan_dinas: "Ha",

    narasi_dinas:
      "Perbedaan berasal dari pembaruan data lahan sawah yang baru selesai diverifikasi.",

    is_verified: true,
  },
];

const monthOrder = [
  "januari",
  "februari",
  "maret",
  "april",
  "mei",
  "juni",
  "juli",
  "agustus",
  "september",
  "oktober",
  "november",
  "desember",
];

export default function DashboardPadi() {
  const [selectedVariable, setSelectedVariable] =
    useState("");

  const [selectedRegion, setSelectedRegion] =
    useState("All");

  const latestYear = Math.max(
    ...data.map((item) => item.tahun)
  );

  const [selectedYear, setSelectedYear] =
    useState(latestYear);

  const regions = [
    {
      value: "3200",
      label: "Provinsi Jawa Barat",
    },
    {
      value: "3201",
      label: "Kabupaten Bogor",
    },
    {
      value: "3202",
      label: "Kabupaten Sukabumi",
    },
    {
      value: "3203",
      label: "Kabupaten Cianjur",
    },
    {
      value: "3204",
      label: "Kabupaten Bandung",
    },
    {
      value: "3205",
      label: "Kabupaten Garut",
    },
    {
      value: "3206",
      label: "Kabupaten Tasikmalaya",
    },
    {
      value: "3207",
      label: "Kabupaten Ciamis",
    },
    {
      value: "3208",
      label: "Kabupaten Kuningan",
    },
    {
      value: "3209",
      label: "Kabupaten Cirebon",
    },
    {
      value: "3210",
      label: "Kabupaten Majalengka",
    },
    {
      value: "3211",
      label: "Kabupaten Sumedang",
    },
    {
      value: "3212",
      label: "Kabupaten Indramayu",
    },
    {
      value: "3213",
      label: "Kabupaten Subang",
    },
    {
      value: "3214",
      label: "Kabupaten Purwakarta",
    },
    {
      value: "3215",
      label: "Kabupaten Karawang",
    },
    {
      value: "3216",
      label: "Kabupaten Bekasi",
    },
    {
      value: "3217",
      label: "Kabupaten Bandung Barat",
    },
    {
      value: "3218",
      label: "Kabupaten Pangandaran",
    },
    {
      value: "3271",
      label: "Kota Bogor",
    },
    {
      value: "3272",
      label: "Kota Sukabumi",
    },
    {
      value: "3273",
      label: "Kota Bandung",
    },
    {
      value: "3274",
      label: "Kota Cirebon",
    },
    {
      value: "3275",
      label: "Kota Bekasi",
    },
    {
      value: "3276",
      label: "Kota Depok",
    },
    {
      value: "3277",
      label: "Kota Cimahi",
    },
    {
      value: "3278",
      label: "Kota Tasikmalaya",
    },
    {
      value: "3279",
      label: "Kota Banjar",
    },
  ];

  const years = [
    ...new Set(data.map((item) => item.tahun)),
  ].sort((a, b) => b - a);

  /* FILTER */
  const filteredData = data
    .filter((item) => {
      return (
        (selectedVariable === "" ||
          item.kode_variabel === selectedVariable) &&
        (selectedRegion === "All" ||
          item.kode_kabupaten === selectedRegion) &&
        item.tahun === selectedYear
      );
    })
    .reduce((acc, item) => {
      if (!acc[item.bulan]) {
        acc[item.bulan] = {
          month: item.bulan,
          nilai_bps: 0,
          nilai_dinas: 0,
        };
      }

      acc[item.bulan].nilai_bps += item.nilai_bps;
      acc[item.bulan].nilai_dinas += item.nilai_dinas;

      return acc;
    }, {});

  const chartData = Object.values(filteredData).sort(
    (a, b) =>
      monthOrder.indexOf(a.month) -
      monthOrder.indexOf(b.month)
  );

  /* DATA YANG SUDAH TERFILTER */
  const filteredSourceData = data.filter((item) => {
    return (
      (selectedVariable === "" ||
        item.kode_variabel === selectedVariable) &&
      (selectedRegion === "All" ||
        item.kode_kabupaten === selectedRegion) &&
      item.tahun === selectedYear
    );
  });

  /* CARD DATA */
  const cardData = Object.values(
    filteredSourceData.reduce((acc, item) => {
      const key = item.kode_variabel;

      if (!acc[key]) {
        acc[key] = {
          title: item.kode_variabel,
          value: 0,
          satuan: item.satuan_bps,
        };
      }

      acc[key].value += item.nilai_bps;

      return acc;
    }, {})
  );

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
                <h3 className="text-2xl font-bold text-left text-slate-800">
                  Dashboard Statistik Padi
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Monitoring data statistik pertanian
                  BPS dan Dinas
                </p>
              </div>
            </div>
          </div>

          {/* INFO BADGE */}
          <div className="flex flex-wrap gap-3">
            <div className="bg-sky-50 border border-sky-100 px-4 py-3 rounded-2xl">
              <div className="flex items-center gap-2">
                <CalendarDays
                  size={18}
                  className="text-sky-700"
                />

                <div>
                  <p className="text-xs text-slate-500">
                    Tahun Aktif
                  </p>

                  <p className="font-semibold text-slate-700">
                    {selectedYear}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-sky-50 border border-sky-100 px-4 py-3 rounded-2xl">
              <div className="flex items-center gap-2">
                <MapPinned
                  size={18}
                  className="text-sky-700"
                />

                <div>
                  <p className="text-xs text-slate-500">
                    Wilayah
                  </p>

                  <p className="font-semibold text-slate-700"> 
                    {
                      regions.find(
                        (r) => r.value === selectedRegion
                      )?.label || "Semua Wilayah"
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER */}
      <FilterCard
        selectedVariable={selectedVariable}
        setSelectedVariable={setSelectedVariable}
        selectedRegion={selectedRegion}
        setSelectedRegion={setSelectedRegion}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        regions={regions}
        years={years}
      />

      {/* CARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-5">
        {cardData.map((item, index) => (
          <CardProgress
            key={index}
            title={item.title}
            value={Number(item.value).toFixed(2)}
            color="#38bdf8"
            kodeVariabel={item.title.replace(/\s+/g, "_")}
            satuan={item.satuan}
          />
        ))}
      </div>

      {/* CHART */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <BarChartCard data={chartData} />  
          <LineChart data={chartData} />
        </div>
    </div>
  );
}