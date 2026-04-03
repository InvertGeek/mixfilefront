import {apiAddress, client} from "../../../../config.js";
import {getRoutePath} from "../../../../utils/CommonUtils.jsx";
import {addDialog} from "../../../../utils/DialogContainer.jsx";
import RenameFile from "../components/dialog/RenameFile.jsx";


export async function deleteFile(path) {
    return client({
        method: 'DELETE',
        url: path,
    });
}

export async function createFolder(path) {
    return client({
        method: 'MKCOL',
        url: path
    })
}

export async function moveFile(path, destination, overwrite = false) {
    return client({
        method: 'MOVE',
        url: path,
        headers: {
            destination: apiAddress + destination,
            overwrite: overwrite ? 'T' : 'F',
        }
    })
}

export async function copyFile(path, destination, overwrite = false) {
    return await client({
        method: 'COPY',
        url: path,
        headers: {
            destination: apiAddress + destination,
            overwrite: overwrite ? 'T' : 'F',
        }
    })
}

export async function downloadFileArchive(path = getRoutePath()) {
    const downloadPath = `api/${path}/当前目录存档.mix_dav?response-content-encoding=gzip`
    const response = await client.get(downloadPath)
    return JSON.parse(response.data.substring(4))
}

export function parsePropfindXML(xmlText) {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlText, "application/xml");

    function parseTag(element, tag) {
        return element.getElementsByTagNameNS("DAV:", tag)
    }

    function parseTagFirst(element, tag) {
        return parseTag(element, tag)?.[0]
    }

    const responses = [...parseTag(xml, "response")];

    return responses.map(response => {

        const get = (tag) =>
            parseTagFirst(response, tag)?.textContent || "";

        const prop = parseTagFirst(response, "prop");

        const href = get("href");
        const name = decodeURIComponent(get("displayname"));
        const size = parseInt(get("getcontentlength")) || 0;
        const etag = get("getetag");
        const lastModified = new Date(get("getlastmodified"));
        const mimeType = get("getcontenttype");
        const isFolder = !!parseTagFirst(prop, "collection");
        const url = (apiAddress + href).replace(/([^:]\/)\/+/g, '$1')

        return {
            name,
            isFolder,
            href,
            size,
            etag,
            mimeType,
            lastModified,
            url,
            async copyFile({path, overwrite}) {
                await copyFile(url, `api/webdav${path}/${encodeURIComponent(name)}`, overwrite)
            },
            async moveFile({path, overwrite}) {
                await moveFile(url, `api/webdav${path}/${encodeURIComponent(name)}`, overwrite)
            },
            async deleteFile() {
                await deleteFile(url)
            },
            renameFile() {
                addDialog(<RenameFile path={getRoutePath()} name={name}/>)
            }
        };
    })
}