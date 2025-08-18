import {useState} from 'react';
import {TextField} from "@mui/material";
import {compressGzip, getFormattedDate} from "../../../../../utils/CommonUtils.jsx";
import {apiAddress, client} from "../../../../../config.js";
import {openFileListDialog} from "../../../../mixformats/FileList.jsx";
import DialogDiv from "../../../../common/base/DialogDiv.jsx";
import LoadingButton from "../../../../common/base/LoadingButton.jsx";


function FileExportDialog({fileList}) {

    const [listName, setListName] = useState(`文件列表-${getFormattedDate()}`)

    return (
        <DialogDiv className={'shadow'}>
            <h4 className={'no-select'}>导出文件列表</h4>
            <div class="content">
                <TextField
                    label={'文件列表名称'}
                    variant={'outlined'}
                    value={listName}
                    onChange={(event) => {
                        setListName(event.target.value.trim())
                    }}/>
            </div>
            <LoadingButton
                variant={'contained'}
                onClick={async () => {
                    const dataList = fileList.map(({name, size, shareInfoData}) => {
                        return {
                            name,
                            size,
                            category: '',
                            time: new Date().getTime(),
                            shareInfoData
                        }
                    })
                    const shareData = compressGzip(JSON.stringify(dataList))
                    const uploadAddress = `${apiAddress}api/upload?name=${encodeURIComponent(`${listName}.mix_list`)}&add=false`
                    const response = await client.put(uploadAddress, shareData)
                    openFileListDialog(response.data)
                }}>
                确认导出<
            /LoadingButton>
        </DialogDiv>

    );
}

export default FileExportDialog;
