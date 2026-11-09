import { useFilter } from "../../context/FilterContext";

export default function GlobalFilter() {
  const { wilayah, setWilayah, tahun, setTahun } = useFilter();

  return (
    <div className="bg-white p-4 rounded-2xl shadow mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      
      <div>
        <label className="text-sm font-semibold">Wilayah</label>
        <select
          value={wilayah}
          onChange={(e) => setWilayah(e.target.value)}
          className="w-full mt-1 border rounded-lg p-2"
        >
          <option value="3200">Jawa Barat</option>
          <option value="3210">Kabupaten A</option>
          <option value="3220">Kabupaten B</option>
        </select>
      </div>

      <div>
        <label className="text-sm font-semibold">Tahun</label>
        <select
          value={tahun}
          onChange={(e) => setTahun(e.target.value)}
          className="w-full mt-1 border rounded-lg p-2"
        >
          <option value={2023}>2023</option>
          <option value={2024}>2024</option>
          <option value={2025}>2025</option>
        </select>
      </div>

    </div>
  );
}