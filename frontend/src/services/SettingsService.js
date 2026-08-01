import api from "./api";

const SettingsService = {
  async get() {
    const { data } = await api.get("/settings");
    return data;
  },
  async update(payload) {
    const { data } = await api.put("/settings", payload);
    return data;
  },
};

export default SettingsService;
