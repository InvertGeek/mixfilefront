import styled from "styled-components";
import AddIcon from '@mui/icons-material/Add';
import {Fab} from "@mui/material";
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import {addDialog} from "../../../../../utils/DialogContainer.jsx";
import NewFolder from "../dialog/NewFolder.jsx";
import {selectFiles} from "../../../../common/FileSelect.jsx";
import {addUploadFile} from "../../../../../utils/transfer/upload/FileUpload.js";
import {apiAddress} from "../../../../../config.js";
import {copyText, getRoutePath, notifyMsg, notifyPromise} from "../../../../../utils/CommonUtils.jsx";
import {useSnapshot} from "valtio";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import {showConfirmWindow} from "../../../../common/base/ConfirmWindow.jsx";
import FolderCopyIcon from "@mui/icons-material/FolderCopy";
import {selectFolder} from "../dialog/FolderSelect.jsx";
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove';
import {Semaphore} from "@chriscdn/promise-semaphore";
import {webDavState} from "../../state/WebDavState.js";
import DownloadIcon from '@mui/icons-material/Download';
import {addDownloadFile} from "../../../../../utils/transfer/download/FileDownload.js";
import DownloadDialog from "../../../../../utils/transfer/download/DownloadDialog.jsx";
import ShareIcon from '@mui/icons-material/Share';
import FileShare from "../dialog/FileShare.jsx";
import SearchIcon from '@mui/icons-material/Search';
import FileSearch from "../dialog/search/FileSearch.jsx";


const Container = styled.div`
    width: 100%;
    min-height: 60px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    padding: 10px 20px;
    gap: 25px;
    background-color: rgba(142, 42, 254, 0.21);
    flex-wrap: wrap;

    svg {
        font-size: 25px;
        color: rgba(142, 42, 254, 0.77);
    }
`
//操作文件请求并发
const semaphore = new Semaphore(5)

/**
 * 控制并发数量，批量执行异步任务
 * @param {Array} items - 任务列表，可以是任意类型
 * @param {(item: any) => Promise} asyncTask - 对每个item执行的异步任务函数
 * @param {Semaphore} semaphore - 控制并发的信号量实例，必须包含 acquire 和 release 方法
 * @returns {Promise} 所有任务完成的Promise
 */
async function runWithSemaphore(items, asyncTask, semaphore) {
    const tasks = []

    for (const item of items) {
        tasks.push((async () => {
            await semaphore.acquire()
            try {
                await asyncTask(item)
            } finally {
                semaphore.release()
            }
        })())
    }

    return Promise.all(tasks)
}

const selectedFiles = webDavState.selectedFiles

const fabs = [
    {
        name: '上传文件',
        get disabled() {
            return !!webDavState.singleFile
        },
        icon: <AddIcon/>,
        async onClick() {
            const files = await selectFiles()
            addUploadFile(files, (file) => {
                return `${apiAddress}api${getRoutePath()}/${encodeURIComponent(file.name)}`
            })
        }
    },
    {
        name: '新建文件夹',
        get disabled() {
            return !!webDavState.singleFile
        },
        icon: <CreateNewFolderIcon/>,
        onClick() {
            addDialog(<NewFolder/>)
        }
    },
    {
        name: '删除文件',
        get disabled() {
            return selectedFiles.length === 0
        },
        icon: <DeleteForeverIcon/>,
        onClick() {
            showConfirmWindow('确认删除文件?', async () => {
                await notifyPromise(
                    runWithSemaphore(selectedFiles, file => file.deleteFile(), semaphore),
                    '删除文件'
                )
                notifyMsg('删除成功')
            })
        }
    },
    {
        name: '复制文件',
        get disabled() {
            return selectedFiles.length === 0
        },
        icon: <FolderCopyIcon/>,
        async onClick() {
            const data = await selectFolder()
            await notifyPromise(
                runWithSemaphore(selectedFiles, file => file.copyFile(data), semaphore),
                '复制文件'
            )
            notifyMsg('复制成功')
        }
    },
    {
        name: '移动文件',
        get disabled() {
            return selectedFiles.length === 0
        },
        icon: <DriveFileMoveIcon/>,
        async onClick() {
            const data = await selectFolder()
            await notifyPromise(
                runWithSemaphore(selectedFiles, file => file.moveFile(data), semaphore),
                '移动文件'
            )
            notifyMsg('移动成功')
        }
    },
    {
        name: '下载文件',
        get disabled() {
            return selectedFiles.length === 0
        },
        icon: <DownloadIcon/>,
        async onClick() {
            selectedFiles.forEach((file) => {
                addDownloadFile(file.url, file.name)
            })
            addDialog(<DownloadDialog/>)
        }
    },
    {
        name: '分享文件',
        get disabled() {
            return selectedFiles.length === 0
        },
        icon: <ShareIcon/>,
        async onClick() {
            if (webDavState.singleFile) {
                copyText(webDavState.singleFile.etag)
                return
            }
            addDialog(<FileShare/>)
        }
    },
    {
        name: '搜索文件',
        get disabled() {
            return !!webDavState.singleFile
        },
        icon: <SearchIcon/>,
        async onClick() {
            addDialog(<FileSearch/>)
        }
    }
]

function ActionBar(props) {

    useSnapshot(selectedFiles)

    return (
        <Container className={'shadow'}>
            {
                fabs.map(it =>
                    <Fab
                        size={'small'}
                        title={it.name}
                        key={it.name}
                        disabled={it.disabled}
                        onClick={it.onClick}
                        sx={{
                            zIndex: 'unset',
                        }}
                    >
                        {it.icon}
                    </Fab>
                )
            }
        </Container>
    );
}

export default ActionBar;