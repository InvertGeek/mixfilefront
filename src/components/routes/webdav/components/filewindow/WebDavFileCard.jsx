import styled from "styled-components";
import {
    formatFileSize,
    getFormattedDate,
    getRoutePath,
    notifyMsg,
    notifyPromise,
    run
} from "../../../../../utils/CommonUtils.jsx";
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import FolderCopyIcon from '@mui/icons-material/FolderCopy';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import ImageIcon from '@mui/icons-material/Image';
import {Link, useNavigate} from "react-router-dom";
import RightClickMenu from "../../../../common/base/RightClickMenu.jsx";
import {useSnapshot} from "valtio";
import {Checkbox} from "@mui/material";
import {showConfirmWindow} from "../../../../common/base/ConfirmWindow.jsx";
import {selectFolder} from "../dialog/FolderSelect.jsx";
import {webDavState} from "../../state/WebDavState.js";
import {addDownloadFile} from "../../../../../utils/transfer/download/FileDownload.js";
import {copyShareCode} from "../../../../../utils/ShareCode.js";


const Container = styled(Link)`
    text-decoration: none;
    display: flex;
    padding: 0px 5px;
    word-break: break-word;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: space-between;
    transition: .3s;
    cursor: pointer;
    border-radius: 10px;
    height: 40px;
    user-select: none;
    color: rgb(64, 38, 83);
    -webkit-user-drag: none; /* 禁用拖动 (适用于Webkit浏览器) */

    svg {
        filter: drop-shadow(0px 1px 6px rgba(0, 0, 0, 0.2));
    }

    &:hover, &.selected {
        background-color: rgba(73, 69, 76, 0.07);
    }

    &:hover {
        transform: translateX(3px);
    }

    .file-name {
        display: flex;
        gap: 20px;
        align-items: center;
        height: 100%;

        .icon {
            .MuiSvgIcon-root {
                font-size: 30px;
                color: rgba(142, 42, 254, 0.44);
            }
        }

        .name {
            display: flex;
            gap: 5px;
            align-items: center;
        }

        h4 {
            font-weight: normal;
            max-width: 40vw;
            width: 400px;
        }
    }

    .file-date {
        display: flex;
        align-items: center;
        padding: 0 5px;
        @media (max-width: 767px) {
            display: none;
        }
    }

`
const selectedFiles = webDavState.selectedFiles

function FileIcon({file: {isFolder, mimeType}}) {
    if (isFolder) {
        return <FolderCopyIcon/>
    }
    if (mimeType?.startsWith("video/")) {
        return <VideoFileIcon/>
    }
    if (mimeType?.startsWith("image/")) {
        return <ImageIcon/>
    }

    return <InsertDriveFileIcon/>
}


function WebDavFileCard({file}) {

    const {
        name,
        isFolder,
        size,
        href,
        url,
        etag,
        lastModified,
    } = file

    const fileSize = run(() => {
        if (!isFolder) {
            return <div>{formatFileSize(size)}</div>
        }
        return null
    })


    useSnapshot(selectedFiles)

    function getSelectedIndex() {
        return selectedFiles.findIndex(file => file.name === name)
    }

    function unselect() {
        const selectedIndex = getSelectedIndex()
        if (selectedIndex > -1) {
            selectedFiles.splice(selectedIndex, 1);
        }
    }

    const selectedIndex = getSelectedIndex()

    const selected = selectedIndex > -1

    const navigate = useNavigate();

    const menuItems = [
        {
            label: "复制",
            async onClick() {
                await notifyPromise(file.copyFile(await selectFolder()), '复制文件')
                notifyMsg('操作成功')
            }
        },
        {
            label: "移动",
            async onClick() {
                await notifyPromise(file.moveFile(await selectFolder()), '移动文件')
                notifyMsg('操作成功')
            }
        },
        {
            label: "重命名",
            onClick() {
                file.renameFile()
            }
        },
        {
            label: "删除",
            onClick: () => {
                showConfirmWindow('确认删除文件?', async () => {
                    await notifyPromise(file.deleteFile(), '删除文件')
                    notifyMsg('文件已删除')
                })
            }
        },
    ];

    if (!isFolder) {
        menuItems.push({
            label: "下载",
            async onClick() {
                addDownloadFile(url, name)
            }
        }, {
            label: "复制分享码",
            async onClick() {
                copyShareCode(etag)
            }
        })
    }

    const classes = []
    if (selected) {
        classes.push('selected')
    }

    return (
        <RightClickMenu items={menuItems}>
            <Container
                className={`${classes.join(' ')}`}
                to={`${getRoutePath()}/${encodeURIComponent(name)}`}
            >
                <div class="file-name animate__animated animate__fadeIn animate__faster">
                    <div class="name">
                        <Checkbox
                            checked={selected}
                            onClick={(event) => {
                                event.stopPropagation();
                            }}
                            onChange={(event, selected) => {
                                if (selected) {
                                    selectedFiles.push(file)
                                    return
                                }
                                unselect()
                            }}
                        />
                        <dic class="icon">
                            <FileIcon file={file}/>
                        </dic>
                        <h4 className={'text-hide'}>{name}</h4>
                    </div>
                    {fileSize}
                </div>
                <div className={'file-date'}>{getFormattedDate(lastModified)}</div>
            </Container>
        </RightClickMenu>
    );
}

export default WebDavFileCard;