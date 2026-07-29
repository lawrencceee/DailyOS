import api from "./api";

/**
 * TaskService — the ONLY place in the frontend that knows the Task API's
 * URLs and payload shapes. Components call these functions; they never
 * call axios/api directly. This mirrors the backend's controller/service
 * split: components are the "UI controller", this is the "client-side
 * service layer".
 */
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
