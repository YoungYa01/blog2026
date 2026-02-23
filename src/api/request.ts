import axios, { AxiosRequestConfig } from "axios";

import { Response } from "@/types/models/response.ts";
import { getToken, removeToken } from "@/utils/localstorage.ts";

console.log("import.meta.env.VITE_BASE_URL", import.meta.env.VITE_BASE_URL);

const request = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

request.interceptors.request.use((config) => {
  if (!config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${getToken()}`;
  }

  return config;
});

request.interceptors.response.use(
  (response) => {

    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      window.location.reload();
    }

    return Promise.reject(error.response.data);
  },
);

const http = {
  get: <T>(url: string, config?: AxiosRequestConfig) => {
    // <any, Response<T>>: 第一个参数是 Axios 默认推断的 ResponseBody，第二个参数 R 是实际 resolve 的值
    return request.get<any, Response<T>>(url, config);
  },

  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) => {
    return request.post<any, Response<T>>(url, data, config);
  },

  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) => {
    return request.put<any, Response<T>>(url, data, config);
  },

  delete: <T>(url: string, config?: AxiosRequestConfig) => {
    return request.delete<any, Response<T>>(url, config);
  },
};

export { http, request };
