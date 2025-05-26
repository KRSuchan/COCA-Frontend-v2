import axios from "axios";
import Swal from "sweetalert2";

// GET
export const get = async (navigate, url, retry = 1) => {
    try {
        let config = getAuthConfig();
        const res = await axios.get(
            process.env.REACT_APP_SERVER_URL + url,
            config
        );
        return await handleResponse({
            res,
            retry,
            retryFunc: (r) => get(navigate, url, r),
            navigate,
        });
    } catch (error) {
        handleError(url, error);
    }
};

// POST
export const post = async (
    navigate,
    url,
    data,
    multipartName,
    multiparts,
    retry = 1
) => {
    try {
        let config = getAuthConfig();
        if (multipartName !== undefined) {
            data = await makeForm(data, multipartName, multiparts);
        }
        const res = await axios.post(
            process.env.REACT_APP_SERVER_URL + url,
            data,
            config
        );
        return await handleResponse({
            res,
            retry,
            retryFunc: (r) =>
                post(navigate, url, data, multipartName, multiparts, r),
            navigate,
        });
    } catch (error) {
        handleError(url, error);
    }
};

// PUT
export const put = async (
    navigate,
    url,
    data,
    multipartName,
    multiparts,
    retry = 1
) => {
    try {
        let config = getAuthConfig();
        console.log("made config. " + config);
        if (multipartName !== undefined) {
            console.log(multipartName);
            data = await makeForm(data, multipartName, multiparts);
        }
        console.log("made data " + data);
        const res = await axios.put(
            process.env.REACT_APP_SERVER_URL + url,
            data,
            config
        );
        console.log("you got the response : ", res);
        return await handleResponse({
            res,
            retry,
            retryFunc: (r) =>
                put(navigate, url, data, multipartName, multiparts, r),
            navigate,
        });
    } catch (error) {
        handleError(url, error);
    }
};

// DELETE
export const del = async (navigate, url, retry = 1) => {
    try {
        let config = getAuthConfig();
        const res = await axios.delete(
            process.env.REACT_APP_SERVER_URL + url,
            config
        );
        return await handleResponse({
            res,
            retry,
            retryFunc: (r) => del(navigate, url, r),
            navigate,
        });
    } catch (error) {
        handleError(url, error);
    }
};

const refreshAccessToken = async () => {
    try {
        const config = getAuthConfig("refreshToken");
        const response = await axios.post(
            process.env.REACT_APP_SERVER_URL + "/api/jwt/reissue",
            null,
            config
        );

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
        console.error("Token refresh failed", err);
        await forceLogout();
        return false;
    }
};

const forceLogout = async (navigate) => {
    localStorage.clear();
    Swal.fire({
        icon: "error",
        title: "세션이 만료되었어요!<br>다시 로그인 해주세요!",
        confirmButtonText: "확인",
    }).then(() => {
        navigate("/");
    });
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
const handleError = (url, error) => {
    console.error("🔴error 발생");
    console.error("url : " + url);
    console.error("error message : " + error);
};

// 공통 응답 처리
const handleResponse = async ({ res, retry, retryFunc, navigate }) => {
    const status = res.status;
    if (status === 200 || status === 201) {
        return res;
    } else if (status === 401 && retry > 0) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
            return retryFunc(retry - 1);
        } else {
            await forceLogout(navigate);
            return res;
        }
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
