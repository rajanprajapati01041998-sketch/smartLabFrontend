import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.31.237:5021/api/', 
  // baseURL: 'https://192.168.31.237:5022/api/', 
  // http://192.168.31.205:5021
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;