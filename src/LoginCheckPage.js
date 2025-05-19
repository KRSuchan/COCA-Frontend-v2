import { useEffect, useState } from "react";
import { UserOutlined } from "@ant-design/icons"; // 아이콘 추가
import styles from "./css/SettingPage.module.css"; // 스타일 시트 임포트
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "./security/CocaApi";
import { showLoginRequired } from "./security/ErrorController";

const LoginCheckPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const id = localStorage.getItem("userId");
        if (id === null) {
            showLoginRequired(navigate);
        }
    }, []);

    const [userInfo, setUserInfo] = useState({
        id: localStorage.getItem("userId"),
        password: "",
        profileImgPath: "",
    });

    const fetchProfileImage = async () => {
        const res = await api.get(
            navigate,
            `/api/member/memberProfileImageUrlReq?memberId=${localStorage.getItem(
                "userId"
            )}`
        );

        console.log(res);

        if (res.data.code === 200) {
            return res.data.data;
        } else return null;
    };

    useEffect(() => {
        const setProfileImage = async () => {
            const res = await fetchProfileImage();

            if (res) {
                setUserInfo({ ...userInfo, profileImgPath: res });
            }
        };

        setProfileImage();
    }, []);

    const handleLogin = async () => {
        const res = await api.post(navigate, "/api/member/checkPassword", {
            id: userInfo.id,
            password: userInfo.password,
        });
        if (res.data.data) {
            console.log("success");
            navigate(`/setting`, { state: userInfo });
        } else if (res.data.data === false) {
            console.log("fail");
            Swal.fire({
                position: "center",
                icon: "error",
                title: "로그인 실패!",
                text: "비밀번호가 달라요!",
                showConfirmButton: false,
                timer: 1500,
            });
        }
    };

    const handleBack = () => {
        navigate(-1);
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
        <div className={styles.container}>
            <div className={styles.header}>
                <button className={styles.backButton} onClick={handleBack}>
                    {"<"}
                </button>
                <h1 className={styles.title}>본인확인</h1>
            </div>
            <div className={styles.content}>
                <div className={styles.profileImageContainer}>
                    {userInfo.profileImgPath ? (
                        <img
                            src={userInfo.profileImgPath}
                            alt="profile"
                            className={styles.profileImage}
                        />
                    ) : (
                        <UserOutlined style={{ fontSize: "150px" }} />
                    )}
                </div>
                <div className={styles.inputContainer}>
                    <label>ID</label>
                    <input
                        type="text"
                        value={userInfo.id}
                        onChange={(e) =>
                            setUserInfo({ ...userInfo, id: e.target.value })
                        }
                        className={styles.inputField}
                        disabled
                    />
                </div>
                <div className={styles.inputContainer}>
                    <label>비밀번호</label>
                    <input
                        type="password"
                        name="pw"
                        value={userInfo.password}
                        onChange={(e) =>
                            setUserInfo({
                                ...userInfo,
                                password: e.target.value,
                            })
                        }
                        className={styles.inputField}
                        onKeyDown={handleKeyDown}
                    />
                </div>
                <div className={styles.buttonContainer}>
                    <button
                        className={styles.loginButton}
                        onClick={handleLogin}
                    >
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginCheckPage;
