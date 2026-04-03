import DialogDiv from "../../../../common/base/DialogDiv.jsx";
import UploadArea from "../../../../../utils/transfer/upload/UploadArea.jsx";
import {addUploadFile} from "../../../../../utils/transfer/upload/FileUpload.js";
import {apiAddress} from "../../../../../config.js";
import {getRoutePath, sleep} from "../../../../../utils/CommonUtils.jsx";
import {addDialog, dialogList} from "../../../../../utils/DialogContainer.jsx";
import UploadDialog from "../../../../../utils/transfer/upload/UploadDialog.jsx";
import styled from "styled-components";
import {Button} from "@mui/material";


const Container = styled(DialogDiv)`
    min-width: 80vw;
    background-color: #f8eefe;

    .upload-area {
        height: 80vh;
    }
`

function DragUpload(props) {

    return (
        <Container className={'shadow no-select'}>
            <UploadArea className={'upload-area'} callback={async (files) => {
                await sleep(100)
                dialogList.pop()
                addDialog(<UploadDialog/>)
                addUploadFile(files, (file) => {
                    return `${apiAddress}api${getRoutePath()}/${encodeURIComponent(file.name)}`
                })
            }}/>
            <Button variant={'outlined'} onClick={() => {
                dialogList.pop()
            }}>关闭</Button>
        </Container>
    );
}

export default DragUpload;