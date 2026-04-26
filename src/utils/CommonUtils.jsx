import {ref} from "valtio";
import copy from "copy-to-clipboard";
import toast from "react-hot-toast";
import {CircularProgress} from "@mui/material";

import {gzipSync, strToU8} from "fflate";
import dayjs from "dayjs";
import * as JsCrypto from "jscrypto";

const debounceMap = {}

export function sha256(message) {
    return JsCrypto.SHA256.hash(message).toString(JsCrypto.Hex);
}

export function run(func, ...args) {
    return func(...args)
}

/**
 * gzip 压缩字符串或对象
 * @param {any} data - 要压缩的数据，支持对象、数组、字符串
 * @param {boolean} [toBuffer=false] - 是否返回 ArrayBuffer，默认返回 Uint8Array
 * @returns {Uint8Array|ArrayBuffer}
 */
export function compressGzip(data, toBuffer = false) {
    const str = typeof data === 'string' ? data : JSON.stringify(data);
    const compressed = gzipSync(strToU8(str));
    return toBuffer ? compressed.buffer : compressed;
}


export function debounce(key, fn, delay) {
    if (debounceMap[key]) {
        clearTimeout(debounceMap[key])
    }
    debounceMap[key] = setTimeout(fn, delay)
}

export function notifyMsg(msg, options) {
    return toast.success(msg, options)
}

export function notifyError(msg, options) {
    return toast.error(msg, options)
}

export function notifyPromise(promise, msg, options) {
    return toast.promise(promise, {loading: msg}, {icon: <CircularProgress size={20}/>, ...options})
}

export function getRoutePath() {
    return window.location.hash.substring(1)
}

export async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
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

export function getFormattedDate(date = new Date()) {
    return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
}

export function noProxy(obj) {
    if (typeof obj !== 'object' || obj === null) {
        return obj; // 如果不是对象或为null，直接返回
    }
    return ref(obj)
}

export function safeInterval(fn, interval, {immediate = false} = {}) {
    let stopped = false;

    const run = async () => {
        if (!immediate) await sleep(interval); // 如果不是立即执行，先等一轮
        while (!stopped) {
            try {
                await fn();
            } catch (e) {
                console.error(e);
            }
            if (stopped) break;
            await sleep(interval);
        }
    };

    run();

    return () => {
        stopped = true;
    };
}

export function saveBlob(data, fileName) {
    // 1. 统一转成 Blob
    const blob = data instanceof Blob
        ? data
        : new Blob([data]);

    // 2. 创建临时 URL
    const url = URL.createObjectURL(blob);

    // 3. 创建隐藏 <a> 并触发点击
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || 'download';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();

    // 4. 清理：DOM 节点 & 临时 URL
    document.body.removeChild(a);
    // 浏览器事件循环结束后释放更安全
    setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function reverseSort(compareFn) {
    return (a, b) => compareFn(b, a); // 反转 a 和 b 的位置
}

export function copyText(text) {
    copy(text)
    notifyMsg('复制成功')
}


export function getURLParam(key) {
    const url = new URL(window.location.href);
    return url.searchParams.get(key);
}

export function substringAfter(str, delimiter) {
    const index = str.indexOf(delimiter);
    if (index === -1) return str; // 没有找到分隔符返回空字符串
    return str.substring(index + delimiter.length);
}

export function substringAfterLast(str, delimiter) {
    const index = str.lastIndexOf(delimiter);
    if (index === -1) return str; // 没找到分隔符就返回原字符串
    return str.substring(index + delimiter.length);
}

export function getParentPath(path = getRoutePath()) {
    if (!path) return "";

    // 去掉结尾的 /，避免空段
    let normalized = path.replace(/\/+$/, "");

    // 找到最后一个 /
    const lastSlash = normalized.lastIndexOf("/");

    if (lastSlash === -1) {
        return ""; // 没有父路径
    }

    return normalized.substring(0, lastSlash) || "/";
}


export function deepEqual(a, b) {
    // 基本类型和引用类型直接比较
    if (a === b) return true;

    // 不是对象，直接返回 false
    if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
        return false;
    }

    // 获取对象的键集合，如果是数组，则是索引集合
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);

    // 如果键的数量不相同，直接返回 false
    if (aKeys.length !== bKeys.length) return false;

    // 比较键及其对应的值
    return aKeys.every(key => b.hasOwnProperty(key) && deepEqual(a[key], b[key]));
}

/**
 * 优化后的 Windows 文件名自然排序算法
 */
export function compareByName(a, b) {
    if (a === b) return 0;

    const len1 = a.length;
    const len2 = b.length;
    let i = 0;
    let j = 0;

    while (i < len1 && j < len2) {
        let c1 = a.charCodeAt(i);
        let c2 = b.charCodeAt(j);

        // 判断是否为数字 (0-9)
        const isDig1 = c1 >= 48 && c1 <= 57;
        const isDig2 = c2 >= 48 && c2 <= 57;

        if (isDig1 && isDig2) {
            let start1 = i;
            let start2 = j;

            // 跳过前导零，但保留最后一个零（如果是全零的情况）
            while (i < len1 - 1 && a.charCodeAt(i) === 48) {
                const next = a.charCodeAt(i + 1);
                if (next < 48 || next > 57) break;
                i++;
            }
            while (j < len2 - 1 && b.charCodeAt(j) === 48) {
                const next = b.charCodeAt(j + 1);
                if (next < 48 || next > 57) break;
                j++;
            }

            let valStart1 = i;
            let valStart2 = j;

            while (i < len1 && (c1 = a.charCodeAt(i)) >= 48 && c1 <= 57) i++;
            while (j < len2 && (c2 = b.charCodeAt(j)) >= 48 && c2 <= 57) j++;

            const numLen1 = i - valStart1;
            const numLen2 = j - valStart2;

            // 长度不同，数值大的字符串肯定长
            if (numLen1 !== numLen2) return numLen1 - numLen2;

            // 长度相同，逐位比较
            for (let k = 0; k < numLen1; k++) {
                const diff = a.charCodeAt(valStart1 + k) - b.charCodeAt(valStart2 + k);
                if (diff !== 0) return diff;
            }

            // 数值完全一样，比较含前导零的原始长度 (短的在前)
            const fullLen1 = i - start1;
            const fullLen2 = j - start2;
            if (fullLen1 !== fullLen2) return fullLen1 - fullLen2;

        } else {
            if (c1 !== c2) {
                // 转小写比较 (仅限 A-Z)
                const low1 = (c1 >= 65 && c1 <= 90) ? c1 + 32 : c1;
                const low2 = (c2 >= 65 && c2 <= 90) ? c2 + 32 : c2;

                if (low1 !== low2) return low1 - low2;
                // 如果小写相同但原始码点不同（如 'a' vs 'A'），保持稳定排序
                return c1 - c2;
            }
            i++;
            j++;
        }
    }

    return len1 - len2;
}