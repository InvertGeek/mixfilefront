import {useState} from 'react';
import styled from "styled-components";
import {Backdrop, Button} from "@mui/material";
import {ProgressCard} from "./UploadCard.jsx";
import {getFormattedDate, notifyMsg} from "../../utils/CommonUtils.js";
import {CopyToClipboard} from "react-copy-to-clipboard/src";
import {apiAddress} from "../../config.js";
import axios from "axios";
import pako from "pako";
import {openFileListDialog} from "../FileList.jsx";

const Container = styled.div`
    display: flex;
    background-color: white;
    padding: 10px;
    border-radius: 10px;
    justify-content: center;
    width: 500px;
    max-width: 95vw;
    gap: 10px;
    flex-direction: column;
    color: #8e2afe;
    word-break: break-all;

    > .content {
        gap: 10px;
        display: flex;
        flex-direction: column;
        max-height: 60vh;
        overflow-y: auto;
    }

    p {
        white-space: nowrap;
        font-weight: bold;
    }

    button {
        font-size: max(.6rem, 14px);
    }
`

let setFileList = null
let setFileResult = null


function UploadDialog(props) {

    const [fileList, setList] = useState([])
    const [result, setResult] = useState([])
    const [uploading, setUploading] = useState(false)
    setFileList = setList
    setFileResult = setResult


    if (fileList.length === 0) {
        return null
    }
    const uploaded = result.length
    const complete = result.length === fileList.length

    return (
        <Backdrop open style={{
            zIndex: '99'
        }}>
            <Container className={'shadow'}>
                {
                    complete ?
                        <h3 className={'file-card animate__animated animate__bounceIn'}>
                            {fileList.length} 个文件全部上传成功
                        </h3>
                        : <h3>{uploaded} / {fileList.length} 个文件正在上传</h3>
                }
                <div class="content">
                    {
                        fileList.map((file, index) =>
                            <ProgressCard file={file} key={index}/>
                        )
                    }
                </div>
                {
                    result.length > 0 &&
                    <>
                        <CopyToClipboard
                            className={'file-card animate__animated animate__bounceIn'}
                            text={result.map((it) => it.shareInfoData).join('\n')}
                            onCopy={() => {
                                notifyMsg('复制成功!')
                            }}>
                            <Button variant={'outlined'}>全部复制</Button>
                        </CopyToClipboard>
                    </>
                }

                {
                    result.length > 1 &&
                    <Button disabled={uploading} variant={'contained'} onClick={async () => {
                        const dataList = result.map(({file, shareInfoData}) => {
                            return {
                                name: file.name,
                                size: file.size,
                                category: '',
                                time: new Date().getTime(),
                                shareInfoData
                            }
                        })
                        const shareData = pako.gzip(JSON.stringify(dataList))
                        const uploadAddress = `${apiAddress}api/upload?name=${encodeURIComponent(`文件分享-${getFormattedDate()}.mix_list`)}&add=false`
                        setUploading(true)
                        let response = await axios.put(uploadAddress, shareData, {})
                        openFileListDialog(response.data)
                        setUploading(false)
                    }}>{'一键导出'}</Button>
                }

                <Button variant={'contained'} onClick={() => {
                    setFileList([])
                    setFileResult([])
                }}>{complete ? '关闭' : '取消'}</Button>
            </Container>
        </Backdrop>
    );
}

export function addFileList(list) {
    setFileList((prev) => [...prev, ...list])
}

export function addFileResult(res) {
    setFileResult((prev) => [...prev, res])
}

export default UploadDialog;
