import axios from "axios";
import Swal from "sweetalert2";

export const logout = async (navigate) => {
  const accessToken = localStorage.getItem("accessToken");

  try {
    const config = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };

    const res = await axios.post(
      process.env.REACT_APP_SERVER_URL + "/api/member/logoutReq",
      null,
      config
    );

    if (res.data.code === 200) {
      localStorage.clear();
      navigate("/");
      return;
    }

    if (res.data.code === 401) {
      // accessToken 만료 시도 -> refresh로 재발급
      const refreshed = await refreshAccessToken(navigate);
      if (refreshed) {
        // 재시도
        return logout(navigate);
      } else {
        // refresh 실패 시 여기서 종료
        return;
      }
    }

  } catch (error) {
    console.error("logout error", error);
    // 네트워크 오류 등 서버 응답조차 없을 때도 세션 종료 처리
    await forceLogout(navigate);
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
      localStorage.setItem("refreshToken", response.data.data.refreshToken);
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

export const checkPassword = async (navigate, pw) => {
  const accessToken = localStorage.getItem('accessToken');
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };

    const data = {
      id: localStorage.getItem('userId'),
      password: pw
    }

    const res = await axios.post(process.env.REACT_APP_SERVER_URL + "/api/member/checkPassword", data, config);

    if(res.data.code === 200) {
      return res.data.data;
    }

    if (res.data.code === 401) {
      // accessToken 만료 시도 -> refresh로 재발급
      const refreshed = await refreshAccessToken(navigate);
      if (refreshed) {
        // 재시도
        return checkPassword(navigate);
      } else {
        // refresh 실패 시 여기서 종료
        return;
      }
    }

  } catch (error) {
    console.error("logout error", error);
    // 네트워크 오류 등 서버 응답조차 없을 때도 세션 종료 처리
    await forceLogout(navigate);
  }
}