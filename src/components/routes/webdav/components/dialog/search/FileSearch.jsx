import styled from "styled-components";
import DialogDiv from "../../../../../common/base/DialogDiv.jsx";
import useProxyState from "../../../../../../hooks/useProxyState.js";
import {TextField} from "@mui/material";
import LoadingButton from "../../../../../common/base/LoadingButton.jsx";
import {downloadFileArchive} from "../../../utils/WebDavUtils.jsx";
import {getRoutePath, notifyError} from "../../../../../../utils/CommonUtils.jsx";
import {addDialog} from "../../../../../../utils/DialogContainer.jsx";
import SearchResult from "./SearchResult.jsx";

const Container = styled(DialogDiv)`
    h4 {
        width: 100%;
        text-align: center;
        font-size: 20px;
    }

    form {
        display: flex;
        height: 100%;
        width: 100%;
        flex-direction: column;
        gap: 10px;
    }

    p {
        padding: 10px;
    }
`

export async function searchFiles(name) {
    const results = []
    const rootData = await downloadFileArchive()

    function searchFolder(folder, path = getRoutePath()) {
        const {files} = folder
        for (const key in files) {
            const file = files[key]
            if (file.name.includes(name)) {
                results.push({
                    ...file,
                    path: `${path}/${file.name}`
                })
            }
            if (file.isFolder) {
                searchFolder(file, `${path}/${file.name}`)
            }
        }
    }

    searchFolder(rootData)
    return results
}

function FileSearch(props) {

    const state = useProxyState({
        name: '',
    })

    const {name} = state

    return (
        <Container>
            <h4 className={'no-select'}>搜索文件</h4>
            <form onSubmit={async (event) => {
                event.preventDefault()
                try {
                    const results = await searchFiles(name)
                    addDialog(<SearchResult files={results}/>)
                } catch (error) {
                    notifyError(`搜索失败,错误: ${error?.message}`)
                }
            }}>
                <TextField
                    label={'关键词'}
                    variant={'outlined'}
                    value={name}
                    onChange={(event) => {
                        state.name = event.target.value.trim()
                    }}/>
                <p>将会在当前目录进行嵌套深度搜索</p>
                <LoadingButton
                    variant={'contained'}
                    type="submit"
                    disabled={name.length === 0}
                >
                    搜索
                </LoadingButton>
            </form>
        </Container>
    );
}

export default FileSearch;