import api from "./api";

export const getModules = async () => (await api.get("/modules")).data;
export const getModuleVariables = async (kode) => (await api.get(`/modules/${kode}/variables`)).data;
export const getLookups = async () => (await api.get("/lookups")).data;
export const getDashboardData = async (kode, tahun, wilayah_id) =>
  (await api.get(`/modules/${kode}/dashboard`, { params: { tahun, wilayah_id } })).data;
export const getCard = async (tahun, kode) =>
  (await api.get(`/modules/${kode}/dashboard`, { params: { tahun } })).data;
export const getChart = async (wilayah_id, tahun, variabel_id) =>
  (await api.get("/dashboard/chart", { params: { wilayah_id, tahun, variabel_id } })).data;
