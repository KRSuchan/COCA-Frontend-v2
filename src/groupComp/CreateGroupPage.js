// CreateGroupPage.js
import React, { useState, useEffect } from "react";
import styles from "../css/GroupPage.module.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { refreshAccessToken } from "../security/TokenManage";
import Swal from "sweetalert2";

const CreateGroupPage = () => {
    const [groupName, setGroupName] = useState("");
    const [groupDescription, setGroupDescription] = useState("");
    // const [managerIds, setManagerIds] = useState(['', '']); // 매니저 관련 코드 주석 처리
    const [interests, setInterests] = useState(["", "", ""]);
    const [interestOptions, setInterestOptions] = useState([]); // 관심분야 옵션을 상태로 관리
    const [tags, setTags] = useState([]);
    const [isPrivate, setIsPrivate] = useState(false); // 그룹의 비공개 여부 상태
    const [privatePassword, setPrivatePassword] = useState(""); // 비공개 그룹 비밀번호 상태
    const [isPasswordRequired, setIsPasswordRequired] = useState(false); // 비밀번호 필수 여부 상태

    const navigate = useNavigate();

    // 백엔드에서 관심분야 목록을 가져오는 함수
    const fetchInterestOptions = async () => {
        // 백엔드 API 호출 로직 구현 예정

        try {
            const res = await axios.get(
                process.env.REACT_APP_SERVER_URL + "/api/tag/all"
            );

            console.log("tag", res.data);

            return res.data;
        } catch (error) {
            console.error(error);
            return null;
        }
    };

    useEffect(() => {
        fetchInterestOptions().then(response => {
            if (response.code === 200) {
                setInterestOptions(response.data.map(option => option.name));
                setTags(response.data.map(option => option));
            } else {
                console.error("관심분야 정보를 가져오는데 실패했습니다.");
            }
        });
    }, []);

    const createGroupAxios = async () => {
        const groupData = {
            member: {
                id: localStorage.getItem("userId"), // TODO : 관리자 두명? -> 일단 처음 생성 시에는 생성하는 본인이 관리자가 되는 게 맞을 듯.
            },
            group: {
                name: groupName,
                description: groupDescription,
                privatePassword: isPrivate ? privatePassword : null, // 비공개 그룹일 경우 비밀번호 추가
            },
            groupTags: interests
                .filter(interest => interest)
                .map(interest => {
                    const tag = tags.find(option => option.name === interest);
                    console.log(tags);
                    console.log("tagg", tag);
                    return {
                        tag: {
                            id: tag.id,
                            field: tag.field,
                            name: tag.name,
                        },
                    };
                }),
        };

        const accessToken = localStorage.getItem("accessToken");

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            };
            const res = await axios.post(
                process.env.REACT_APP_SERVER_URL + "/api/group/add",
                groupData,
                config
            );

            console.log(res);

            if (res.data.code === 201) {
                Swal.fire({
                    position: "center",
                    icon: "success",
                    title: "생성 완료",
                    text: "성공적으로 그룹을 생성했어요!",
                    showConfirmButton: false,
                    timer: 1500,
                }).then(res => {
                    navigate("/main");
                });
            } else if (res.data.code === 401) {
                await refreshAccessToken(navigate);
                createGroupAxios();
            } else {
                throw new Error("unknown Error");
            }
        } catch (error) {
            console.error(error);
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

    const handleCreateGroup = async () => {
        //✅ 그룹생성버튼 눌렀을때
        if (isPrivate && !privatePassword) {
            setIsPasswordRequired(true);
            return;
        }

        createGroupAxios();
    };

    const handleInterestChange = (index, value) => {
        setInterests(
            interests.map((interest, i) => (i === index ? value : interest))
        );
    };

    return (
        <div className={styles.createGroupPageBox}>
            <span className={styles.groupNameTitle}>그룹생성</span>
            <div className={styles.createGroupPage}>
                <p className={styles.title2}>그룹 기본정보</p>
                <input
                    type="text"
                    placeholder="그룹 이름"
                    value={groupName}
                    onChange={e => setGroupName(e.target.value)}
                    className={styles.input}
                />
                <textarea
                    placeholder="그룹 설명"
                    value={groupDescription}
                    onChange={e => setGroupDescription(e.target.value)}
                    className={styles.textarea}
                />
                {/* 매니저 입력 필드 주석 처리
            <span className={styles.title2}>관리자</span>
            {managerIds.map((id, index) => (
                <input
                key={index}
                type="text"
                placeholder={`매니저 ID ${index + 1}`}
                value={id}
                onChange={(e) => {
                    const newManagerIds = [...managerIds];
                    newManagerIds[index] = e.target.value;
                    setManagerIds(newManagerIds);
                }}
                className={styles.input}
                />
            ))}
            */}
                <span className={styles.title2}>관심분야</span>
                {interests.map((interest, index) => (
                    <select
                        key={index}
                        value={interest}
                        onChange={e =>
                            handleInterestChange(index, e.target.value)
                        }
                        className={styles.select}>
                        <option value="">관심분야 선택</option>
                        {interestOptions
                            .filter(
                                option =>
                                    !interests.includes(option) ||
                                    option === interest
                            )
                            .map(option => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                    </select>
                ))}
                <span className={styles.title2}>비공개 여부</span>
                <div
                    style={{
                        backgroundColor: "#f2f2f2",
                        padding: "10px",
                        borderRadius: "5px",
                    }}>
                    <input
                        type="checkbox"
                        checked={isPrivate}
                        onChange={e => {
                            setIsPrivate(e.target.checked);
                            if (!e.target.checked) {
                                setPrivatePassword("");
                                setIsPasswordRequired(false);
                            }
                        }}
                        style={{
                            marginLeft: "10px",
                            width: "20px",
                            height: "20px",
                            cursor: "pointer",
                        }}
                    />
                    <label
                        style={{
                            fontWeight: "bold",
                            fontSize: "16px",
                            color: "#333",
                        }}>
                        {isPrivate ? "  비공개 그룹🔒" : "  공개 그룹🔓"}으로
                        그룹을 생성합니다.
                    </label>
                </div>
                {isPrivate && (
                    <input
                        type="password"
                        placeholder="비밀번호"
                        value={privatePassword}
                        onChange={e => {
                            setPrivatePassword(e.target.value);
                            setIsPasswordRequired(false);
                        }}
                        className={styles.input}
                        style={{
                            marginTop: "10px",
                            borderColor: isPasswordRequired ? "red" : "",
                        }}
                    />
                )}
                {isPasswordRequired && (
                    <p style={{ color: "red" }}>비밀번호를 입력해주세요.</p>
                )}
            </div>
            <button onClick={handleCreateGroup} className={styles.joinButton}>
                그룹생성
            </button>
        </div>
    );
};

export default CreateGroupPage;
