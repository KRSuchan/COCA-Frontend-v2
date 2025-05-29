import { useState, useRef, useEffect } from "react";
import styles from "./css/PowerEmptySchedule.module.css";
import { useNavigate } from "react-router-dom";
import {
    DatePicker,
    InputNumber,
    Select,
    Button,
    Modal,
    Tabs,
    List,
    Avatar,
} from "antd";
import FullCalendar from "@fullcalendar/react";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import moment from "moment";
import koLocale from "@fullcalendar/core/locales/ko"; // 한국어 로케일 추가
import { UserOutlined } from "@ant-design/icons"; // antd 아이콘 추가
import Swal from "sweetalert2"; // Swal 추가
import { useSelector } from "react-redux";
import api from "./security/CocaApi";

const { RangePicker } = DatePicker;
const { Option } = Select;

// 🍀🍀🍀 코드 작동 방식
// 🍀 range 로 검색범위 설정하고 >  number 로 찾을 기간 N > unit 으로 일/시간/분 선택
// 🍀 멤버 추가 버튼 누르면 멤버선택 가능하고, 추가 버튼 누르면 members 멤버 상태에 추가됨
// 🍀 handleSearch 찾기버튼 > 각 멤버들의 일정 받아와 schedules로, 빈일정 받아와 emptySchedules로 넣음
// 🍀 unit 에 맞게 시점과 일정이 표시되며 가로축으로 스크롤도 가능
// 🍀 handleEventClick 일정 클릭시 일정 추가 모달창 띄우고 제목, 내용, 시작시간, 종료시간 입력 가능하고 저장하면 일정 추가됨

