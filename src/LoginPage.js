import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./security/TokenManage";
import "./css/LoginPage.css";
import Swal from "sweetalert2";
import { useDispatch } from "react-redux";

function LoginPage() {
    const navigate = useNavigate();
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const dispatch = useDispatch();
    const project = "COCA_v2";
    const version = process.env.REACT_APP_VERSION;
    useEffect(() => {
        console.log("=========== 현재 접속되는 SERVER URL ===========");
        console.log(process.env.REACT_APP_SERVER_URL);
        console.log("=========== 현재 프론트 버전 ===========");
        console.log(process.env.REACT_APP_VERSION);
    }, []);
    useEffect(() => {
        const id = localStorage.getItem("userId");

        if (id) {
            navigate("/main");
        } else {
            dispatch({ type: "RESET_STATE", payload: null });
        }
    }, []);

    const handleLogin = () => {
        login();
    };

    const handleSignUp = () => {
        navigate("/signup");
    };

    const login = () => {
        api.post("/api/member/loginReq", {
            id: userId,
            password: password,
        })
            .then((res) => {
                console.log(res);

                if (res.data.code === 200) {
                    console.log("로그인 성공 : ", res.data);

                    localStorage.setItem("userId", userId);
                    localStorage.setItem(
                        "accessToken",
                        res.data.data.accessToken
                    );
                    localStorage.setItem(
                        "refreshToken",
                        res.data.data.refreshToken
                    );

                    navigate("/main");
                } else if (res.data.code === 400) {
                    console.log("로그인 실패 : ", res.data);
                    Swal.fire({
                        position: "center",
                        icon: "error",
                        title: "로그인 실패!",
                        text: "아이디 또는 비밀번호가 달라요!",
                        showConfirmButton: false,
                        timer: 1500,
                    });
                } else {
                    Swal.fire({
                        position: "center",
                        icon: "error",
                        title: "로그인 실패!",
                        text: "알 수 없는 오류가 생겼거나, 서버로부터 응답이 없어요!",
                        showConfirmButton: false,
                        timer: 1500,
                    });
                }
            })
            .catch((error) => {
                console.log("로그인 실패 : ", error);
            });
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            if (e.target.name === "id") {
                document.getElementById("pw").focus();
            } else if (e.target.name === "pw") {
                handleLogin();
            }
        }
    };

    return (
        <div className="container">
            <div className="cards-container">
                <div className="info-card">
                    <h2>
                        <span role="img" aria-label="sparkles">
                            ✨
                        </span>
                        빈일정찾기
                    </h2>
                    <p>
                        빈 일정 찾기 버튼을 눌러, 모두의 일정을 비교하고 모두가
                        빈 시간에 회의하거나, 여행 일정을 추가해 보세요!
                    </p>
                </div>
                <div className="login-card">
                    <div className="transparent-box">
                        <input
                            type="text"
                            id="id"
                            name="id"
                            placeholder="ID"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <input
                            type="password"
                            id="pw"
                            name="pw"
                            placeholder="PW"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <div className="button-container">
                            <button
                                className="login-button"
                                type="submit"
                                onClick={handleLogin}
                            >
                                LOGIN
                            </button>
                            <button
                                className="signup-button"
                                type="submit"
                                onClick={handleSignUp}
                            >
                                SIGN UP
                            </button>
                        </div>
                    </div>
                    <h1 className="right-aligned">{project}</h1>
                    <h2 style={{ textAlign: "right" }}>
                        {"Front updated." + version}
                    </h2>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
