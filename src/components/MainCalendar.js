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
    console.log("Get Personal Schedule");
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
    console.log("Get Group Schedule");
    const res = await api.get(
        `/api/group-schedule/summary?groupId=${groupId}&memberId=${memberId}&startDate=${startDate}&endDate=${endDate}`
    );

    if (res.data.code === 200) return res.data.data;
    else return null;
};

const MainCalendar = ({ onSlotSelect }) => {
    const navigate = useNavigate();
    const selectedGroup = useSelector((state) => state.selectedGroup);
    const [currentGroup, setCurrentGroup] = useState(
        selectedGroup || { groupId: -1 }
    );

    const localStorageDate = localStorage.getItem("savedDate");
    let savedDate = null;
    if (localStorageDate) {
        savedDate = new Date(localStorageDate);
    } else {
        savedDate = new Date();
    }

    const [events, setEvents] = useState();

    const handleNavigate = async (date) => {
        localStorage.setItem("savedDate", date);

        const currentYear = date.getFullYear();
        const currentMonth = date.getMonth();
        const lastDayOfMonth = new Date(currentYear, currentMonth, 0).getDate();
        let oneWeekAgo = new Date(currentYear, currentMonth, 1);
        let oneWeekAfter = new Date(currentYear, currentMonth, lastDayOfMonth);

        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        oneWeekAfter.setDate(oneWeekAfter.getDate() + 7);

        const newStartDate = `${oneWeekAgo.getFullYear()}-${String(
            oneWeekAgo.getMonth() + 1
        ).padStart(2, "0")}-${String(oneWeekAgo.getDate()).padStart(2, "0")}`;
        const newEndDate = `${oneWeekAfter.getFullYear()}-${String(
            oneWeekAfter.getMonth() + 1
        ).padStart(2, "0")}-${String(oneWeekAfter.getDate()).padStart(2, "0")}`;

        let data;
        if (currentGroup.groupId === -1) {
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

    const darkenColor = (color) => {
        // color 값이 #으로 시작하는지 확인
        if (color.startsWith("#")) {
            // 시작하면 진행
            var rgb = color
                .substring(1) // # 제거
                .match(/.{1,2}/g) // 2자리씩 나눔
                .map((component) => parseInt(component, 16)); // 16진수로 변환

            // 어두운 색상을 위해 RGB 값에 각각 20씩 감소시킴
            var darkerRgb = rgb.map((component) => Math.max(component - 20, 0));

            // 감소된 RGB 값을 다시 16진수로 변환하여 새로운 색상 생성
            var darkerColor =
                "#" +
                darkerRgb
                    .map((component) => component.toString(16).padStart(2, "0"))
                    .join("");
            return darkerColor;
        } else {
            return color;
        }
    };

    const handleData = (data) => {
        if (data) {
            const formattedEvents = data.map((item) => {
                const eventStartMonth = new Date(item.startTime).getMonth();
                const eventEndMonth = new Date(item.endTime).getMonth();
                const savedMonth = new Date(localStorageDate).getMonth();
                // 특정 일정 색상 어둡게 하기 시도 중
                let backgroundColor = item.color;
                if (
                    eventStartMonth !== savedMonth &&
                    eventEndMonth !== savedMonth
                ) {
                    backgroundColor = darkenColor(item.color);
                }

                return {
                    start: new Date(item.startTime),
                    end: new Date(item.endTime),
                    title: item.title,
                    id: item.id,
                    color: item.color,
                    isPrivate: item.isPrivate,
                    style: { backgroundColor: item.color }, // 이벤트의 배경색을 설정
                };
            });
            setEvents(formattedEvents);
        }
    };

    useEffect(() => {
        const currentDate = savedDate;
        handleNavigate(currentDate);
    }, []);

    useEffect(() => {
        if (selectedGroup) {
            setCurrentGroup(selectedGroup);
        }
    }, [selectedGroup]);

    useEffect(() => {
        const currentDate = savedDate;
        handleNavigate(currentDate);
    }, [currentGroup]);

    // 선택한 날짜에 대한 이벤트를 찾는 함수
    const findEventsForSelectedDate = (date) => {
        return events.filter((event) => {
            const eventStart = new Date(event.start).setHours(0, 0, 0, 0);
            const eventEnd = new Date(event.end).setHours(0, 0, 0, 0);
            const selectedDate = new Date(date).setHours(0, 0, 0, 0);
            return selectedDate >= eventStart && selectedDate <= eventEnd;
        });
    };

    // const handleSelectEvent = event => {
    //     setSelectedDate({ start: event.start, end: event.end });
    // };

    // 캘린더 슬롯 선택시 메인페이지의 메소드 실행함
    const handleSelectSlot = (slotInfo) => {
        // 선택한 슬롯의 시작 날짜를 YYYY-MM-DD 형식의 문자열로 변환
        const startDate = slotInfo.end.toISOString().split("T")[0];
        onSlotSelect(startDate); // 날짜 정보를 인자로 전달
    };

    // let initTime = can

    function getTextColorByBackgroundColor(hexColor) {
        if (!hexColor || !hexColor.startsWith("#")) {
            return "white";
        }

        const c = hexColor.substring(1); // 색상 앞의 # 제거
        const rgb = parseInt(c, 16); // rrggbb를 10진수로 변환
        const r = (rgb >> 16) & 0xff; // red 추출
        const g = (rgb >> 8) & 0xff; // green 추출
        const b = (rgb >> 0) & 0xff; // blue 추출
        const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
        // 색상 선택
        return luma < 127.5 ? "white" : "black"; // 글자색이
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
                selectable={true} // 이 부분을 확인해주세요.
                onSelectSlot={handleSelectSlot} // 빈 슬롯 선택 시 handleSelectSlot 함수 호출
                onNavigate={handleNavigate}
                defaultDate={savedDate == null ? new Date() : savedDate}
                eventPropGetter={(event, start, end, isSelected) => {
                    //이벤트 스타일 바꾸는 함수 호출
                    return {
                        style: {
                            backgroundColor: event.color, //이벤트의 색상을 통신에서 받아온 색상으로
                            color: getTextColorByBackgroundColor(event.color), //이벤트 폰트색 검정으로
                            fontFamily: "Noto Sans KR",
                        },
                    };
                }}
            />
        </div>
    );
};

export default MainCalendar;
