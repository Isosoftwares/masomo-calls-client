import axios from "axios";

const BASE_URL = "https://api.miremacallcenter.com/api";
// const BASE_URL = "http://192.168.100.90:3000/api";

export default axios.create({
  baseURL: BASE_URL,
});

export const axiosPrivate = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});
