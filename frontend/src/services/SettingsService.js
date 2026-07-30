import api from "./api";

/**
 * SettingsService — mirrors TaskService: the only place that knows the
 * settings endpoint's URL and payload shape. Components call these
 * functions, never api/axios directly.
 */
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
