import axios from "axios";

// const BASE_URL = "https://calls-api.tweetyservices.org/api";
const BASE_URL = "http://192.168.100.54:3000/api";

export default axios.create({
  baseURL: BASE_URL,
});

export const axiosPrivate = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});
