import axios from "axios";

// GET
export const get = async (url, retry = 1) => {
    try {
        let config = getAuthConfig();
        const res = await axios.get(
            process.env.REACT_APP_SERVER_URL + url,
            config
        );
        return await handleResponse({
            res,
        });
    } catch (error) {
        return await handleError({
            url,
            error,
            retry,
            retryFunc: (r) => get(url, r),
        });
    }
};

// POST
export const post = async (url, data, multipartName, multiparts, retry = 1) => {
    try {
        let config = getAuthConfig();
        if (!(data instanceof FormData) && multipartName !== undefined) {
            data = await makeForm(data, multipartName, multiparts);
        }
        const res = await axios.post(
            process.env.REACT_APP_SERVER_URL + url,
            data,
            config
        );
        return await handleResponse({
            res,
        });
    } catch (error) {
        return await handleError({
            url,
            error,
            retry,
            retryFunc: (r) => post(url, data, multipartName, multiparts, r),
        });
    }
};

// PUT
export const put = async (url, data, multipartName, multiparts, retry = 1) => {
    try {
        let config = getAuthConfig();
        if (multipartName !== undefined) {
            data = await makeForm(data, multipartName, multiparts);
        }
        const res = await axios.put(
            process.env.REACT_APP_SERVER_URL + url,
            data,
            config
        );
        return await handleResponse({
            res,
        });
    } catch (error) {
        return await handleError({
            url,
            error,
            retry,
            retryFunc: (r) => put(url, data, multipartName, multiparts, r),
        });
    }
};

// DELETE
export const del = async (url, retry = 1) => {
    try {
        let config = getAuthConfig();
        const res = await axios.delete(
            process.env.REACT_APP_SERVER_URL + url,
            config
        );
        return await handleResponse({
            res,
        });
    } catch (error) {
        return await handleError({
            url,
            error,
            retry,
            retryFunc: (r) => del(url, r),
        });
    }
};

const refreshAccessToken = async () => {
    try {
        const config = getAuthConfig();
        const response = await axios.post(
            process.env.REACT_APP_SERVER_URL + "/api/jwt/reissue",
            {
                refreshToken: localStorage.getItem("refreshToken"),
            },
            config
        );
        console.log("reissue!!");

        if (response.data.code === 200) {
            localStorage.setItem("accessToken", response.data.data.accessToken);
            localStorage.setItem(
                "refreshToken",
                response.data.data.refreshToken
            );
            return true;
        } else {
            throw new Error("Token refresh failed");
        }
    } catch (err) {
        console.log("Token refresh failed", err);
        return false;
    }
};

const forceLogout = async () => {
    console.log("force logout");
    localStorage.clear();
    window.location.href = "/";
};

const urlToFile = async (url, fileName) => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const blob = await response.blob();
        return new File([blob], fileName, { type: blob.type });
    } catch (error) {
        console.error("Error fetching file:", error);
        throw error;
    }
};

const makeForm = async (data, multipartName, multiparts) => {
    const form = new FormData();
    form.append(
        "data",
        new Blob([JSON.stringify(data)], {
            type: "application/json",
        })
    );
    let tempMulti = multiparts;
    if (multiparts && multiparts[0] === null && multiparts[1] === null) {
        tempMulti = null;
    }
    if (tempMulti && tempMulti.length > 0) {
        const multiPromises = tempMulti.map(async (multi) => {
            if (multi && !(multi instanceof File)) {
                const downloadedFile = await urlToFile(
                    multi.filePath,
                    multi.fileName
                );
                form.append(multipartName, downloadedFile);
            } else if (multi instanceof File) {
                form.append(multipartName, multi);
            }
        });

        await Promise.all(multiPromises);
    } else {
        form.append(multipartName, multiparts);
    }
    return form;
};

// 공통 에러 처리
const handleError = async ({ url, error, retry, retryFunc }) => {
    const status = error?.response?.status;
    if (status === 401 && retry > 0) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
            return retryFunc(retry - 1);
        } else {
            await forceLogout();
        }
    } else if (status === 401 && retry === 0) {
        console.log("retry and is 0");
        localStorage.clear();
        await forceLogout();
    } else {
        console.error("🔴error 발생");
        console.error("url : " + url);
        console.error("error message : ", error);
    }
    return null;
};

// 공통 응답 처리
const handleResponse = async ({ res }) => {
    const status = res.status;
    if (status === 200 || status === 201) {
        return res;
    } else {
        throw new Error("failed to process");
    }
};

// 공통 config 생성
const getAuthConfig = (key = "accessToken") => {
    const token = localStorage.getItem(key);
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

const api = {
    get,
    post,
    del,
    put,
};

export default api;
