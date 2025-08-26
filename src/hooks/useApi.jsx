// useApi.jsx
import {client} from "../config.js";
import {CircularProgress} from "@mui/material";
import styled from "styled-components";
import useProxyState from "./useProxyState.js";
import useDeepCompareEffect from "./useDeepCompareEffect.js";
import {noProxy, safeInterval} from "../utils/CommonUtils.jsx";
import {useEffect, useRef} from "react";

const MiddleContainer = styled.div`
    margin: 20px auto;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    .error {
        font-weight: bold;
        color: red;
    }
`

export function DefaultLoading() {
    return <MiddleContainer>
        <CircularProgress/>
    </MiddleContainer>
}

export function DefaultError({err}) {
    return <MiddleContainer>
        <div className={'error'}>Error: {err.message ?? err}</div>
    </MiddleContainer>
}


export default function useApi({
                                   path,
                                   method = 'GET',
                                   body = null,
                                   headers = {},
                                   config = {},
                                   callback = (data) => {
                                   },
                                   request = true,
                                   refreshInterval = -1,
                                   content = (data) => <></>,
                                   error = (err) => <DefaultError err={err}/>,
                                   loading = <DefaultLoading/>
                               }) {

    const state = useProxyState({
        err: null,
        data: null,
        isLoading: true,
    })

    const controllers = useRef(new Set())

    const fetchData = async () => {
        const controller = new AbortController();
        const controllerList = controllers.current
        controllerList.add(controller);
        try {
            const response = await client({
                ...config,
                url: path,
                method: method.toUpperCase(),
                data: body,
                signal: controller.signal,
                headers,
            })
            state.data = noProxy(response.data)
            callback(state.data)
            state.err = null
        } finally {
            controllerList.delete(controller)
        }
    }

    useEffect(() => {
        return () => {
            for (const controller of controllers.current) {
                controller.abort()
            }
        }
    }, [])

    const {err, data, isLoading} = state

    useDeepCompareEffect(() => {
        if (request && !isLoading && refreshInterval > 0) {
            const stop = safeInterval(fetchData, refreshInterval)
            return () => stop()
        }
    }, [path, method, headers, config, body, refreshInterval, request, isLoading])

    useDeepCompareEffect(() => {
        if (!request) {
            return
        }
        (async () => {
            state.isLoading = true
            try {
                await fetchData()
            } catch (e) {
                console.error(e)
                state.err = e
            } finally {
                state.isLoading = false
            }
        })()
    }, [path, method, headers, config, body, refreshInterval, request])

    function getContent() {
        if (isLoading) {
            return loading
        }
        if (err) {
            return error?.(err);
        }
        return content?.(data);
    }

    return {
        content: getContent(),
        data: data,
        isLoading,
        error: err,
    }
}