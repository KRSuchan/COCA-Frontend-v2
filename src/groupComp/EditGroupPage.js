import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { UserOutlined } from "@ant-design/icons";
import styles from "../css/GroupPage.module.css";
import api from "../security/CocaApi";
import Swal from "sweetalert2";
import { useDispatch } from "react-redux";
import { Modal, Button } from "antd";
import { showLoginRequired } from "../security/ErrorController";

const EditGroupPage = () => {
    useEffect(() => {
        const id = localStorage.getItem("userId");
        if (id === null) {
            showLoginRequired(navigate);
        }
    }, []);

    const { groupId } = useParams();
    const navigate = useNavigate();

    // useState를 사용하여 그룹 정보 상태 관리
    const [groupDetails, setGroupDetails] = useState(null);
    const [availableTags, setAvailableTags] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentManagerIndex, setCurrentManagerIndex] = useState(null);
    const [members, setMembers] = useState([]);
    const [privatePassword, setPrivatePassword] = useState("");
    const [originalManager, setOriginalManager] = useState([]);
    const [membersToManager, setMembersToManager] = useState([]);
    const [managersToMember, setManagerToMember] = useState([]);
    const dispatch = useDispatch();

    useEffect(() => {
        if (groupId) {
            fetchGroupDetails(groupId).then((response) => {
                if (response && response.code === 200) {
                    setGroupDetails(response.data);
                    setOriginalManager(response.data.groupManagers);
                    setPrivatePassword(response.data.privatePassword || "");
                } else {
                    // 백엔드에서 데이터를 가져오지 못했을 때 더미 데이터 사용
                    console.error(
                        "그룹 정보를 가져오는데 실패했습니다. 더미 데이터를 사용합니다."
                    );
                    setGroupDetails({
                        groupId: 11,
                        name: "수정NAME",
                        description: "테스트그룹 설명5",
                        privatePassword: "1234",
                        groupTags: [
                            { id: 1, field: "IT", name: "스프링" },
                            { id: 2, field: "IT", name: "리액트" },
                            { id: 3, field: "IT", name: "자바" },
                        ],
                        groupMembers: [
                            {
                                id: "TESTID1",
                                userName: "TESTNAME1",
                                profileImgPath: "TESTURL1",
                            },
                            {
                                id: "TESTID2",
                                userName: "TESTNAME2",
                                profileImgPath: "TESTURL2",
                            },
                        ],
                        groupManagers: [
                            {
                                id: "TESTID1",
                                userName: "TESTNAME1",
                                profileImgPath:
                                    "https://d2u3dcdbebyaiu.cloudfront.net/uploads/atch_img/35/23dc85ac1d8c845da121c12ff644d920_res.jpeg",
                            },
                            {
                                id: "TESTID2",
                                userName: "TESTNAME2",
                                profileImgPath: null,
                            },
                        ],
                        groupNotice: "초기 공지사항",
                    });
                    setPrivatePassword("1234");
                }
            });
            fetchTags().then((response) => {
                if (response && response.code === 200) {
                    setAvailableTags(response.data);
                } else {
                    console.error("태그 정보를 가져오는데 실패했습니다.");
                    // 태그 정보를 가져오지 못했을 때 더미 데이터 사용
                    setAvailableTags([
                        { id: 1, field: "IT", name: "스프링" },
                        { id: 2, field: "IT", name: "자바" },
                        { id: 3, field: "IT", name: "리액트" },
                        { id: 4, field: "IT", name: "자바스크립트" },
                        { id: 5, field: "여행", name: "일본" },
                        { id: 6, field: "여행", name: "미국" },
                        { id: 7, field: "여행", name: "영국" },
                        { id: 8, field: "여행", name: "호주" },
                    ]);
                }
            });
        }
    }, [groupId]);

    // 백엔드에서 그룹 정보를 가져오는 함수 (미구현 상태)
    const fetchGroupDetails = async (groupId) => {
        const data = {
            member: {
                id: localStorage.getItem("userId"),
                // password: "a"
            },
            group: {
                id: groupId,
            },
        };

        const res = await api.post(navigate, `/api/group/admin`, data);

        return res.data;
        // 403 접근 제한 에러일 경우
        // Swal.fire({
        //     position: "center",
        //     icon: "error",
        //     title: "에러!",
        //     text: "접근할 수 없는 페이지에요!",
        //     showConfirmButton: false,
        //     timer: 1500,
        // }).then((res) => {
        //     navigate("/main");
        // });
    };

    // 백엔드에서 태그 목록을 가져오는 함수
    const fetchTags = async () => {
        // TODO: 백엔드 API 호출 로직 구현
        const res = await api.get(navigate, "/api/tag/all");
        return res.data;
    };

    // 백엔드에서 멤버 목록을 가져오는 함수
    const fetchMembers = async () => {
        const res = await api.get(
            navigate,
            `/api/group/list/members/member/${localStorage.getItem(
                "userId"
            )}/group/${groupId}`
        );
        return res.data.data;
    };

    const updateGroup = async () => {
        // TODO: 백엔드에 그룹 정보를 저장하는 로직 구현
        const originalManagerIds = originalManager.map((manager) => manager.id); // originalManager의 id들만 추출

        const member2manager = groupDetails.groupManagers.filter(
            (manager) => !originalManagerIds.includes(manager.id) // originalManager에 없는 항목만 필터링
        );

        console.log(member2manager);

        const groupManagerIds = groupDetails.groupManagers.map(
            (manager) => manager.id
        ); // groupDetails.groupManagers의 id들만 추출

        const manager2member = originalManager.filter(
            (manager) => !groupManagerIds.includes(manager.id) // groupManagerIds에 manager.id가 포함되지 않는 경우만 필터링
        );

        console.log(manager2member);

        let groupData = {
            group: {
                id: groupDetails.groupId,
                name: groupDetails.name,
                description: groupDetails.description,
            },
            admin: {
                id: localStorage.getItem("userId"),
            },
            groupTags: groupDetails.groupTags,
            notice: {
                contents:
                    groupDetails.groupNotice === ""
                        ? null
                        : groupDetails.groupNotice,
            },
            membersToManager: member2manager,
            managersToMember: manager2member,
        };

        const res = await api.put(navigate, "/api/group/update", groupData);
        if (res) return true;
        else return false;
    };

    const handleSave = async () => {
        Swal.fire({
            icon: "question",
            title: "그룹 정보를 수정하시겠나요?",
            showCancelButton: true,
            confirmButtonText: "수정",
            cancelButtonText: "취소",
        }).then(async (res) => {
            if (res.isConfirmed) {
                const res = await updateGroup();

                if (res) {
                    Swal.fire({
                        position: "center",
                        icon: "success",
                        title: "정상적으로 변경되었어요!",
                        showConfirmButton: false,
                        timer: 1500,
                    }).then((res) => {
                        window.location.reload();
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

    const deleteGroup = async () => {
        const res = await api.del(
            navigate,
            `/api/group/delete?adminId=${localStorage.getItem(
                "userId"
            )}&groupId=${groupId}`
        );
        if (res) return true;
        else return false;
    };

    const handleDelete = async () => {
        Swal.fire({
            icon: "warning",
            title: "그룹 삭제",
            html: `정말로 그룹을 삭제하시겠나요?<br>삭제 시, 모든 정보가 사라져요!`,
            input: "password",
            inputPlaceholder: "로그인 비밀번호를 입력해주세요!",
            showCancelButton: true,
            confirmButtonText: "삭제",
            cancelButtonText: "취소",
            showLoaderOnConfirm: true,
            preConfirm: async (password) => {
                const data = {
                    id: localStorage.getItem("userId"),
                    password: password,
                };
                const res = await api.post(
                    navigate,
                    "/api/member/checkPassword",
                    data
                );
                if (!res) {
                    return Swal.showValidationMessage("비밀번호가 달라요!");
                }

                return res;
            },
        }).then(async (res) => {
            if (res.isConfirmed) {
                const response = await deleteGroup();

                if (response) {
                    Swal.fire({
                        position: "center",
                        icon: "success",
                        title: "삭제완료",
                        text: "그룹이 정상적으로 삭제되었어요!",
                        showConfirmButton: false,
                        timer: 1500,
                    }).then((res) => {
                        dispatch({ type: "RESET_STATE", payload: null });
                        navigate("/main");
                        window.location.reload();
                    });
                }
            } else {
                Swal.fire({
                    position: "center",
                    icon: "info",
                    title: "삭제를 취소했어요!",
                    showConfirmButton: false,
                    timer: 1500,
                });
            }
        });
    };

    const handleCancel = () => {
        navigate(-1);
    };

    const handleManagerChange = (index, newManager) => {
        if (!groupDetails) return;
        const newManagers = [...groupDetails.groupManagers];
        newManagers[index] = newManager;
        setGroupDetails({ ...groupDetails, groupManagers: newManagers });
    };

    const handleManagerDelete = (index) => {
        const newManagers = [...groupDetails.groupManagers];
        newManagers.splice(index, 1);
        setGroupDetails({ ...groupDetails, groupManagers: newManagers });
    };

    const handleManagerSave = (index) => {
        // TODO: 백엔드에서 프사 다시 받아오는 기능 구현
        console.log(`Save manager at index ${index}`);
    };

    const openMemberModal = async (index) => {
        const members = await fetchMembers();
        const filteredMembers = members.filter(
            (member) =>
                !groupDetails.groupManagers.some(
                    (manager) => manager.id === member.id
                )
        );
        setMembers(filteredMembers);
        setCurrentManagerIndex(index);
        setIsModalOpen(true);
    };

    const handleMemberSelect = (member) => {
        handleManagerChange(currentManagerIndex, member);
        setIsModalOpen(false);
    };

    if (!groupDetails) {
        return <div>Loading...</div>;
    }

    return (
        <div style={{ padding: "50px 200px" }}>
            {" "}
            {/* 패딩 추가 */}
            <div className={styles.createGroupPageBox}>
                <span className={styles.groupNameTitle}>그룹 수정</span>
                <div className={styles.createGroupPage}>
                    <p className={styles.title2}>그룹 기본정보</p>
                    <input
                        type="text"
                        placeholder="그룹 이름"
                        value={groupDetails.name}
                        onChange={(e) =>
                            setGroupDetails({
                                ...groupDetails,
                                name: e.target.value,
                            })
                        }
                        className={styles.input}
                    />
                    <textarea
                        placeholder="그룹 설명"
                        value={groupDetails.description}
                        onChange={(e) =>
                            setGroupDetails({
                                ...groupDetails,
                                description: e.target.value,
                            })
                        }
                        className={styles.textarea}
                    />
                    <textarea
                        placeholder="공지사항"
                        value={groupDetails.groupNotice}
                        onChange={(e) =>
                            setGroupDetails({
                                ...groupDetails,
                                groupNotice: e.target.value,
                            })
                        }
                        className={styles.textarea}
                    />
                    <p className={styles.title2}>그룹 매니저</p>
                    <div
                        className={styles.managersContainer}
                        style={{
                            display: "flex",
                            overflowX: "auto",
                            whiteSpace: "nowrap",
                            gap: "20px",
                        }}
                    >
                        {groupDetails.groupManagers.map((manager, index) => (
                            <div
                                key={index}
                                className={styles.managerInfo}
                                style={{
                                    display: "inline-block",
                                    textAlign: "center",
                                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                                    borderRadius: "10px",
                                    padding: "10px",
                                    backgroundColor: "#f0f0f0",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                {manager ? (
                                    <>
                                        <div
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                            }}
                                        >
                                            {manager.profileImgPath ? (
                                                <img
                                                    src={manager.profileImgPath}
                                                    alt="매니저 사진"
                                                    className={
                                                        styles.managerImage
                                                    }
                                                    style={{
                                                        width: "80px",
                                                        height: "80px",
                                                        borderRadius: "50%",
                                                        objectFit: "cover",
                                                    }}
                                                />
                                            ) : (
                                                <UserOutlined
                                                    style={{ fontSize: "80px" }}
                                                />
                                            )}
                                            <div
                                                className={styles.input}
                                                style={{
                                                    marginTop: "8px",
                                                    fontWeight: "bold",
                                                    color: "#333",
                                                }}
                                            >
                                                {manager.userName}
                                            </div>
                                        </div>
                                        {index !== 0 && (
                                            <div
                                                style={{
                                                    display: "flex",
                                                    flexDirection: "row",
                                                    alignItems: "center",
                                                    marginTop: "0px",
                                                }}
                                            >
                                                <button
                                                    onClick={() =>
                                                        handleManagerDelete(
                                                            index
                                                        )
                                                    }
                                                    className={
                                                        styles.joinButton
                                                    }
                                                    style={{
                                                        marginBottom: "4px",
                                                    }}
                                                >
                                                    해임
                                                </button>
                                                {/* <button onClick={() => handleManagerSave(index)} className={styles.joinButton}>저장</button> */}
                                                <button
                                                    onClick={() =>
                                                        openMemberModal(index)
                                                    }
                                                    className={
                                                        styles.joinButton
                                                    }
                                                >
                                                    선택
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            height: "100%",
                                        }}
                                    >
                                        <button
                                            onClick={() =>
                                                openMemberModal(index)
                                            }
                                            className={styles.joinButton}
                                        >
                                            추가
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                        <div
                            className={styles.managerInfo}
                            style={{
                                display: "inline-block",
                                textAlign: "center",
                                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                                borderRadius: "10px",
                                padding: "10px",
                                backgroundColor: "#f0f0f0",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            <button
                                onClick={() =>
                                    openMemberModal(
                                        groupDetails.groupManagers.length
                                    )
                                }
                                className={styles.joinButton}
                            >
                                추가
                            </button>
                        </div>
                    </div>
                    <p className={styles.title2}>그룹분야</p>
                    <div style={{ display: "flex", gap: "10px" }}>
                        {[0, 1, 2].map((index) => (
                            <select
                                key={index}
                                value={groupDetails.groupTags[index]?.id || ""}
                                onChange={(e) => {
                                    const newTags = [...groupDetails.groupTags];
                                    const selectedTag = availableTags.find(
                                        (t) => t.id === parseInt(e.target.value)
                                    );
                                    newTags[index] = selectedTag;
                                    setGroupDetails({
                                        ...groupDetails,
                                        groupTags: newTags,
                                    });
                                }}
                                className={styles.input}
                            >
                                <option value="" disabled>
                                    태그 선택
                                </option>
                                {availableTags
                                    .filter(
                                        (option) =>
                                            !groupDetails.groupTags.some(
                                                (tag, tagIndex) =>
                                                    tag?.id === option.id &&
                                                    tagIndex !== index
                                            )
                                    )
                                    .map((option) => (
                                        <option
                                            key={option.id}
                                            value={option.id}
                                        >
                                            {option.name}
                                        </option>
                                    ))}
                            </select>
                        ))}
                    </div>
                    {privatePassword !== null && (
                        <>
                            <p className={styles.title2}>비밀번호</p>
                            <input
                                type="password"
                                placeholder="비밀번호"
                                value={privatePassword}
                                onChange={(e) =>
                                    setPrivatePassword(e.target.value)
                                }
                                className={styles.input}
                                style={{
                                    marginTop: "8px",
                                    fontWeight: "bold",
                                    color: "#333",
                                    padding: "10px",
                                    borderRadius: "5px",
                                    border: "1px solid #ccc",
                                }}
                                required
                            />
                        </>
                    )}
                </div>
                <button onClick={handleSave} className={styles.joinButton}>
                    저장
                </button>
                <button onClick={handleDelete} className={styles.joinButton}>
                    삭제
                </button>
                <button onClick={handleCancel} className={styles.joinButton}>
                    취소
                </button>
            </div>
            <Modal
                title="멤버 선택"
                visible={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={[
                    <Button key="cancel" onClick={() => setIsModalOpen(false)}>
                        취소
                    </Button>,
                    <Button
                        key="ok"
                        type="primary"
                        onClick={() => setIsModalOpen(false)}
                    >
                        확인
                    </Button>,
                ]}
                getContainer={false}
                destroyOnClose={true}
            >
                <div className={styles.membersContainer}>
                    {members.map((member) => (
                        <div
                            key={member.id}
                            className={styles.memberInfo}
                            onClick={() => handleMemberSelect(member)}
                        >
                            {member.profileImgPath ? (
                                <img
                                    src={member.profileImgPath}
                                    alt="멤버 사진"
                                    className={styles.memberImage}
                                    style={{
                                        maxWidth: "80px",
                                        maxHeight: "80px",
                                    }}
                                />
                            ) : (
                                <UserOutlined style={{ fontSize: "40px" }} />
                            )}
                            <div className={styles.memberName}>
                                {member.userName}
                            </div>
                        </div>
                    ))}
                </div>
            </Modal>
        </div>
    );
};

export default EditGroupPage;
