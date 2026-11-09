import api from "./api";

export const getLuarLbsData = async (kode = "PAD", tahun) =>
  (await api.get(`/modules/${kode}/luar-lbs`, { params: { tahun } })).data;

export const saveLuarLbs = async (payload) => (await api.post("/luar-lbs", payload)).data;

export async function importLuarLbs(file, variabelId = 3) {
  const form = new FormData();
  form.append("sumber", "dinas");
  form.append("variabel_id", String(variabelId));
  form.append("file", file);
  return (await api.post("/import", form)).data;
}
