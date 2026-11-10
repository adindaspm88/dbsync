import { useEffect, useRef, useState } from "react";
import { MapPinned, X } from "lucide-react";

let leafletPromise;

function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L);
  if (leafletPromise) return leafletPromise;

  leafletPromise = new Promise((resolve, reject) => {
    const existingStyle = document.querySelector('link[data-leaflet-style="true"]');
    if (!existingStyle) {
      const style = document.createElement("link");
      style.rel = "stylesheet";
      style.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      style.dataset.leafletStyle = "true";
      document.head.appendChild(style);
    }

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => window.L ? resolve(window.L) : reject(new Error("Leaflet tidak tersedia."));
    script.onerror = () => reject(new Error("Leaflet gagal dimuat. Periksa koneksi internet."));
    document.body.appendChild(script);
  }).catch((error) => {
    leafletPromise = undefined;
    throw error;
  });

  return leafletPromise;
}

export default function MapLocationModal({ item, onClose }) {
  const mapElement = useRef(null);
  const [mapError, setMapError] = useState("");
  const [loading, setLoading] = useState(true);

  const latitude = Number(item?.latitude);
  const longitude = Number(item?.longitude);
  const area = Number(item?.nilai_dinas);
  const hasCoordinates = item?.latitude !== null && item?.latitude !== undefined && item?.latitude !== ""
    && item?.longitude !== null && item?.longitude !== undefined && item?.longitude !== ""
    && Number.isFinite(latitude) && Number.isFinite(longitude)
    && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;

  useEffect(() => {
    if (!item || !hasCoordinates || !mapElement.current) return undefined;
    let map;
    let active = true;

    loadLeaflet().then((L) => {
      if (!active || !mapElement.current) return;
      map = L.map(mapElement.current, { scrollWheelZoom: true, zoomControl: true });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const center = [latitude, longitude];
      const radius = Number.isFinite(area) && area > 0
        ? Math.sqrt((area * 10000) / Math.PI)
        : 30;
      const areaCircle = L.circle(center, {
        radius,
        color: "#047857",
        weight: 2,
        fillColor: "#10b981",
        fillOpacity: 0.3,
      }).addTo(map);
      L.circleMarker(center, {
        radius: 5,
        color: "#ffffff",
        weight: 2,
        fillColor: "#047857",
        fillOpacity: 1,
      }).addTo(map);

      map.fitBounds(areaCircle.getBounds(), { padding: [36, 36], maxZoom: 17 });
      window.setTimeout(() => map?.invalidateSize(), 100);
      setLoading(false);
    }).catch((error) => {
      if (!active) return;
      setMapError(error.message || "Peta tidak dapat ditampilkan.");
      setLoading(false);
    });

    return () => {
      active = false;
      map?.remove();
    };
  }, [item, latitude, longitude, area, hasCoordinates]);

  useEffect(() => {
    const onKeyDown = (event) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-sm sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="map-modal-title" className="w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 p-5 dark:border-slate-700 sm:p-6">
          <div>
            <h2 id="map-modal-title" className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-100"><MapPinned size={20} className="text-emerald-600"/>Lokasi Luar LBS</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{item.wilayah_name || "Wilayah"}{item.kecamatan ? `, Kecamatan ${item.kecamatan}` : ""} · {Number.isFinite(area) ? `${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(area)} ha` : "Luas tidak tersedia"}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup peta" className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"><X size={20}/></button>
        </header>

        <div className="relative h-[60vh] min-h-[320px] bg-slate-100 dark:bg-slate-800">
          {!hasCoordinates ? <div className="flex h-full items-center justify-center p-6 text-center text-slate-600 dark:text-slate-300">Koordinat latitude dan longitude untuk data ini tidak valid atau belum tersedia.</div> : <>
            <div ref={mapElement} className="h-full w-full" />
            {loading && !mapError && <div className="absolute inset-0 flex items-center justify-center bg-slate-100/90 text-sm text-slate-600 dark:bg-slate-800/90 dark:text-slate-200">Memuat peta…</div>}
            {mapError && <div role="alert" className="absolute inset-x-4 bottom-4 rounded-xl bg-white/95 p-3 text-sm text-red-700 shadow dark:bg-slate-900/95 dark:text-red-300">{mapError}</div>}
          </>}
        </div>
        <p className="px-5 py-3 text-xs text-slate-500 dark:text-slate-400">Lingkaran menunjukkan perkiraan luasan dalam bentuk area lingkaran berdasarkan nilai hektare; peta menyesuaikan zoom agar seluruh area terlihat.</p>
      </section>
    </div>
  );
}
