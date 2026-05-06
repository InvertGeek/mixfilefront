import useProxyState from "../../../../../hooks/useProxyState.js";
import DialogDiv from "../../../../common/base/DialogDiv.jsx";
import {TextField} from "@mui/material";
import LoadingButton from "../../../../common/base/LoadingButton.jsx";
import {
    compressGzip,
    copyText,
    getRoutePath,
    notifyPromise,
    substringAfterLast
} from "../../../../../utils/CommonUtils.jsx";
import {dialogList} from "../../../../../utils/DialogContainer.jsx";
import {apiAddress, client} from "../../../../../config.js";
import {webDavState} from "../../state/WebDavState.js";
import {downloadFileArchive} from "../../utils/WebDavUtils.jsx";
import {resolveMixFile} from "../../../../common/base/FileResolve.jsx";
import {useEffect, useId} from "react";

export async function shareSelectedFiles(name) {
    const jsonData = await downloadFileArchive()
    const selectedNames = new Set(webDavState.selectedFiles.map(file => file.name))
    const {files} = jsonData
    for (const key in files) {
        if (!selectedNames.has(key)) {
            delete files[key]
        }
    }
    const uploadAddress = `${apiAddress}api/upload?name=${encodeURIComponent(`${name}.mix_dav`)}&add=false`
    const uploadResponse = await client.put(uploadAddress, compressGzip(`V2_:\n${JSON.stringify(jsonData)}`))
    return uploadResponse.data
}

function FileShare(props) {

    const buttonId = useId()
    const inputId = useId()

    const state = useProxyState({
        name: decodeURIComponent(substringAfterLast(getRoutePath(), '/')),
    })

    const {name} = state;

    useEffect(() => {
        document.getElementById(inputId)?.focus();
    }, [])


    return (
        <DialogDiv className={'shadow'}>
            <h4 className={'no-select'}>分享文件</h4>
            <div class="content">
                <TextField
                    id={inputId}
                    label={'分享名称'}
                    variant={'outlined'}
                    value={name}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            document.getElementById(buttonId)?.click();
                        }
                    }}
                    onChange={(event) => {
                        state.name = event.target.value
                    }}/>
            </div>
            <LoadingButton
                id={buttonId}
                variant={'contained'}
                onClick={async () => {
                    const code = await notifyPromise(shareSelectedFiles(name.trim()), '分享文件')
                    dialogList.pop()
                    copyText(code)
                    resolveMixFile(code)
                }}>
                生成分享码
            </LoadingButton>
        </DialogDiv>
    );
}

export default FileShare;