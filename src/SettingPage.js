import { useEffect, useRef, useState } from "react";
import { UserOutlined, EditOutlined } from "@ant-design/icons"; // 아이콘 추가
import styles from "./css/SettingPage.module.css"; // 스타일 시트 임포트
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import api from "./security/CocaApi";

const SettingPage = () => {
    let { state } = useLocation();
    const idRef = useRef(state.id);
    const passwordRef = useRef(state.password);
    const [userInfo, setUserInfo] = useState({
        id: state?.id,
        password: state?.password,
        userName: "",
        profileImgPath: state?.profileImgPath,
        interest: [],
    });
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [newProfileImageFile, setNewProfileImageFile] = useState(null);
    const [originalProfileImgPath, setOriginalProfileImgPath] = useState("");
    const [interests, setInterests] = useState(["", "", ""]);

    const handleInterestChange = (index, event) => {
        const value = event.target.value;
        setInterests((prevInterests) => {
            const newInterests = [...prevInterests];
            newInterests[index] = value;
            return newInterests;
        });
    };

    const [tagList, setTagList] = useState([]);

    const fetchTagList = async () => {
        const res = await api.get("/api/tag/all");
        return res.data;
    };

    useEffect(() => {
        if (state === null) {
            Swal.fire({
                position: "center",
                icon: "error",
                title: "에러!",
                text: "잘못된 접근이에요!",
                showConfirmButton: false,
                timer: 1500,
            }).then((res) => {
                navigate("/main");
            });
        }
    });

    useEffect(() => {
        fetchTagList().then((res) => {
            if (res.code === 200) {
                setTagList(res.data.map((option) => option));
            } else {
                console.error("태그 정보 가져오기 실패");
            }
        });
    }, []);

    //
    useEffect(() => {
        setOriginalProfileImgPath(userInfo.profileImgPath);
    }, [userInfo.profileImgPath]);

    const navigate = useNavigate();

    // handleProfileImageChange : 프로필 사진 변경 탐색 버튼 동작
    const handleProfileImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result);
                setNewProfileImageFile(file);
                setUserInfo({ ...userInfo, profileImgPath: reader.result });
                state.profileImgPath = reader.result; // Update state with new profile image
            };
            reader.readAsDataURL(file);
        }
    };

    // handleProfileEditClick : 프로필 사진 변경 동작
    const handleProfileEditClick = () => {
        setIsEditingProfile(true);
    };

    // handleProfileEditCancel : 프로필 사진 변경 취소 동작
    const handleProfileEditCancel = () => {
        setIsEditingProfile(false);
        setProfileImage(null);
        setNewProfileImageFile(null);
        setUserInfo((prevState) => ({
            ...prevState,
            profileImgPath: originalProfileImgPath,
        }));
    };

    // updateMember : 회원 정보 수정 api 요청
    const updateMember = async () => {
        try {
            let data = userInfo;
            const interestData = interests
                .filter((item) => item !== "")
                .map((item) => {
                    const tag = tagList.find((tag) => tag.name === item);
                    return tag ? { tagId: tag.id, TagName: tag.name } : null;
                })
                .filter((tag) => tag !== null);
            if (userInfo.password === "") {
                data = {
                    id: userInfo.id,
                    password: "",
                    userName: userInfo.userName,
                    profileImageUrl:
                        newProfileImageFile === null && !isEditingProfile
                            ? userInfo.profileImgPath
                            : null,
                    interestId: interestData,
                };
            } else {
                data = {
                    id: userInfo.id,
                    password: userInfo.password,
                    userName: userInfo.userName,
                    profileImageUrl:
                        newProfileImageFile === null && !isEditingProfile
                            ? userInfo.profileImgPath
                            : null,
                    interestId: interestData,
                };
            }
            const res = await api.put(
                "/api/member/update",
                data,
                "profileImage",
                newProfileImageFile
            );
            if (res.data.code === 200) {
                state.password = data.password;
                state.profileImgPath = res.data.data.profileImgPath;
                setUserInfo({ ...userInfo, password: "" });
                return true;
            } else {
                return false;
            }
        } catch (error) {
            Swal.fire({
                position: "center",
                icon: "error",
                title: "에러!",
                text: "서버와의 통신에 문제가 생겼어요!",
                showConfirmButton: false,
                timer: 1500,
            });
        }
    };
    // handleUpdate : 회원 수정 버튼 동작
    const handleUpdate = async () => {
        Swal.fire({
            icon: "question",
            title: "정보를 수정하시겠나요?",
            showCancelButton: true,
            confirmButtonText: "수정",
            cancelButtonText: "취소",
        }).then(async (res) => {
            if (res.isConfirmed) {
                const res = await updateMember();
                if (res) {
                    Swal.fire({
                        position: "center",
                        icon: "success",
                        title: "정상적으로 변경되었어요!",
                        showConfirmButton: false,
                        timer: 1500,
                    });
                } else {
                    Swal.fire({
                        position: "center",
                        icon: "error",
                        html: `변경 중 오류가 발생했어요!<br>잠시 후, 다시 한 번 시도해주세요!`,
                        showConfirmButton: false,
                        timer: 1500,
                    });
                }
            } else {
                Swal.fire({
                    position: "center",
                    icon: "info",
                    title: "수정을 취소했어요.",
                    showConfirmButton: false,
                    timer: 1500,
                });
            }
        });
    };
    const deleteMember = async (password) => {
        const res = await api.post("/api/member/withdrawalReq", {
            id: userInfo.id,
            password: password,
        });
        if (res.data.data) {
            return res.data.data;
        }
    };
    // handleDelete : 회원 탈퇴 버튼 동작
    const handleDelete = async () => {
        Swal.fire({
            icon: "warning",
            title: "회원탈퇴",
            html: `정말로 탈퇴할거에요?<br>탈퇴 시, 모든 정보가 사라져요!`,
            input: "password",
            inputPlaceholder: "비밀번호",
            showCancelButton: true,
            confirmButtonText: "탈퇴",
            cancelButtonText: "취소",
            showLoaderOnConfirm: true,
            preConfirm: async (password) => {
                const res = await deleteMember(password);
                if (!res) {
                    return Swal.showValidationMessage("비밀번호가 달라요!");
                }
                return res;
            },
        }).then(async (res) => {
            if (res.isConfirmed) {
                localStorage.clear();
                Swal.fire({
                    position: "center",
                    icon: "success",
                    title: "탈퇴완료",
                    text: "다음에 또 방문해주세요!",
                    showConfirmButton: false,
                    timer: 1500,
                });
                navigate("/");
            } else {
                Swal.fire({
                    position: "center",
                    icon: "info",
                    title: "탈퇴를 취소했어요!",
                    showConfirmButton: false,
                    timer: 1500,
                });
            }
        });
    };

    // handleBack : 뒤로가기 버튼 동작(/main으로 이동)
    const handleBack = () => {
        navigate("/main");
    };

    useEffect(() => {
        const fetchData = async () => {
            const res = await api.post("/api/member/info", {
                id: idRef.current,
                password: passwordRef.current,
            });
            const id = res.data.data.id;
            const username = res.data.data.userName;
            const profileImgPath = res.data.data.profileimagePath;
            const interest = res.data.data.interest;
            if (res) {
                setUserInfo({
                    id: id,
                    password: "",
                    userName: username,
                    profileImgPath: profileImgPath,
                    interest: interest.map((item) => item.tagName),
                });
                setInterests(interest.map((item) => item.tagName));
            }
        };
        fetchData();
    }, []);
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <button className={styles.backButton} onClick={handleBack}>
                    {"<"}
                </button>
                <h1 className={styles.title}>내정보</h1>
            </div>
            <div className={styles.content}>
                <div className={styles.profileImageContainer}>
                    {profileImage ? (
                        <img
                            src={profileImage}
                            alt="profile"
                            className={styles.profileImage}
                        />
                    ) : state?.profileImgPath ? (
                        <img
                            src={state.profileImgPath}
                            alt="profile"
                            className={styles.profileImage}
                        />
                    ) : (
                        <UserOutlined style={{ fontSize: "150px" }} />
                    )}
                    <div
                        className={styles.editIcon}
                        onClick={handleProfileEditClick}
                    >
                        <EditOutlined style={{ fontSize: "24px" }} />
                    </div>
                    {isEditingProfile && (
                        <div className={styles.profileEditContainer}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleProfileImageChange}
                            />
                            <button onClick={handleProfileEditCancel}>
                                취소
                            </button>
                        </div>
                    )}
                </div>
                <div className={styles.inputContainer}>
                    <label>닉네임</label>
                    <input
                        type="text"
                        value={userInfo.userName}
                        onChange={(e) =>
                            setUserInfo({
                                ...userInfo,
                                userName: e.target.value,
                            })
                        }
                        className={styles.inputField}
                    />
                </div>
                <div className={styles.inputContainer}>
                    <label>비밀번호</label>
                    <input
                        type="password"
                        value={userInfo.password}
                        onChange={(e) =>
                            setUserInfo({
                                ...userInfo,
                                password: e.target.value,
                            })
                        }
                        className={styles.inputField}
                    />
                </div>
                <div className={styles.inputContainer}>
                    <label>관심사</label>
                    {interests.map((interest, index) => (
                        <select
                            key={index}
                            id={`interest-${index}`}
                            style={{ marginRight: "10px" }}
                            value={interest}
                            onChange={(e) => handleInterestChange(index, e)}
                            required
                        >
                            <option value="" disabled>
                                선택하세요
                            </option>
                            {tagList
                                .filter(
                                    (tag) =>
                                        !interests.includes(tag.name) ||
                                        tag.name === interest
                                )
                                .map((tag) => (
                                    <option key={tag.id} value={tag.name}>
                                        {tag.name}
                                    </option>
                                ))}
                        </select>
                    ))}
                </div>
                <div className={styles.buttonContainer}>
                    <button
                        className={styles.updateButton}
                        onClick={handleUpdate}
                    >
                        변경
                    </button>
                    <button
                        className={styles.deleteButton}
                        onClick={handleDelete}
                    >
                        탈퇴
                    </button>
                </div>
            </div>
        </div>
    );
};
export default SettingPage;
