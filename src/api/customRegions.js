import api from '../axios.js';

export const customRegionsAPI = {
  // Query endpoints
  getAll(skip = 0, limit = 50, search = '') {
    return api.get('/custom-regions/all', { params: { skip, limit, search } })
      .then(res => res.data);
  },

  getUserRegions(username) {
    return api.get('/custom-regions/user', { params: { username } })
      .then(res => res.data);
  },

  getCount() {
    return api.get('/custom-regions/count').then(res => res.data);
  },

  getStats() {
    return api.get('/custom-regions/stats').then(res => res.data);
  },

  // Edit endpoints
  create(data) {
    return api.post('/custom-regions/create', data).then(res => res.data);
  },

  update(data) {
    return api.put('/custom-regions/update', data).then(res => res.data);
  },

  delete(data) {
    return api.delete('/custom-regions/delete', { data }).then(res => res.data);
  },

  batchDelete(dataList) {
    return api.post('/custom-regions/batch-delete', dataList).then(res => res.data);
  }
};
