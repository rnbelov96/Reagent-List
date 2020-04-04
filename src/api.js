import axios from 'axios';

const api = axios.create({
  baseURL: 'https://roh7771-reagent-api.glitch.me/api/v1/substances',
  timeout: 30000,
});

const onSuccess = response => response;

const onFail = err => {
  throw err;
};

api.interceptors.response.use(onSuccess, onFail);

export default api;
