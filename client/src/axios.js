import axios from "axios";
let development = process.env.NODE_ENV !== "production";

const instance = axios.create({
  baseURL: development
    ? "http://localhost:5000"
    : "https://ntucarpool.herokuapp.com",
});

export default instance;
