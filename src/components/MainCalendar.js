// MainCalendar.js
import { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { useSelector } from "react-redux";
import api from "../security/CocaApi";
import { useNavigate } from "react-router-dom";

moment.locale("ko");

const localizer = momentLocalizer(moment);

// 메인페이지 일정 정보 통신
const getPersonalSchedule = async (id, startDate, endDate, navigate) => {
    const res = await api.get(
        `/api/personal-schedule/summary/between-dates?memberId=${id}&startDate=${startDate}&endDate=${endDate}`
    );
    if (res) return res.data.data;
    else return null;
};

const getGroupScehdule = async (
    groupId,
    memberId,
    startDate,
    endDate,
    navigate
) => {
    const res = await api.get(
        `/api/group-schedule/summary?groupId=${groupId}&memberId=${memberId}&startDate=${startDate}&endDate=${endDate}`
    );
    if (res && res.data.code === 200) return res.data.data;
    else return null;
};

const MainCalendar = ({ onSlotSelect }) => {
    const navigate = useNavigate();
    const selectedGroup = useSelector((state) => state.selectedGroup);

    // localStorage에서 selectedGroup을 우선 적용
    const [currentGroup, setCurrentGroup] = useState(() => {
        const saved = localStorage.getItem("selectedGroup");
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                return selectedGroup || { groupId: -1 };
            }
        }
        return selectedGroup || { groupId: -1 };
    });

    // localStorage에서 날짜 불러오기
    const [savedDate, setSavedDate] = useState(() => {
        const localStorageDate = localStorage.getItem("savedDate");
        return localStorageDate ? new Date(localStorageDate) : new Date();
    });

    const [events, setEvents] = useState([]);

    // 날짜 이동 및 데이터 로딩
    const handleNavigate = async (date) => {
        localStorage.setItem("savedDate", date);
        setSavedDate(new Date(date));

        const currentYear = date.getFullYear();
        const currentMonth = date.getMonth() + 1; // JS: 0~11, 실제 월: 1~12
        const lastDayOfMonth = new Date(currentYear, currentMonth, 0).getDate();
        let oneWeekAgo = new Date(currentYear, currentMonth - 1, 1);
        let oneWeekAfter = new Date(
            currentYear,
            currentMonth - 1,
            lastDayOfMonth
        );

        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        oneWeekAfter.setDate(oneWeekAfter.getDate() + 7);

        const newStartDate = `${oneWeekAgo.getFullYear()}-${String(
            oneWeekAgo.getMonth() + 1
        ).padStart(2, "0")}-${String(oneWeekAgo.getDate()).padStart(2, "0")}`;
        const newEndDate = `${oneWeekAfter.getFullYear()}-${String(
            oneWeekAfter.getMonth() + 1
        ).padStart(2, "0")}-${String(oneWeekAfter.getDate()).padStart(2, "0")}`;

        let data;
        if (!currentGroup || currentGroup.groupId === -1) {
            data = await getPersonalSchedule(
                localStorage.getItem("userId"),
                newStartDate,
                newEndDate,
                navigate
            );
        } else {
            data = await getGroupScehdule(
                currentGroup.groupId,
                localStorage.getItem("userId"),
                newStartDate,
                newEndDate,
                navigate
            );
        }

        handleData(data);
    };

    const handleData = (data) => {
        if (data) {
            const formattedEvents = data.map((item) => ({
                start: new Date(item.startTime),
                end: new Date(item.endTime),
                title: item.title,
                id: item.id,
                color: item.color,
                isPrivate: item.isPrivate,
                style: { backgroundColor: item.color },
            }));
            setEvents(formattedEvents);
        } else {
            setEvents([]);
        }
    };

    // 최초 렌더링 시 및 currentGroup 변경 시 데이터 로딩
    useEffect(() => {
        handleNavigate(savedDate);
        // eslint-disable-next-line
    }, [currentGroup]);

    // selectedGroup이 바뀌면 currentGroup도 동기화
    useEffect(() => {
        // localStorage 우선, 없으면 redux
        const saved = localStorage.getItem("selectedGroup");
        if (saved) {
            try {
                setCurrentGroup(JSON.parse(saved));
            } catch {
                setCurrentGroup(selectedGroup || { groupId: -1 });
            }
        } else {
            setCurrentGroup(selectedGroup || { groupId: -1 });
        }
        // eslint-disable-next-line
    }, [selectedGroup]);

    // 최초 렌더링 시 데이터 로딩
    useEffect(() => {
        handleNavigate(savedDate);
        // eslint-disable-next-line
    }, []);

    // 캘린더 슬롯 선택시 메인페이지의 메소드 실행함
    const handleSelectSlot = (slotInfo) => {
        const startDate = slotInfo.end.toISOString().split("T")[0];
        onSlotSelect(startDate);
    };

    function getTextColorByBackgroundColor(hexColor) {
        if (!hexColor || !hexColor.startsWith("#")) {
            return "white";
        }
        const c = hexColor.substring(1);
        const rgb = parseInt(c, 16);
        const r = (rgb >> 16) & 0xff;
        const g = (rgb >> 8) & 0xff;
        const b = (rgb >> 0) & 0xff;
        const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        return luma < 127.5 ? "white" : "black";
    }

    return (
        <div className="calendar-component-main">
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: "100%" }}
                views={["month"]}
                selectable={true}
                onSelectSlot={handleSelectSlot}
                onNavigate={handleNavigate}
                defaultDate={savedDate}
                eventPropGetter={(event) => ({
                    style: {
                        backgroundColor: event.color,
                        color: getTextColorByBackgroundColor(event.color),
                        fontFamily: "Noto Sans KR",
                    },
                })}
            />
        </div>
    );
};

export default MainCalendar;
