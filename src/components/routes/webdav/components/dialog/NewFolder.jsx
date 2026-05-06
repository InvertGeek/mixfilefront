import {TextField} from "@mui/material";
import {useEffect, useId, useState} from "react";
import {useLocation} from "react-router-dom";
import {dialogList} from "../../../../../utils/DialogContainer.jsx";
import DialogDiv from "../../../../common/base/DialogDiv.jsx";
import {notifyMsg} from "../../../../../utils/CommonUtils.jsx";
import {createFolder} from "../../utils/WebDavUtils.jsx";
import LoadingButton from "../../../../common/base/LoadingButton.jsx";


function NewFolder(props) {
    const path = useLocation().pathname;
    const [folderName, setFolderName] = useState(``);

    // 1. 定义 ID
    const buttonId = useId();
    const inputId = useId();

    // 2. 自动聚焦
    useEffect(() => {
        document.getElementById(inputId)?.focus();
    }, []);

    return (
        <DialogDiv className={'shadow'}>
            <h4 className={'no-select'}>新建文件夹</h4>
            <div className="content">
                <TextField
                    id={inputId} // 绑定输入框 ID
                    label={'文件夹名称'}
                    variant={'outlined'}
                    value={folderName}
                    onKeyDown={(e) => {
                        // 3. 回车模拟点击按钮
                        if (e.key === 'Enter' && folderName.trim()) {
                            document.getElementById(buttonId)?.click();
                        }
                    }}
                    onChange={(event) => {
                        setFolderName(event.target.value);
                    }}
                />
            </div>
            <LoadingButton
                id={buttonId} // 绑定按钮 ID
                variant={'contained'}
                disabled={!folderName.trim()}
                onClick={async () => {
                    await createFolder(`api${path}/${encodeURIComponent(folderName.trim())}`);
                    notifyMsg('新建文件夹成功');
                    dialogList.pop();
                }}
            >
                新建文件夹
            </LoadingButton>
        </DialogDiv>
    );
}

export default NewFolder;