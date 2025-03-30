import axios from "axios";
import {toast} from "react-toastify";
import axiosRetry from "axios-retry";

const params = new URLSearchParams(window.location.search);
export const apiAddress = params.get("api") ?? `${window.location.origin}/`

export const client = axios.create({
    baseURL: apiAddress
})

axiosRetry(client, {
    retries: 3,
    retryDelay: (retryCount) => {
        return retryCount * 100;
    }
});

client.interceptors.response.use((config) => {
    return config
}, (error) => {
    toast.error(`连接失败: ${error.response?.body}`, {
        position: "top-center"
    });
    return Promise.reject(error)
})
