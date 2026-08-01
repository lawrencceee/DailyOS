import api from "./api";

const TaskService = {
  async list() {
    const { data } = await api.get("/tasks");
    return data;
  },
  async get(taskId) {
    const { data } = await api.get(`/tasks/${taskId}`);
    return data;
  },
  async create(payload) {
    const { data } = await api.post("/tasks", payload);
    return data;
  },
  async update(taskId, payload) {
    const { data } = await api.put(`/tasks/${taskId}`, payload);
    return data;
  },
  async remove(taskId) {
    await api.delete(`/tasks/${taskId}`);
  },
};

export default TaskService;
