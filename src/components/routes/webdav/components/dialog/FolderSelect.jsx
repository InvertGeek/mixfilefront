import DialogDiv from "../../../../common/base/DialogDiv.jsx";
import {SimpleTreeView, TreeItem} from "@mui/x-tree-view";
import styled from "styled-components";
import useApi from "../../../../../hooks/useApi.jsx";
import {parsePropfindXML} from "../../utils/WebDavUtils.jsx";
import {Button, Checkbox, CircularProgress, FormControlLabel} from "@mui/material";
import {addDialog, dialogList} from "../../../../../utils/DialogContainer.jsx";
import useProxyState from "../../../../../hooks/useProxyState.js";
import {FILE_SORTS} from "../../state/WebDavState.js";

const Container = styled(DialogDiv)`
    .info {
        width: 100%;
        padding: 10px 5px;
        display: flex;
        justify-content: center;
    }

    .empty {
        color: gray;
    }

    .bottom {
        padding: 0px 10px;
        display: flex;
        flex-direction: column;
        gap: 10px;

        .tip {
            color: rgba(120, 86, 158, 0.86);
            font-weight: bold;
        }

        .actions {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
        }
    }


`


function FolderTreeItem({path}) {

    const {content} = useApi({
        path: `api/webdav${path}`,
        method: 'PROPFIND',
        headers: {
            depth: 1
        },
        loading: <div class={'info'}><CircularProgress size={20}/></div>,
        content(data) {
            const files = parsePropfindXML(data)

            //去掉目录文件
            files.shift()

            files.sort(FILE_SORTS.name.func)

            const folders = files.filter((it) => it.isFolder)
            if (folders.length === 0) {
                return <div class={'empty info no-select'}>无下级目录</div>
            }

            return (
                folders.map(({name}) => {

                    const folderPath = `${path}/${encodeURIComponent(name)}`

                    return (
                        <TreeItem itemId={folderPath} label={name} key={folderPath}>
                            <FolderTreeItem path={folderPath}/>
                        </TreeItem>
                    )
                })
            )
        }
    })

    return content
}


function FolderSelect({callback}) {

    const state = useProxyState({
        path: '',
        overwrite: false,
    })
    const {path, overwrite} = state;


    return (
        <Container className={'shadow'}>
            <h4 className={'no-select'}>选择目录</h4>
            <div class="content">
                <SimpleTreeView
                    onItemSelectionToggle={(
                        event,
                        itemId,
                        isSelected
                    ) => {
                        state.path = itemId;
                    }}
                    defaultExpandedItems={['']}
                    defaultSelectedItems={['']}
                >
                    <TreeItem itemId={''} label={'ROOT'}>
                        <FolderTreeItem path={''}/>
                    </TreeItem>
                </SimpleTreeView>
            </div>
            <div class="bottom">
                <div class="tip no-select">
                    已选择: {decodeURIComponent(path) || '根目录'}
                </div>
                <FormControlLabel
                    className={'no-select'}
                    control={
                        <Checkbox
                            onChange={(event) => {
                                state.overwrite = event.target.checked;
                            }}
                        />
                    }
                    label="覆盖文件"
                />
                <div class="actions">
                    <Button
                        variant={'contained'}
                        onClick={async () => {
                            dialogList.pop()
                            callback?.(state)
                        }}>
                        确认
                    </Button>
                    <Button
                        variant={'outlined'}
                        onClick={async () => {
                            dialogList.pop()
                        }}>
                        取消
                    </Button>
                </div>
            </div>
        </Container>
    );
}

export async function selectFolder() {
    return new Promise(resolve => {
        addDialog(<FolderSelect callback={resolve}/>)
    })
}

export default FolderSelect;