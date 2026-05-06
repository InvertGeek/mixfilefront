import styled from "styled-components";
import DialogDiv from "../../../../common/base/DialogDiv.jsx";
import {createFolder} from "../../utils/WebDavUtils.jsx";
import {
    formatFileSize,
    getRoutePath,
    notifyMsg,
    notifyPromise,
    run,
    substringAfter
} from "../../../../../utils/CommonUtils.jsx";
import LoadingButton from "../../../../common/base/LoadingButton.jsx";
import {dialogList} from "../../../../../utils/DialogContainer.jsx";
import {openFileListDialog} from "../../../../mixformats/FileList.jsx";
import {openFileDavDialog} from "../../../../mixformats/DavList.jsx";
import {Button} from "@mui/material";
import {showConfirmWindow} from "../../../../common/base/ConfirmWindow.jsx";
import {client} from "../../../../../config.js";
import {decodeMixFile, getShareCodeUrl} from "../../../../../utils/ShareCode.js";

const Container = styled(DialogDiv)`
    > .content {
        > .infos {

        }
    }
`

export function importFile(code) {
    return createFolder(`api/${getRoutePath()}/${substringAfter(code, '://')}`)
}

export async function importFiles(code) {
    const url = getShareCodeUrl(code)
    const {fileName} = decodeMixFile(code)
    const response = await client.get(url, {
        responseType: "blob"
    })

    const uploadUrl = `api/${getRoutePath()}/${fileName}`
    await client.put(uploadUrl, response.data)
}

function FileImport({file}) {
    const {fileName, fileSize, code} = file


    const actionButtons = run(() => {

        function importAllFiles() {
            showConfirmWindow('确定导入所有文件? (同名文件会覆盖)', async () => {
                dialogList.pop()
                await notifyPromise(importFiles(code), '导入文件')
                notifyMsg('导入成功')
            })
        }

        if (fileName.endsWith(".mix_list")) {
            return (
                <>
                    <Button
                        variant={'outlined'}
                        onClick={() => {
                            openFileListDialog(code)
                        }}>
                        查看文件列表
                    </Button>
                    <Button
                        variant={'contained'}
                        onClick={importAllFiles}>
                        导入文件列表
                    </Button></>
            )
        }

        if (fileName.endsWith(".mix_dav")) {
            return (
                <>
                    <Button
                        variant={'outlined'}
                        onClick={() => {
                            openFileDavDialog(code)
                        }}>
                        查看存档文件
                    </Button>
                    <Button
                        variant={'contained'}
                        onClick={importAllFiles}>
                        导入文件存档
                    </Button>
                </>
            )
        }
        return null
    })

    return (
        <Container>
            <h4 className={'no-select'}>导入文件</h4>
            <div class="content">
                <div>文件: {fileName}</div>
                <div>大小: {formatFileSize(fileSize)}</div>
            </div>
            {actionButtons}
            <LoadingButton
                variant={'outlined'}
                onClick={async () => {
                    await notifyPromise(importFile(code), '导入文件')
                    notifyMsg('导入成功')
                    dialogList.pop()
                }}>
                导入文件
            </LoadingButton>
        </Container>
    );
}

export default FileImport;