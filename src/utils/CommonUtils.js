import {toast} from "react-toastify";

const debounceMap = {}

export function debounce(key, fn, delay) {
    if (debounceMap[key]) {
        clearTimeout(debounceMap[key])
    }
    debounceMap[key] = setTimeout(fn, delay)
}

export function notifyMsg(msg) {
    toast(msg)
}

export function formatFileSize(bytes, mb) {
    if (bytes === 0) return '0 B';
    if (mb){
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
    }
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const formattedSize = parseFloat((bytes / Math.pow(1024, i)).toFixed(2));
    return `${formattedSize} ${sizes[i]}`;
}
