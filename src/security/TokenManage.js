import axios from "axios";
import Swal from "sweetalert2";

export const get = async (url, navigate) => {
    const accessToken = localStorage.getItem("accessToken");

    try {
        const config = {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        };

        const res = await axios.get(
            process.env.REACT_APP_SERVER_URL + url,
            config
        );
        console.log(res);

        if (res.data.code === 200) {
            // 정상 코드이면 response값 반환
            return res;
        } else {
            // 200외의 에러
            throw new Error("failed to get");
        }
    } catch (error) {
        const status = error.response?.status;
        if (status === 401) {
            // 토큰 만료로 인한 401
            const refreshed = await refreshAccessToken(navigate);
            if (refreshed) {
                return get(url, navigate);
            } else {
                // refresh 실패 시 리다이렉트만 하고 Swal 없이 종료
                await forceLogout(navigate);
                return;
            }
        }
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

export const post = async (url, data, navigate) => {
    const accessToken = localStorage.getItem("accessToken");

    try {
        const config = {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        };

        const res = await axios.post(
            process.env.REACT_APP_SERVER_URL + url,
            data,
            config
        );

        if (res.data.code === 200) {
            // 정상 코드이면 response값 반환
            return res;
        } else {
            // 200 외의 에러
            throw new Error("failed to post");
        }
    } catch (error) {
        const status = error.response?.status;
        if (status === 401) {
            // 토큰 만료로 인한 401
            const refreshed = await refreshAccessToken(navigate);
            if (refreshed) {
                return post(url, data, navigate);
            } else {
                // refresh 실패 시 리다이렉트만 하고 Swal 없이 종료
                await forceLogout(navigate);
                return;
            }
        }
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
export const put = async (url, data, navigate) => {
    const accessToken = localStorage.getItem("accessToken");

    try {
        const config = {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        };

        const res = await axios.put(
            process.env.REACT_APP_SERVER_URL + url,
            data,
            config
        );

        if (res.data.code === 200) {
            // 정상 코드이면 response값 반환
            return res;
        } else {
            // 200 외의 에러
            throw new Error("failed to put");
        }
    } catch (error) {
        const status = error.response?.status;
        if (status === 401) {
            // 토큰 만료로 인한 401
            const refreshed = await refreshAccessToken(navigate);
            if (refreshed) {
                return put(url, data, navigate);
            } else {
                // refresh 실패 시 리다이렉트만 하고 Swal 없이 종료
                await forceLogout(navigate);
                return;
            }
        }
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
export const del = async (url, navigate) => {
    const accessToken = localStorage.getItem("accessToken");

    try {
        const config = {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        };

        const res = await axios.delete(
            process.env.REACT_APP_SERVER_URL + url,
            config
        );

        if (res.data.code === 200) {
            // 정상 코드이면 response값 반환
            return res;
        } else {
            // 200 외의 에러
            throw new Error("failed to delete");
        }
    } catch (error) {
        const status = error.response?.status;
        if (status === 401) {
            // 토큰 만료로 인한 401
            const refreshed = await refreshAccessToken(navigate);
            if (refreshed) {
                return del(url, navigate);
            } else {
                // refresh 실패 시 리다이렉트만 하고 Swal 없이 종료
                await forceLogout(navigate);
                return;
            }
        }
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
export const refreshAccessToken = async (navigate) => {
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
        await forceLogout(navigate);
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

const api = {
    get,
    post,
    del,
    put,
    refreshAccessToken,
};

export default api;
