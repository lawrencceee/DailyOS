import api from "./api";

const AuthService = {
  async login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    return data;
  },
  async register(email, password) {
    const { data } = await api.post("/auth/register", { email, password });
    return data;
  },
  async me() {
    const { data } = await api.get("/auth/me");
    return data;
  },
};

export default AuthService;
