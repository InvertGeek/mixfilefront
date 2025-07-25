import {toast} from "react-toastify";
import moment from "moment";
import axios from "axios";
import pako from "pako";
import {apiAddress} from "../config.js";

const debounceMap = {}

export function debounce(key, fn, delay) {
    if (debounceMap[key]) {
        clearTimeout(debounceMap[key])
    }
    debounceMap[key] = setTimeout(fn, delay)
}

export function notifyMsg(msg, options) {
    toast(msg, options)
}

export function notifyError(msg, options) {
    toast.error(msg, options)
}


export function formatFileSize(bytes, mb) {
    if (bytes === 0) return '0 B';
    if (mb && bytes > 1024 * 1024) {
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
    }
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const formattedSize = parseFloat((bytes / Math.pow(1024, i)).toFixed(2));
    return `${formattedSize} ${sizes[i]}`;
}

export function getFormattedDate() {
    return moment().format('YYYY-MM-DD HH:mm:ss');
}

export async function fetchMixGzipTextData(code) {
    const downloadAddress = `${apiAddress}api/download?s=${code}`
    const fileData = (await axios.get(downloadAddress, {
        responseType: 'arraybuffer'
    })).data
    const decoder = new TextDecoder('utf-8');
    const originalRaw = pako.ungzip(fileData)
    return decoder.decode(originalRaw)
}

function extractNumber(str, start) {
    let result = 0;
    let i = start;
    while (i < str.length && /\d/.test(str[i])) {
        result = result * 10 + (str.charCodeAt(i) - 48);
        i++;
    }
    return result;
}

export function compareByName(a, b) {
    let i1 = 0, i2 = 0;
    while (i1 < a.length && i2 < b.length) {
        if (/\d/.test(a[i1]) && /\d/.test(b[i2])) {
            const n1 = extractNumber(a, i1);
            const n2 = extractNumber(b, i2);
            i1 += n1.toString().length;
            i2 += n2.toString().length;
            if (n1 !== n2) return n1 - n2;
        } else {
            if (a[i1] !== b[i2]) return a[i1].charCodeAt(0) - b[i2].charCodeAt(0);
            i1++;
            i2++;
        }
    }
    return a.length - b.length;
}