const BASE_URL = import.meta.env.VITE_PADI_API_URL || import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function getPadiData() {
  const res = await fetch(`${BASE_URL}/`);
  if (!res.ok) throw new Error("Gagal ambil data");
  return res.json();
}
