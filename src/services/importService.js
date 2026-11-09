import api from "./api";

export const importData = async (file, sumber, variabelId) => {
  const form = new FormData();
  form.append("sumber", sumber.toLowerCase());
  form.append("variabel_id", String(variabelId));
  form.append("file", file);
  return (await api.post("/import", form)).data;
};
