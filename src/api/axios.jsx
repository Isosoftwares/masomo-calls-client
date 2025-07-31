import axios from "axios";

const BASE_URL = "https://api.miremacallcenter.com/api";
// const BASE_URL = "https://j5rgfbf5-3000.euw.devtunnels.ms/api";

export default axios.create({
  baseURL: BASE_URL,
});

export const axiosPrivate = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});
