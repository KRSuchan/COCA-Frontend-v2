import { useState, useEffect } from "react";
import { Button, Avatar, Modal, Input } from "antd"; // Modal, Input 추가
import { useNavigate } from "react-router-dom";
import styles from "./css/FriendsPage.module.css";
import { UserOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import "react-big-calendar/lib/css/react-big-calendar.css";

import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import "react-big-calendar/lib/css/react-big-calendar.css";
import api from "./security/CocaApi";
import Swal from "sweetalert2";
import { ko } from "date-fns/locale"; // 한글 로케일 추가
import { showLoginRequired } from "./security/ErrorController";

const FriendsPage = () => {
    const navigate = useNavigate();
    const handleBack = () => {
        // navigate(-1);
        navigate("/main");
    };

    useEffect(() => {
        const id = localStorage.getItem("userId");
        if (id === null) {
            showLoginRequired(navigate);
        }
    }, []);

    const [friends, setFriends] = useState([]);
    const [events, setEvents] = useState([]);
    const [calendarVisible, setCalendarVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false); // 수정 모달창 visible 상태 추가
    const [addModalVisible, setAddModalVisible] = useState(false); // 추가 모달창 visible 상태 추가
    const [selectedFriend, setSelectedFriend] = useState(null); // 선택된 친구 상태 추가
    const [friendNameForUpdate, setFriendNameForUpdate] = useState("");
    const [newFriendId, setNewFriendId] = useState(""); // 새로운 친구 아이디 상태 추가

    const fetchFriendList = async () => {
        const res = await api.get(
            `/api/friend/list/memberId/${localStorage.getItem("userId")}`
        );
        if (res) return res.data;
    };

    useEffect(() => {
        const setData = async () => {
            const res = await fetchFriendList();
            setFriends(res.data); //✨ res 로 변경해둘것 (2차요청사항)
        };

        setData();
    }, []);

    const getFriendCalendar = async (friendid) => {
        const res = await api.get(`/api/friend/schedule/friendId/${friendid}`);
        // const res = await api.get(`/api/friend/schedule?friendId=${friendid}&startDate=${}`);
        console.log(res);
        return res.data;
    };

    const handleCalendarClick = async (friendid) => {
        const res = await getFriendCalendar(friendid);
        setSelectedFriend(friendid);
        setEvents(res.data);
        setCalendarVisible(true);
    };

    const updateFriendProfile = async () => {
        const res = await api.put("/api/friend/update", {
            id: selectedFriend.friendId,
            member: {
                id: localStorage.getItem("userId"),
            },
            opponentNickname: friendNameForUpdate,
        });
    };

    const handleEditClick = (friend) => {
        setSelectedFriend(friend);
        setEditModalVisible(true);
    };

    const handleAddFriend = () => {
        setAddModalVisible(true);
    };

    const addFriend = async () => {
        const res = await api.post(
            `/api/request/add/friend/from/${localStorage.getItem(
                "userId"
            )}/to/${newFriendId}`,
            null
        );

        setAddModalVisible(false);
        setNewFriendId(""); // 입력 필드 초기화

        if (res.data.code === 201) {
            Swal.fire({
                position: "center",
                icon: "success",
                title: "요청 완료!",
                text: "상대방에게 친구 추가를 요청했어요!",
                showConfirmButton: false,
                timer: 1500,
            }).then((res) => {
                window.location.reload();
            });
        } else if (res.data.code === 409) {
            Swal.fire({
                position: "center",
                icon: "error",
                title: "에러!",
                text: "이미 등록된 친구거나, 친구 요청을 이미 보냈어요!",
                showConfirmButton: false,
                timer: 1500,
            });
        }
    };

    const deleteFriend = async (friendId) => {
        const res = await api.del(`/api/friend/delete/${friendId}`);
        if (res) return true;
        else return false;
    };

    const handleDeleteFriend = async (friendId) => {
        Swal.fire({
            icon: "warning",
            title: "친구 삭제",
            html: `정말 친구를 삭제하시겠나요?<br>삭제하면 상대방의 친구 목록에서도 내가 사라져요.`,
            showCancelButton: true,
            confirmButtonText: "삭제",
            cancelButtonText: "취소",
        }).then(async (res) => {
            if (res.isConfirmed) {
                const resp = await deleteFriend(friendId);
                if (resp) {
                    Swal.fire({
                        position: "center",
                        icon: "success",
                        title: "삭제 완료",
                        text: "친구를 삭제했어요.",
                        showConfirmButton: false,
                        timer: 1500,
                    }).then(() => {
                        window.location.reload();
                    });
                } else {
                    Swal.fire({
                        position: "center",
                        icon: "error",
                        title: "에러!",
                        text: "서버와의 통신에 문제가 생겼어요!",
                        showConfirmButton: false,
                        timer: 1500,
                    });
                }
            } else {
                Swal.fire({
                    position: "center",
                    icon: "info",
                    title: "삭제를 취소했어요.",
                    showConfirmButton: false,
                    timer: 1500,
                });
            }
        });
    };

    const locales = {
        ko: ko,
    };
    const localizer = dateFnsLocalizer({
        format,
        parse,
        startOfWeek,
        getDay,
        locales,
    });

    const CalendarPanel = ({ events }) => {
        // 'events' 배열을 'react-big-calendar'에서 사용할 수 있는 형태로 변환
        const myEvents = events.map((event) => ({
            ...event,
            start: new Date(event.startDateTime),
            end: new Date(event.endDateTime),
            title: event.isPrivate ? "비공개 일정" : event.title,
            allDay: true,
        }));

        // 이벤트 스타일 동적 설정
        const eventPropGetter = (event, start, end, isSelected) => {
            let newStyle = {
                backgroundColor: "#87CEEB",
                color: "black",
                borderRadius: "0px",
                border: "none",
            };

            if (event.isPrivate) {
                newStyle.backgroundColor = "lightgrey";
            }

            return {
                style: newStyle,
            };
        };

        return (
            <div>
                <style>
                    {`
                  /* 시간표 숨기기 */
                  .rbc-time-content {
                    display: none !important;
                  }
                `}
                </style>
                <Calendar
                    localizer={localizer}
                    events={myEvents}
                    toolbar={false}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: "60vh" }}
                    views={["week"]}
                    defaultView="week"
                    eventPropGetter={eventPropGetter} // 이벤트 스타일 설정 함수 적용
                    culture="ko" // 캘린더 한글 표시
                />
            </div>
        );
    };

    return (
        <div
            className={styles.container}
            style={{ fontFamily: "Noto Sans KR" }}
        >
            <div className={styles.header}>
                <button className={styles.backButton} onClick={handleBack}>
                    {"<"}
                </button>
                <h1 className={styles.title}>친구</h1>
                <button
                    className={styles.addButton}
                    onClick={handleAddFriend}
                    style={{
                        marginLeft: "10px",
                        backgroundColor: "#41ADCA",
                        color: "white",
                        border: "none",
                        borderRadius: "10px",
                        padding: "10px 20px",
                        fontWeight: "bold",
                        fontSize: "16px",
                        cursor: "pointer",
                    }}
                >
                    친구 추가
                </button>
            </div>
            <div
                className={styles.panelContainer}
                style={{
                    display: "flex",
                    flexDirection: "row",
                    width: "100%",
                    height: "70vh",
                    overflow: "hidden",
                }}
            >
                <div
                    className={styles.leftPanel}
                    style={{
                        width: "50%",
                        backgroundColor: "white",
                        borderRadius: "10px",
                        padding: "20px",
                        margin: "20px",
                    }}
                >
                    {/* 좌측패널 - 친구 목록 */}
                    {friends.map((friend) => (
                        <div
                            key={friend.friendId}
                            className={styles.friendItem}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: "10px",
                                border: "1px solid lightgray",
                                borderRadius: "10px",
                                padding: "15px",
                                backgroundColor:
                                    selectedFriend === friend.friendId
                                        ? "deepskyblue"
                                        : "aliceblue",
                                cursor: "pointer",
                            }}
                            onClick={() => handleCalendarClick(friend.friendId)}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                }}
                            >
                                {friend.friendProfileImagePath ? (
                                    <Avatar
                                        src={friend.friendProfileImagePath}
                                        size={40}
                                        style={{ marginRight: "15px" }}
                                    />
                                ) : (
                                    <Avatar
                                        icon={<UserOutlined />}
                                        size={40}
                                        style={{ marginRight: "15px" }}
                                    />
                                )}
                                <span
                                    style={{
                                        fontFamily: "Noto Sans Kr",
                                        fontSize: "24px",
                                        fontWeight: "bold",
                                        color: "navy",
                                    }}
                                >
                                    {friend.friendName}
                                </span>
                            </div>
                            <div className={styles.icons}>
                                <Button
                                    type="danger"
                                    size="medium"
                                    style={{
                                        marginRight: 12,
                                        backgroundColor: "salmon",
                                        color: "white",
                                    }}
                                    onClick={() => handleEditClick(friend)}
                                >
                                    <EditOutlined />
                                </Button>
                                <Button
                                    type="danger"
                                    size="medium"
                                    style={{
                                        backgroundColor: "red",
                                        color: "white",
                                    }}
                                    onClick={() =>
                                        handleDeleteFriend(friend.friendId)
                                    }
                                >
                                    <DeleteOutlined />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
                <div
                    className={styles.rightPanel}
                    style={{
                        width: "50%",
                        backgroundColor: "white",
                        borderRadius: "10px",
                        padding: "20px",
                        margin: "20px",
                    }}
                >
                    {/* 우측패널 - 추가 기능 */}
                    {selectedFriend && <CalendarPanel events={events} />}
                </div>
            </div>
            {editModalVisible && (
                <Modal
                    title="친구 닉네임 수정"
                    visible={editModalVisible}
                    onOk={updateFriendProfile}
                    onCancel={() => setEditModalVisible(false)}
                >
                    <Input
                        defaultValue={
                            selectedFriend ? selectedFriend.friendName : ""
                        }
                        onChange={(e) => setFriendNameForUpdate(e.target.value)}
                    />{" "}
                    {/* 기존 닉네임 표시 */}
                </Modal>
            )}
            {addModalVisible && (
                <Modal
                    title="친구 추가"
                    visible={addModalVisible}
                    onOk={addFriend} // 추 버튼 클릭 시 친구 추가
                    onCancel={() => setAddModalVisible(false)} // 취소 버튼 클릭 시 모달창 닫기
                >
                    <Input
                        placeholder="친구 아이디 입력"
                        value={newFriendId}
                        onChange={(e) => setNewFriendId(e.target.value)}
                    />
                </Modal>
            )}
        </div>
    );
};

export default FriendsPage;