const PowerEmptySchedule = () => {
    const navigate = useNavigate();
    const calendarRef = useRef(null);
    const [isModalVisible, setIsModalVisible] = useState(false); // 모달 상태

    // ✌️✌️✌️ 상단 검색 조건 상태들
    const [number, setNumber] = useState(1); // 숫자 (N) -> 일 및 시간
    const [minute, setMinute] = useState(10); // 분
    const [unit, setUnit] = useState("일"); // '일', '시간', '분'
    const [range, setRange] = useState(null); //시작일 끝일
    const [members, setMembers] = useState([
        {
            id: "id",
            name: "me",
            photo: "url",
        },
    ]); // 기존 멤버 상태

    // ✌️✌️✌️ 일정 상태들
    const [schedules, setSchedules] = useState([]); // 각 멤버들의 일정
    const [emptySchedules, setEmptySchedules] = useState([]); // 빈일정

    // ✌️✌️✌️ 멤버 추가 버튼 눌렀을때 관리하는 상태들 (모달창)
    const [friends, setFriends] = useState([]); // 친구 목록 상태
    const [selectedFriend, setSelectedFriend] = useState(null); // 선택된 친구 상태
    const groups = useSelector((state) => state.groups);
    const [groupMembers, setGroupMembers] = useState([]); // 선택된 그룹의 멤버 목록
    const [selectedGroup, setSelectedGroup] = useState(null); // 선택된 그룹

    // 처음 마운트 useEffect
    useEffect(() => {
        // 친구 목록을 받아오는 함수
        const fetchFriends = async () => {
            let data = await fetchFriendList();
            data = data.map((item) => ({
                ...item,
                friendId: item.friendMemberId,
            }));
            setFriends(data); // 수정된 부분
        };
        const fetchMyProfile = async () => {
            let res = await api.get(
                `/api/member/memberProfileImageUrlReq?memberId=${localStorage.getItem(
                    "userId"
                )}`
            );

            let data = {
                id: localStorage.getItem("userId"),
                name: "나",
                photo: res.data.data,
            };
            setMembers([data]);
        };
        fetchMyProfile();
        fetchFriends();
    }, []);

    const fetchFriendList = async () => {
        const res = await api.get(
            `/api/friend/list/memberId/${localStorage.getItem("userId")}`
        );
        if (res.data.code === 200) {
            return res.data.data; // 수정된 부분
        }
    };

    const fetchGroupMembers = async (group) => {
        const res = await api.get(
            `/api/group/list/members/member/${localStorage.getItem(
                "userId"
            )}/group/${group.groupId}`
        );

        if (res.data.code === 200) {
            return res.data.data; // 수정된 부분
        }
    };

    useEffect(() => {
        // 선택된 그룹의 멤버 목록을 받아오는 함수
        const getGroupMembers = async () => {
            if (selectedGroup) {
                console.log(selectedGroup);
                const data = await fetchGroupMembers(selectedGroup);
                // setGroupMembers(membersData);
                setGroupMembers(data);
            }
        };

        getGroupMembers();
    }, [selectedGroup]);

    const handleBack = () => {
        navigate(-1);
    };

    const handleNumberChange = (value) => {
        setNumber(value);
    };

    const handleMinuteChange = (value) => {
        setMinute(value);
    };

    const handleUnitChange = (value) => {
        setUnit(value);
    };

    const handleRangeChange = (dates) => {
        setRange(dates);
    };

    const getMembersSchedules = async () => {
        if (range === null) {
            Swal.fire({
                position: "center",
                icon: "error",
                title: "에러!",
                text: "검색일을 지정해주세요!",
                showConfirmButton: false,
                timer: 1500,
            });
            return;
        }

        const memberData = members.map((item) => item.id);

        const data = {
            members: memberData,
            startDate: formatDate(range[0].$d),
            endDate: formatDate(range[1].$d),
            findDay: null,
            findMinute: null,
        };

        console.log("data", data);

        const res = await api.post(
            "/api/commonscheduleController/memberScheduleReq",
            data
        );

        console.log("mem", res);

        if (res.data.code === 200) {
            return res.data.data;
        } else return [];
    };

    const getEmptySchedules = async () => {
        if (range === null) {
            Swal.fire({
                position: "center",
                icon: "error",
                title: "에러!",
                text: "검색일을 지정해주세요!",
                showConfirmButton: false,
                timer: 1500,
            });
            return;
        }

        const memberData = members.map((item) => item.id);

        let data;
        if (unit === "일") {
            data = {
                members: memberData,
                startDate: formatDate(range[0].$d),
                endDate: formatDate(range[1].$d),
                findDay: number,
                findMinute: 0,
            };
        } else if (unit === "시간") {
            data = {
                members: memberData,
                startDate: formatDate(range[0].$d),
                endDate: formatDate(range[1].$d),
                findDay: 0,
                findMinute: number * 60,
            };
        } else if (unit === "분") {
            data = {
                members: memberData,
                startDate: formatDate(range[0].$d),
                endDate: formatDate(range[1].$d),
                findDay: 0,
                findMinute: number * 60 + minute,
            };
        } else {
            throw new Error("type mismatch");
        }

        console.log("data", data);
        console.log("toDate", range[0].toDate());

        const res = await api.post(
            "/api/commonscheduleController/findEmptyScheduleReq",
            data
        );

        console.log(res);

        if (res.data.code === 200) {
            return res.data.data;
        } else return [];
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        // getMonth()는 0부터 시작하므로 1을 더해준다. 월이 한 자리수일 때 앞에 '0'을 붙여준다.
        const month = ("0" + (date.getMonth() + 1)).slice(-2);
        // getDate()는 날짜를 반환한다. 일이 한 자리수일 때 앞에 '0'을 붙여준다.
        const day = ("0" + date.getDate()).slice(-2);

        return `${year}-${month}-${day}`;
    };

    const handleSearch = async () => {
        //✌️찾기버튼 눌렀을떄! unit에서 일인지 시간인지 분인지 확인해야 함.
        const emptyScheduleData = await getEmptySchedules();
        setEmptySchedules(emptyScheduleData);

        const memberScheduleData = await getMembersSchedules();
        if (memberScheduleData) {
            const memberSchedule = memberScheduleData.map(
                (item) => item.scheduleList
            );
            console.log(memberSchedule);
            setSchedules(memberSchedule);
        }

        if (range && range.length === 2) {
            // 검색 조건이 선택된 경우
            const calendarApi = calendarRef.current.getApi();
            const startDate = range[0].toDate();
            const endDate = range[1].toDate();
            calendarApi.gotoDate(startDate); // 선택된 범위의 시작 날짜로 이동

            // FullCalendar의 view를 업데이트
            if (unit === "일") {
                calendarApi.changeView("customRange", {
                    duration: { months: 3 },
                    visibleRange: {
                        start: startDate,
                        end: endDate,
                    },
                });
            } else if (unit === "시간") {
                calendarApi.changeView("customHourRange", {
                    duration: { hours: 430 }, // 49주를 일수로 변환
                    visibleRange: {
                        start: startDate,
                    },
                    slotLabelFormat: [
                        { month: "short", day: "numeric", weekday: "short" }, // 상위 레벨: 월, , 요일
                        { hour: "2-digit", minute: "2-digit", hour12: false }, // 하위 레벨: 시간
                    ],
                });
            } else if (unit === "분") {
                calendarApi.changeView("customMinuteRange", {
                    duration: { hours: 430 }, // 2일을 분으로 변환
                    visibleRange: {
                        start: startDate,
                    },
                    slotLabelFormat: [
                        { month: "short", day: "numeric", weekday: "short" }, // 상위 레벨: 월, , 요일
                        { hour: "2-digit", minute: "2-digit", hour12: false }, // 하위 레벨: 시간
                    ],
                });
            }
        }
    };

    const handleReset = () => {
        // 검색 조건 초기화 함수
        setSchedules([]);
        setEmptySchedules([]);
        setRange(null);
        setNumber(1);
        setUnit("일");
        const calendarApi = calendarRef.current.getApi();
        calendarApi.removeAllEvents();
    };

    // 새 멤버 추가 함수
    const handleAddMember = () => {
        setIsModalVisible(true);
    };

    const handleModalOk = () => {
        // 모달창에서 친구 선택하고 추가 버튼 누르면 멤버 상태에 추가됨
        if (selectedFriend) {
            const newMember = {
                id: selectedFriend.friendId,
                name: selectedFriend.friendName,
                photo: selectedFriend.friendProfileImagePath,
            };
            setMembers([...members, newMember]);
            setSelectedFriend(null); // 선택된 친구 초기화
        }
        setIsModalVisible(false);
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
    };

    // 멤버 삭제 함수
    const handleDeleteMember = (id) => {
        // 멤버 삭제 함수
        setMembers(members.filter((member) => member.id !== id));
    };

    // 일정 등록 요청
    const sendScheduleRequest = async (
        title,
        description,
        location,
        startTime,
        endTime,
        color
    ) => {
        const memberData = members
            .filter((item) => item.id !== localStorage.getItem("userId"))
            .map((item) => ({ id: item.id }));

        const data = {
            sender: {
                id: localStorage.getItem("userId"),
            },
            requestedSchedule: {
                title: title,
                description: description,
                location: location,
                startTime: startTime + ":00",
                endTime: endTime + ":00",
                color: color,
            },
            receivers: memberData,
        };

        const res = await api.post("/api/request/add/schedule", data);

        if (res.data.code === 201) {
            return true;
        } else return false;
    };

    const handleEventClick = (info) => {
        const event = info.event;

        // 빈 일정에 대해서만 모달창을 띄우기
        if (event.id.startsWith("empty-")) {
            const startTime = moment(event.start).format("YYYY-MM-DD HH:mm");
            const endTime = moment(event.end).format("YYYY-MM-DD HH:mm");

            Swal.fire({
                title: "일정 추가 요청",
                html: `
                    <input id="swal-input1" class="swal2-input" placeholder="제목">
                    <input id="swal-input2" class="swal2-input" placeholder="내용">
                    <input id="swal-input3" class="swal2-input" type="datetime-local" value="${startTime}">
                    <input id="swal-input4" class="swal2-input" type="datetime-local" value="${endTime}">
                `,
                focusConfirm: false,
                preConfirm: () => {
                    const title = document.getElementById("swal-input1").value;
                    const content =
                        document.getElementById("swal-input2").value;
                    const start = document.getElementById("swal-input3").value;
                    const end = document.getElementById("swal-input4").value;

                    if (title && start && end) {
                        console.log("Title:", title);
                        console.log("Content:", content);
                        console.log("Start:", start);
                        console.log("End:", end);
                        const data = {
                            title: title,
                            content: content,
                            start: start,
                            end: end,
                        };

                        return data;
                    } else {
                        return Swal.showValidationMessage(
                            "내용을 제외한 모든 정보가 있어야 해요!"
                        );
                    }
                },
            }).then(async (res) => {
                if (res.isConfirmed) {
                    console.log(res);
                    Swal.fire({
                        icon: "question",
                        title: "일정 추가 요청",
                        width: 800,
                        html: `내 캘린더에는 일정이 추가되고, 선택한 멤버들에게는 일정 등록 요청이 발생해요!<br>
                        정말로 ${formatDate(res.value.start)} ~ ${formatDate(
                            res.value.end
                        )} 일정으로 요청을 보낼까요?`,
                        showCancelButton: true,
                        confirmButtonText: "요청",
                        cancelButtonText: "취소",
                    }).then(async (response) => {
                        if (response.isConfirmed) {
                            const res2 = await sendScheduleRequest(
                                res.value.title,
                                res.value.content,
                                "",
                                res.value.start,
                                res.value.end,
                                "#E94E77"
                            );
                            if (res2) {
                                Swal.fire({
                                    position: "center",
                                    icon: "success",
                                    title: "정상적으로 요청되었어요!",
                                    showConfirmButton: false,
                                    timer: 1500,
                                }).then((res) => {
                                    navigate("/");
                                });
                            } else {
                                Swal.fire({
                                    position: "center",
                                    icon: "error",
                                    html: `요청 중 오류가 발생했어요!<br>잠시 후, 다시 한 번 시도해주세요!`,
                                    showConfirmButton: false,
                                    timer: 1500,
                                });
                            }
                        } else {
                            Swal.fire({
                                position: "center",
                                icon: "info",
                                title: "요청을 취소했어요.",
                                showConfirmButton: false,
                                timer: 1500,
                            });
                        }
                    });
                }
            });
        }
    };

    const ScheduleSearch = () => {
        // 일정 검색 컴포넌트
        // 기존 일정 이벤트
        const events = schedules.flatMap((scheduleList, listIdx) =>
            scheduleList.map((schedule, idx) => ({
                id: `schedule-${listIdx}-${idx}`,
                resourceId: `member-${listIdx}`,
                start: schedule.startTime,
                end: schedule.endTime,
                title: `일정 ${listIdx + 1}-${idx + 1}`,
                color: "#4A90E2", // 새로 일정 색상 설정 (파란)
            }))
        );

        // 빈 일정 벤트 추가
        const emptyEvents = emptySchedules
            ? emptySchedules.map((empty, idx) => ({
                  id: `empty-${idx}`,
                  resourceId: "zempty", // 모든 빈 일정은 같은 리소스 ID를 사용
                  start: empty.startTime,
                  end: empty.endTime,
                  title: `빈 일정 ${idx + 1}`,
                  color: "#E94E77", // 새로운 빈 일정 색상 설 (분홍색)
              }))
            : [];

        // 기존 일정과 빈 일정을 합친 새로운 이벤트 배열
        const combinedEvents = [...events, ...emptyEvents];

        // 리소스 배열 수정 (빈 일정을 마지막에 추가)
        const resources = [
            ...members.map((member, idx) => ({
                id: `member-${idx}`,
                title: member.name,
            })),
            {
                id: "zempty",
                title: "빈 일정",
            },
        ];

        return (
            <FullCalendar
                initialDate={
                    range !== null ? formatDate(range[0].$d) : new Date()
                }
                ref={calendarRef}
                plugins={[resourceTimelinePlugin]}
                // initialView="customRange"
                initialView={
                    unit === "일"
                        ? "customRange"
                        : unit === "시간"
                        ? "customHourRange"
                        : "customMinuteRange"
                }
                locale={koLocale}
                headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    // right: 'customMinuteRange,customHourRange,customRange,resourceTimelineDay,resourceTimelineMonth,resourceTimelineYear'
                    right: "customMinuteRange,customHourRange,customRange",
                }}
                views={{
                    resourceTimelineYear: {
                        type: "resourceTimeline",
                        duration: { years: 1 },
                        buttonText: "연간",
                    },
                    customRange: {
                        type: "resourceTimeline",
                        duration: { months: 13 },
                        buttonText: "일자범위",
                        slotLabelFormat: [
                            { month: "short" }, // 상위 레벨: 월, 일, 요일
                            { day: "numeric" }, // 하위 레벨: 일
                        ],
                    },
                    customHourRange: {
                        type: "resourceTimeline",
                        duration: { hours: 48 },
                        buttonText: "시간범위",
                        slotLabelFormat: [
                            {
                                month: "short",
                                day: "numeric",
                                weekday: "short",
                            }, // 상위 레벨: 월, 일, 요일
                            {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                            }, // 하위 레벨: 시간
                        ],
                    },
                    customMinuteRange: {
                        type: "resourceTimeline",
                        duration: { hours: 48 },
                        buttonText: "분범위",
                        slotLabelFormat: [
                            {
                                month: "short",
                                day: "numeric",
                                weekday: "short",
                            }, // 상위 레벨: 월, 일, 요일
                            {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                            }, // 하위 레벨: 시간
                        ],
                    },
                }}
                resources={resources}
                events={combinedEvents}
                editable={true}
                selectable={true}
                eventOverlap={false} // 이벤트 겹침 방지
                resourceAreaWidth="20%"
                slotMinWidth={100}
                eventClick={handleEventClick} // 이벤트 클릭 핸들러 추가
                customButtons={{
                    prev: {
                        text: "prev",
                        click: () => {
                            console.log("Prev button clicked");
                            const calendarApi = calendarRef.current.getApi();
                            calendarApi.prev();
                            const currentDate = calendarApi.getDate();
                            const newDate = moment(currentDate)
                                .subtract(2, "days")
                                .toDate();
                            console.log("2 days before:", newDate);
                        },
                    },
                    next: {
                        text: "next",
                        click: () => {
                            console.log("Next button clicked");
                            const calendarApi = calendarRef.current.getApi();
                            calendarApi.next();
                            const currentDate = calendarApi.getDate();
                            const newDate = moment(currentDate)
                                .add(2, "days")
                                .toDate();
                            console.log("2 days after:", newDate);
                        },
                    },
                }}
            />
        );
    };

    const tabItems = [
        {
            key: "1",
            label: "친구선택",
            children: (
                <List
                    itemLayout="horizontal"
                    dataSource={friends}
                    renderItem={(friend) => (
                        <List.Item
                            onClick={() => setSelectedFriend(friend)}
                            style={{
                                cursor: "pointer",
                                backgroundColor:
                                    selectedFriend?.friendId === friend.friendId
                                        ? "#e6f7ff"
                                        : "transparent",
                            }}
                        >
                            <List.Item.Meta
                                avatar={
                                    <Avatar
                                        src={friend.friendProfileImagePath}
                                        icon={
                                            !friend.friendProfileImagePath && (
                                                <UserOutlined />
                                            )
                                        }
                                    />
                                }
                                title={friend.friendName}
                            />
                        </List.Item>
                    )}
                />
            ),
        },
        {
            key: "2",
            label: "그룹멤버",
            children: (
                <div style={{ display: "flex" }}>
                    <div style={{ flex: 1, marginRight: "10px" }}>
                        <List
                            itemLayout="horizontal"
                            dataSource={groups}
                            renderItem={(group) =>
                                group.groupId !== -1 && (
                                    <List.Item
                                        onClick={() => setSelectedGroup(group)}
                                        style={{
                                            cursor: "pointer",
                                            backgroundColor:
                                                selectedGroup?.groupId ===
                                                group.groupId
                                                    ? "#e6f7ff"
                                                    : "transparent",
                                        }}
                                    >
                                        <List.Item.Meta
                                            title={group.groupName}
                                        />
                                    </List.Item>
                                )
                            }
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <List
                            itemLayout="horizontal"
                            dataSource={groupMembers}
                            renderItem={(member) => (
                                <List.Item
                                    onClick={() =>
                                        setSelectedFriend({
                                            friendId: member.id,
                                            friendName: member.userName,
                                            friendProfileImagePath:
                                                member.profileImgPath,
                                        })
                                    }
                                    style={{
                                        cursor: "pointer",
                                        backgroundColor:
                                            selectedFriend?.friendId ===
                                            member.id
                                                ? "#e6f7ff"
                                                : "transparent",
                                    }}
                                >
                                    <List.Item.Meta
                                        avatar={
                                            <Avatar
                                                src={member.profileImgPath}
                                                icon={
                                                    !member.profileImgPath && (
                                                        <UserOutlined />
                                                    )
                                                }
                                            />
                                        }
                                        title={member.userName}
                                    />
                                </List.Item>
                            )}
                        />
                    </div>
                </div>
            ),
        },
    ];
    return (
        <div
            className={styles.container}
            style={{ fontFamily: "Noto Sans KR" }}
        >
            <div className={styles.header}>
                <button className={styles.backButton} onClick={handleBack}>
                    {"<"}
                </button>
                <h1 className={styles.title}>빈일정찾기</h1>
            </div>
            <div className={styles.subPanel}>
                <RangePicker
                    getPopupContainer={(trigger) => trigger.parentNode}
                    onChange={handleRangeChange}
                />
                <InputNumber
                    min={unit === "분" ? 0 : 1}
                    max={unit === "분" || unit === "시간" ? 23 : 30}
                    value={number}
                    onChange={handleNumberChange}
                    style={{ marginLeft: "20px" }}
                />
                {unit === "분" ? (
                    <div>
                        <Button type="text">시간</Button>
                        <Select
                            value={minute}
                            onChange={handleMinuteChange}
                            getPopupContainer={(trigger) => trigger.parentNode}
                        >
                            <Option value="10">10</Option>
                            <Option value="20">20</Option>
                            <Option value="30">30</Option>
                            <Option value="40">40</Option>
                            <Option value="50">50</Option>
                        </Select>
                    </div>
                ) : null}

                <Select
                    value={unit}
                    onChange={handleUnitChange}
                    getPopupContainer={(trigger) => trigger.parentNode}
                    style={{ width: "100px", marginLeft: "20px" }}
                >
                    <Option value="일">일</Option>
                    <Option value="시간">시간</Option>
                    <Option value="분">분</Option>
                </Select>
                <button
                    onClick={handleSearch}
                    style={{
                        background: "linear-gradient(315deg, #A031E4, #E492F8)",
                        color: "white",
                        marginLeft: "20px",
                        padding: "5px 10px",
                        border: "none",
                        borderRadius: "5px",
                        transition: "background 0.3s, transform 0.3s",
                    }}
                    onMouseEnter={(e) =>
                        (e.target.style.background =
                            "linear-gradient(315deg, #A031E4, #D482F8)")
                    }
                    onMouseLeave={(e) =>
                        (e.target.style.background =
                            "linear-gradient(315deg, #A031E4, #E492F8)")
                    }
                    onMouseDown={(e) =>
                        (e.target.style.transform = "scale(0.95)")
                    }
                    onMouseUp={(e) => (e.target.style.transform = "scale(1)")}
                >
                    찾기
                </button>
                <button
                    onClick={handleReset}
                    style={{
                        background: "linear-gradient(315deg, #A031E4, #E492F8)",
                        color: "white",
                        marginLeft: "10px",
                        padding: "5px 10px",
                        border: "none",
                        borderRadius: "5px",
                        transition: "background 0.3s, transform 0.3s",
                    }}
                    onMouseEnter={(e) =>
                        (e.target.style.background =
                            "linear-gradient(315deg, #A031E4, #D482F8)")
                    }
                    onMouseLeave={(e) =>
                        (e.target.style.background =
                            "linear-gradient(315deg, #A031E4, #E492F8)")
                    }
                    onMouseDown={(e) =>
                        (e.target.style.transform = "scale(0.95)")
                    }
                    onMouseUp={(e) => (e.target.style.transform = "scale(1)")}
                >
                    초기화
                </button>
            </div>
            <div
                className={styles.subPanel}
                style={{
                    display: "flex",
                    overflowX: "auto",
                    justifyContent: "flex-start",
                    height: "40px",
                }}
            >
                <Button
                    onClick={handleAddMember}
                    style={{ marginRight: "10px" }}
                >
                    멤버 추가
                </Button>
                {members.map((member, index) => (
                    <div
                        key={member.id}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            marginRight: "10px",
                        }}
                    >
                        {member.photo ? (
                            <img
                                src={member.photo}
                                alt={member.name}
                                style={{
                                    borderRadius: "50%",
                                    marginRight: "10px",
                                    width: "40px",
                                    height: "40px",
                                }}
                            />
                        ) : (
                            <UserOutlined
                                style={{
                                    fontSize: "40px",
                                    marginRight: "10px",
                                }}
                            /> // 기본 아이콘 사용
                        )}
                        <span
                            style={{
                                cursor: index !== 0 ? "pointer" : "default",
                                color: index !== 0 ? "black" : "gray",
                            }}
                            onMouseEnter={(e) => {
                                if (index !== 0) e.target.style.color = "red";
                            }}
                            onMouseLeave={(e) => {
                                if (index !== 0) e.target.style.color = "black";
                            }}
                            onClick={() =>
                                index !== 0 && handleDeleteMember(member.id)
                            } // 첫 번째 멤버는 삭제 불가
                        >
                            {member.name}
                        </span>
                    </div>
                ))}
            </div>
            <div
                className={styles.mainPanel}
                style={{
                    padding: "20px",
                    backgroundColor: "white",
                    borderRadius: "15px",
                    marginTop: "10px",
                }}
            >
                <ScheduleSearch />
            </div>
            <Modal
                title="멤버 추가"
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
                destroyOnHidden
            >
                <Tabs defaultActiveKey="1" items={tabItems} />
            </Modal>
        </div>
    );
};

export default PowerEmptySchedule;
