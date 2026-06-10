import axios from "axios";

const LAVALINK_BASE = "http://in6.quvera.cloud:1984";
const LAVALINK_PASSWORD = "AeroX";

export const axiosInstance = axios.create({
  baseURL: LAVALINK_BASE,
  headers: {
    Authorization: LAVALINK_PASSWORD,
    "Content-Type": "application/json",
  },
});

export const apiConnector = (method, url, bodyData, headers, params) => {
  return axiosInstance({
    method: method,
    url: url,
    data: bodyData ? bodyData : null,
    headers: headers ? headers : null,
    params: params ? params : null,
  });
};
