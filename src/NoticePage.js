import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserOutlined } from "@ant-design/icons";
import { Tabs, Card, Avatar, Button } from "antd";
import styles from "./css/NoticePage.module.css";
import Swal from "sweetalert2";
import api from "./security/CocaApi";
const { TabPane } = Tabs;

const NoticePage = () => {
    const navigate = useNavigate();
    const [tab, setTab] = useState("일정");
    const [schedules, setSchedules] = useState([]);
    const [friends, setFriends] = useState([]);
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        // 백엔드에서 추가적인 일정 데이터를 가져오는 로직은 생략
        const setData = async () => {
            const scheduleData = await fetchScheduleRequestData();
            const groupData = await fetchGroupRequestData();
            const friendData = await fetchFriendRequestData();

            if (scheduleData) setSchedules(scheduleData);
            if (groupData) setGroups(groupData);
            if (friendData) setFriends(friendData);
        };

        setData();
    }, []);

    const handleBack = () => {
        navigate(-1);
    };

    const fetchScheduleRequestData = async () => {
        const res = await api.get(
            `/api/request/list/schedule/member/${localStorage.getItem(
                "userId"
            )}`
        );
        if (res.data.code === 200) {
            return res.data.data;
        }
    };

    const fetchFriendRequestData = async () => {
        const res = await api.get(
            `/api/request/list/friend/member/${localStorage.getItem("userId")}`
        );
        if (res.data.code === 200) {
            return res.data.data;
        }
    };

    const fetchGroupRequestData = async () => {
        const res = await api.get(
            `/api/request/list/group-invite/member/${localStorage.getItem(
                "userId"
            )}`
        );
        if (res.data.code === 200) {
            return res.data.data;
        }
    };

    // 일정 통신
    const updateScheduleRequest = async (id, status) => {
        const res = await api.put("/api/request/update/schedule", {
            requestId: id,
            status: status,
        });
        if (res.data.code === 200) {
            return true;
        } else return false;
    };

    const deleteScheduleRequest = async (id) => {
        const res = await api.del(`/api/request/delete/schedule/${id}`);
        if (res.data.code === 200) {
            return true;
        } else return false;
    };

    const handleScheduleApproval = async (id) => {
        // 일정 승인 버튼에 대한 함수
        const res = await updateScheduleRequest(id, "ACCEPTED");

        if (res) {
            Swal.fire({
                position: "center",
                icon: "success",
                title: "수락 완료",
                text: "일정이 정상적으로 등록되었어요!",
                showConfirmButton: false,
                timer: 1500,
            }).then((res) => {
                window.location.reload();
            });
        }
    };

    const handleScheduleRejection = async (id) => {
        // 일정 거절 버튼에 대한 함수
        const res = await updateScheduleRequest(id, "REJECTED");

        if (res) {
            Swal.fire({
                position: "center",
                icon: "success",
                title: "거절 완료",
                text: "일정 등록을 거절했어요.",
                showConfirmButton: false,
                timer: 1500,
            }).then((res) => {
                window.location.reload();
            });
        }
    };

    const handleScheduleDeletion = async (id) => {
        // 일정 삭제 버튼에 대한 함수
        const res = await deleteScheduleRequest(id);

        if (res) {
            Swal.fire({
                position: "center",
                icon: "success",
                title: "삭제 완료",
                text: "알림이 정상적으로 삭제되었어요!",
                showConfirmButton: false,
                timer: 1500,
            }).then((res) => {
                window.location.reload();
            });
        }
    };

    // 친구 통신
    const updateFriendRequest = async (id, status) => {
        const res = await api.put("/api/request/update/friend", {
            requestId: id,
            status: status,
        });
        if (res.data.code === 200) {
            return true;
        } else return false;
    };

    const deleteFriendRequest = async (id) => {
        await api.delete(`/api/request/delete/friend/${id}`);
        return false;
    };

    const handleFriendAcceptance = async (id) => {
        // 친구 수락 버튼에 대한 함수
        const res = await updateFriendRequest(id, "ACCEPTED");

        if (res) {
            Swal.fire({
                position: "center",
                icon: "success",
                title: "수락 완료",
                text: "친구가 정상적으로 등록되었어요!",
                showConfirmButton: false,
                timer: 1500,
            }).then((res) => {
                window.location.reload();
            });
        }
    };

    const handleFriendRejection = async (id) => {
        // 친구 거절 버튼에 대한 함수
        const res = await updateFriendRequest(id, "REJECTED");

        if (res) {
            Swal.fire({
                position: "center",
                icon: "success",
                title: "거절 완료",
                text: "친구 요청을 거절했어요.",
                showConfirmButton: false,
                timer: 1500,
            }).then((res) => {
                window.location.reload();
            });
        }
    };

    const handleFriendDeletion = async (id) => {
        // 친구 삭제 버튼에 대한 함수
        const res = await deleteFriendRequest(id);

        if (res) {
            Swal.fire({
                position: "center",
                icon: "success",
                title: "삭제 완료",
                text: "알림이 정상적으로 삭제되었어요!",
                showConfirmButton: false,
                timer: 1500,
            }).then((res) => {
                window.location.reload();
            });
        }
    };

    // 그룹 통신
    const updateGroupRequest = async (id, status) => {
        const res = await api.put("/api/request/update/group-invite", {
            requestId: id,
            status: status,
        });
        if (res.data.code === 200) {
            return true;
        } else return false;
    };

    const deleteGroupRequest = async (id) => {
        const res = await api.delete(`/api/request/delete/group-invite/${id}`);

        if (res.data.code === 200) {
            return true;
        } else return false;
    };

    const handleGroupAcceptance = async (id) => {
        // 그룹 수락 버튼에 대한 함수
        const res = await updateGroupRequest(id, "ACCEPTED");

        if (res) {
            Swal.fire({
                position: "center",
                icon: "success",
                title: "수락 완료",
                text: "그룹에 정상적으로 가입했어요!",
                showConfirmButton: false,
                timer: 1500,
            }).then((res) => {
                window.location.reload();
            });
        }
    };

    const handleGroupRejection = async (id) => {
        // 그룹 거절 버튼에 대한 함수
        const res = await updateGroupRequest(id, "ACCEPTED");

        if (res) {
            Swal.fire({
                position: "center",
                icon: "success",
                title: "거절 완료",
                text: "그룹 초대를 거절했어요.",
                showConfirmButton: false,
                timer: 1500,
            }).then((res) => {
                window.location.reload();
            });
        }
    };

    const handleGroupDeletion = async (id) => {
        // 그룹 삭제 버튼에 대한 함수
        const res = await deleteGroupRequest(id);

        if (res) {
            Swal.fire({
                position: "center",
                icon: "success",
                title: "삭제 완료",
                text: "알림이 정상적으로 삭제되었어요!",
                showConfirmButton: false,
                timer: 1500,
            }).then((res) => {
                window.location.reload();
            });
        }
    };

    const TabContent = () => (
        <Tabs activeKey={tab} onChange={(key) => setTab(key)}>
            <TabPane
                tab={
                    <span style={{ fontSize: "20px", fontWeight: "bold" }}>
                        일정
                    </span>
                }
                key="일정"
            >
                {schedules.map((schedule) => (
                    <Card
                        key={schedule.requestedScheduleId}
                        style={{ width: "100%", marginTop: 16 }}
                    >
                        <Card.Meta
                            avatar={
                                <Avatar
                                    src={
                                        schedule.sender.profileImagePath || (
                                            <UserOutlined />
                                        )
                                    }
                                />
                            }
                            title={
                                <span
                                    style={{
                                        fontSize: "16px",
                                        fontWeight: "bold",
                                    }}
                                >
                                    {schedule.sender.name}님 / {schedule.title}
                                </span>
                            }
                            description={`${schedule.start} - ${schedule.end}`}
                        />
                        <div style={{ marginTop: "10px" }}>
                            {schedule.status === "PENDING" ? (
                                <>
                                    <Button
                                        type="primary"
                                        style={{ marginRight: "8px" }}
                                        onClick={() =>
                                            handleScheduleApproval(
                                                schedule.requestedScheduleId
                                            )
                                        }
                                    >
                                        승인
                                    </Button>
                                    <Button
                                        type="danger"
                                        onClick={() =>
                                            handleScheduleRejection(
                                                schedule.requestedScheduleId
                                            )
                                        }
                                    >
                                        거절
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    type="danger"
                                    onClick={() =>
                                        handleScheduleDeletion(
                                            schedule.requestedScheduleId
                                        )
                                    }
                                >
                                    삭제
                                </Button>
                            )}
                        </div>
                    </Card>
                ))}
                {schedules.length === 0 && (
                    <Card style={{ width: "100%", marginTop: 16 }}>
                        <Card.Meta
                            title={<span>현재 등록된 알림이 없어요!</span>}
                        />
                    </Card>
                )}
            </TabPane>
            <TabPane
                tab={
                    <span style={{ fontSize: "20px", fontWeight: "bold" }}>
                        친구
                    </span>
                }
                key="친구"
            >
                {friends.map((friend) => (
                    <Card
                        key={friend.friendRequestId}
                        style={{ width: "100%", marginTop: 16 }}
                    >
                        <Card.Meta
                            avatar={
                                <Avatar
                                    src={
                                        friend.sender.profileImagePath || (
                                            <UserOutlined />
                                        )
                                    }
                                />
                            }
                            title={
                                <span
                                    style={{
                                        fontSize: "16px",
                                        fontWeight: "bold",
                                        color: "#41ADCA",
                                    }}
                                >
                                    {friend.sender.name}
                                </span>
                            }
                        />
                        <div style={{ marginTop: "10px" }}>
                            {friend.status === "PENDING" ? (
                                <>
                                    <Button
                                        type="primary"
                                        style={{ marginRight: "8px" }}
                                        onClick={() =>
                                            handleFriendAcceptance(
                                                friend.friendRequestId
                                            )
                                        }
                                    >
                                        수락
                                    </Button>
                                    <Button
                                        type="danger"
                                        onClick={() =>
                                            handleFriendRejection(
                                                friend.friendRequestId
                                            )
                                        }
                                    >
                                        거절
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    type="danger"
                                    onClick={() =>
                                        handleFriendDeletion(
                                            friend.friendRequestId
                                        )
                                    }
                                >
                                    삭제
                                </Button>
                            )}
                        </div>
                    </Card>
                ))}
                {friends.length === 0 && (
                    <Card style={{ width: "100%", marginTop: 16 }}>
                        <Card.Meta
                            title={<span>현재 등록된 알림이 없어요!</span>}
                        />
                    </Card>
                )}
            </TabPane>
            <TabPane
                tab={
                    <span style={{ fontSize: "20px", fontWeight: "bold" }}>
                        그룹
                    </span>
                }
                key="그룹"
            >
                {groups.map((group) => (
                    <Card
                        key={group.groupRequestId}
                        style={{ width: "100%", marginTop: 16 }}
                    >
                        <Card.Meta
                            avatar={
                                <Avatar
                                    src={
                                        group.sender.profileImagePath || (
                                            <UserOutlined />
                                        )
                                    }
                                />
                            }
                            title={
                                <span
                                    style={{
                                        fontSize: "16px",
                                        fontWeight: "bold",
                                    }}
                                >
                                    {group.groupName}
                                </span>
                            }
                        />
                        <div style={{ marginTop: "10px" }}>
                            {group.status === "PENDING" ? (
                                <>
                                    <Button
                                        type="primary"
                                        style={{ marginRight: "8px" }}
                                        onClick={() =>
                                            handleGroupAcceptance(
                                                group.groupRequestId
                                            )
                                        }
                                    >
                                        수락
                                    </Button>
                                    <Button
                                        type="danger"
                                        onClick={() =>
                                            handleGroupRejection(
                                                group.groupRequestId
                                            )
                                        }
                                    >
                                        거절
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    type="danger"
                                    onClick={() =>
                                        handleGroupDeletion(
                                            group.groupRequestId
                                        )
                                    }
                                >
                                    삭제
                                </Button>
                            )}
                        </div>
                    </Card>
                ))}
                {groups.length === 0 && (
                    <Card style={{ width: "100%", marginTop: 16 }}>
                        <Card.Meta
                            title={<span>현재 등록된 알림이 없어요!</span>}
                        />
                    </Card>
                )}
            </TabPane>
        </Tabs>
    );

    return (
        <div
            className={styles.container}
            style={{ fontFamily: "Noto Sans KR" }}
        >
            <div className={styles.header}>
                <button className={styles.backButton} onClick={handleBack}>
                    {"<"}
                </button>
                <h1 className={styles.title}>알림</h1>
                {/* <button className={styles.deleteAllButton} onClick={handleDeleteAll}>전체 삭제</button> */}
                {/* <button className={styles.addButton} onClick={handleDeleteAll} style={{ marginLeft:'10px', backgroundColor: '#41ADCA', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 20px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>전체 삭제</button> */}
            </div>
            <div style={{ width: "100%", height: "100%" }}>
                <TabContent />
            </div>
        </div>
    );
};

export default NoticePage;
