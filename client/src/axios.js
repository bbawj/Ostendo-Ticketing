import axios from "axios";
let development = process.env.NODE_ENV !== "production";

const instance = axios.create({
  baseURL: development ? "http://localhost:5000" : "128.199.72.149",
});

export default instance;
