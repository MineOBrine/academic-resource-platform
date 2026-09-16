import api, { BASE_URL } from './api'

export const resourceService = {
  // GET /api/resources
  getAll: async () => {
    const { data } = await api.get('/api/resources')
    return data
  },

  // GET /api/resources/my  (auth required)
  getMine: async () => {
    const { data } = await api.get('/api/resources/my')
    return data
  },

  // GET /api/resources/search?keyword=
  search: async (keyword) => {
    const { data } = await api.get(`/api/resources/search?keyword=${encodeURIComponent(keyword)}`)
    return data
  },

  // GET /api/resources/:id/view  (auth required)
  // Returns { fileUrl, title } — the only way to get a resource's fileUrl now,
  // since the public list/search responses omit it for anonymous requests.
  view: async (id) => {
    const { data } = await api.get(`/api/resources/${id}/view`)
    return data
  },

  // POST /api/resources  (multipart form, auth required)
  create: async (formData) => {
    const { data } = await api.post('/api/resources', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data
  },

  // DELETE /api/resources/:id  (auth required, owner or admin)
  delete: async (id) => {
    const { data } = await api.delete(`/api/resources/${id}`)
    return data
  },

  // Build the full download URL from stored filename
  getFileUrl: (filename) => filename
}