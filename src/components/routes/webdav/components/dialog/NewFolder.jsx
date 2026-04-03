import {TextField} from "@mui/material";
import {useState} from "react";
import {useLocation} from "react-router-dom";
import {dialogList} from "../../../../../utils/DialogContainer.jsx";
import DialogDiv from "../../../../common/base/DialogDiv.jsx";
import {notifyMsg} from "../../../../../utils/CommonUtils.jsx";
import {createFolder} from "../../utils/WebDavUtils.jsx";
import LoadingButton from "../../../../common/base/LoadingButton.jsx";

function NewFolder(props) {

    const path = useLocation().pathname


    const [folderName, setFolderName] = useState(``)

    return (
        <DialogDiv className={'shadow'}>
            <h4 className={'no-select'}>新建文件夹</h4>
            <div class="content">
                <TextField label={'文件夹名称'} variant={'outlined'} value={folderName} onChange={(event) => {
                    setFolderName(event.target.value.trim())
                }}/>
            </div>
            <LoadingButton
                variant={'contained'}
                disabled={!folderName.trim()}
                onClick={async () => {
                    await createFolder(`api${path}/${encodeURIComponent(folderName)}`)
                    notifyMsg('新建文件夹成功')
                    dialogList.pop()
                }}
            >
                新建文件夹
            </LoadingButton>
        </DialogDiv>
    );
}

export default NewFolder;