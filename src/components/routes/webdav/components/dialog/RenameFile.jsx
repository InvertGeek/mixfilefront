import DialogDiv from "../../../../common/base/DialogDiv.jsx";
import {Checkbox, FormControlLabel, TextField} from "@mui/material";
import {notifyError, notifyMsg, notifyPromise} from "../../../../../utils/CommonUtils.jsx";
import {dialogList} from "../../../../../utils/DialogContainer.jsx";
import {moveFile} from "../../utils/WebDavUtils.jsx";
import useProxyState from "../../../../../hooks/useProxyState.js";
import LoadingButton from "../../../../common/base/LoadingButton.jsx";
import {useEffect, useId} from "react";

function RenameFile({path, name}) {

    const state = useProxyState({
        newName: name,
        overwrite: false,
    })

    // 1. 定义 ID
    const inputId = useId()
    const buttonId = useId()

    const {newName, overwrite} = state;

    useEffect(() => {
        // 使用 getElementById 配合你要求的格式
        const input = document.getElementById(inputId)
        if (!input) {
            return
        }
        input.focus();

        const value = input.value;
        const dotIndex = value.lastIndexOf('.');

        // 选中逻辑：只选中文件名部分，不选中后缀
        if (dotIndex === -1) {
            input.setSelectionRange(0, value.length);
        } else {
            input.setSelectionRange(0, dotIndex);
        }
    }, [])


    return (
        <DialogDiv className={'shadow'}>
            <h4 className={'no-select'}>重命名文件</h4>
            <div className="content">
                <TextField
                    id={inputId} // 绑定输入框 ID
                    label={'文件名称'}
                    variant={'outlined'}
                    value={newName}
                    onKeyDown={(e) => {
                        // 2. 回车模拟点击按钮
                        if (e.key === 'Enter') {
                            document.getElementById(buttonId)?.click();
                        }
                    }}
                    onChange={(event) => {
                        state.newName = event.target.value
                    }}/>
                <FormControlLabel
                    className={'no-select'}
                    control={
                        <Checkbox
                            checked={overwrite}
                            onChange={(event) => {
                                state.overwrite = event.target.checked;
                            }}
                        />
                    }
                    label="覆盖文件"
                />
            </div>
            <LoadingButton
                id={buttonId} // 3. 绑定按钮 ID
                variant={'contained'}
                onClick={async () => {
                    if (name === newName) {
                        notifyError('文件名称相同')
                        return
                    }
                    await notifyPromise(moveFile(`api${path}/${encodeURIComponent(name)}`, `api${path}/${encodeURIComponent(newName)}`, overwrite), '重命名文件')
                    notifyMsg('重命名文件成功')
                    dialogList.pop()
                }}>
                重命名文件
            </LoadingButton>
        </DialogDiv>
    );
}

export default RenameFile;