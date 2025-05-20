import axios from "axios";
import Swal from "sweetalert2";

export const get = async (navigate, url, retry = 1) => {
    const accessToken = localStorage.getItem("accessToken");
    const config = {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    };
    try {
        const res = await axios.get(
            process.env.REACT_APP_SERVER_URL + url,
            config
        );
        const code = res.data.code;
        if (code === 200 || code === 201) {
            // 정상 코드이면 response값 반환
            return res;
        } else if (code === 401 && retry > 0) {
            // 토큰 만료로 인한 401
            const refreshed = await refreshAccessToken();
            if (refreshed) {
                return get(navigate, url, retry - 1);
            } else {
                await forceLogout(navigate);
                return res;
            }
        } else {
            // 200외의 에러
            console.error(res.data.code);
            throw new Error("failed to get");
        }
    } catch (error) {
        // 에러 발생하면 catch
        console.error("🔴error 발생");
        console.error("url : " + url);
        console.error("error message : " + error);
        Swal.fire({
            position: "center",
            icon: "error",
            title: "서버 통신 에러",
            text: "내용 :" + error,
            showConfirmButton: true,
        });
    }
};

export const post = async (
    navigate,
    url,
    data,
    multipartName,
    multiparts,
    retry = 1
) => {
    const accessToken = localStorage.getItem("accessToken");
    const config = {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    };
    if (multipartName != undefined) {
        data = await makeForm(data, multipartName, multiparts);
    }
    try {
        const res = await axios.post(
            process.env.REACT_APP_SERVER_URL + url,
            data,
            config
        );
        const code = res.data.code;
        if (code === 200 || code === 201) {
            // 정상 코드이면 response값 반환
            return res;
        } else if (code === 401) {
            // 토큰 만료로 인한 401
            const refreshed = await refreshAccessToken();
            if (refreshed) {
                return post(
                    navigate,
                    url,
                    data,
                    multipartName,
                    multiparts,
                    retry - 1
                );
            } else {
                // refresh 실패 시 리다이렉트만 하고 Swal 없이 종료
                await forceLogout(navigate);
                return res;
            }
        } else {
            // 200 외의 에러
            throw new Error("failed to post");
        }
    } catch (error) {
        // 에러 발생하면 catch
        console.error("🔴error 발생");
        console.error("url : " + url);
        console.error("error message : " + error);
        Swal.fire({
            position: "center",
            icon: "error",
            title: "서버 통신 에러",
            text: "내용 :" + error,
            showConfirmButton: true,
        });
    }
};
export const put = async (
    navigate,
    url,
    data,
    multipartName,
    multiparts,
    retry = 1
) => {
    const accessToken = localStorage.getItem("accessToken");
    const config = {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    };
    if (multipartName != undefined) {
        data = await makeForm(data, multipartName, multiparts);
    }
    try {
        const res = await axios.put(
            process.env.REACT_APP_SERVER_URL + url,
            data,
            config
        );
        const code = res.data.code;
        if (code === 200 || code === 201) {
            // 정상 코드이면 response값 반환
            return res;
        } else if (code === 401 && retry > 0) {
            // 토큰 만료로 인한 401
            const refreshed = await refreshAccessToken();
            if (refreshed) {
                return put(
                    navigate,
                    url,
                    data,
                    multipartName,
                    multiparts,
                    retry - 1
                );
            } else {
                // refresh 실패 시 리다이렉트만 하고 Swal 없이 종료
                await forceLogout(navigate);
                return;
            }
        } else {
            // 200 외의 에러
            throw new Error("failed to put");
        }
    } catch (error) {
        // 에러 발생하면 catch
        console.error("🔴error 발생");
        console.error("url : " + url);
        console.error("error message : " + error);
        Swal.fire({
            position: "center",
            icon: "error",
            title: "서버 통신 에러",
            text: "내용 : " + error,
            showConfirmButton: true,
        });
    }
};
export const del = async (navigate, url, retry = 1) => {
    const accessToken = localStorage.getItem("accessToken");

    const config = {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    };
    try {
        const res = await axios.delete(
            process.env.REACT_APP_SERVER_URL + url,
            config
        );
        const code = res.data.code;
        if (code === 200 || code === 201) {
            // 정상 코드이면 response값 반환
            return res;
        } else if (code === 401 && retry > 0) {
            // 토큰 만료로 인한 401
            const refreshed = await refreshAccessToken();
            if (refreshed) {
                return del(navigate, url, retry - 1);
            } else {
                // refresh 실패 시 리다이렉트만 하고 Swal 없이 종료
                await forceLogout(navigate);
            }
        } else {
            // 200 외의 에러
            throw new Error("failed to delete");
        }
    } catch (error) {
        // 에러 발생하면 catch
        console.error("🔴error 발생");
        console.error("url : " + url);
        console.error("error message : " + error);
        Swal.fire({
            position: "center",
            icon: "error",
            title: "서버 통신 에러",
            text: "내용 :" + error,
            showConfirmButton: true,
        });
    }
};
const refreshAccessToken = async () => {
    try {
        const refreshToken = localStorage.getItem("refreshToken");
        const config = {
            headers: {
                Authorization: `Bearer ${refreshToken}`,
            },
        };

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

const urlToFile = async (url, fileName) => {
    try {
        const response = await fetch(url);
        console.log(response);
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
const makeForm = async (data, multipartName, multiparts) => {
    const form = new FormData();
    form.append(
        "data",
        new Blob([JSON.stringify(data)], {
            type: "application/json",
        })
    );
    let tempMulti = multiparts;
    if (multiparts[0] === null && multiparts[1] === null) {
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
        form.append("attachments", "[]");
    }
    return form;
};
const api = {
    get,
    post,
    del,
    put,
};

export default api;
