import React from "react";
import { useSelector, useDispatch } from "react-redux";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

import "./css/MainPage.css";
import "moment/locale/ko"; // Import Korean locale
import { useState, useEffect } from "react";

import "react-calendar/dist/Calendar.css";
import MiniCalendar from "./components/MiniCalendar";
import GroupsList from "./components/GroupsList";
import MainCalendar from "./components/MainCalendar";
import NewPage from "./components/NewPage";
import ButtonPanel from "./components/ButtonPanel";
import AddSchedulePage from "./components/AddSchedulePage";
import MainLogo from "./components/MainLogo";
import { useNavigate } from "react-router-dom";
import api from "./security/CocaApi";

moment.locale("ko");

// 일정 상세 통신
const getPersonalDetailSchedule = async (id, startDate, endDate, navigate) => {
    const res = await api.get(
        `/api/personal-schedule/detail?memberId=${id}&date=${startDate}`
    );
    if (res.data.code === 200) {
        return res.data;
    } else return null;
};

const getGroupDetailSchedule = async (groupId, memberId, date, navigate) => {
    const res = await api.get(
        `/api/group-schedule/detail?groupId=${groupId}&memberId=${memberId}&date=${date}`
    );
    if (res.data.code === 200) {
        return res.data;
    } else return null;
};

const setGroups = (groups) => {
    return {
        type: "SET_GROUPS",
        payload: groups,
    };
};

const getGroupList = async (id) => {
    const res = await api.get(`/api/calendar/member/${id}`);
    if (res.data.code === 200) {
        return res.data.data;
    } else return [];
};

function MainPage() {
    const navigate = useNavigate();

    // 'default'와 'newPanel' 중 하나를 값으로 가질 수 있는 activePanel 상태 추가
    // 'default': 기본 left-panel을 보여줌, 'newPanel': 새로운 페이지를 left-panel에 보여줌
    const [editingSchedule, setEditingSchedule] = useState(null); // 편집 중인 일정 상태
    const [activePanel, setActivePanel] = useState("default");
    const [selectedDate, setSelectedDate] = useState(""); // 선택한 날짜 상태 추가
    const [schedule, setSchedule] = useState();

    const dispatch = useDispatch();

    useEffect(() => {
        const fetchGroups = async () => {
            const userId = localStorage.getItem("userId");
            if (userId) {
                const res = await getGroupList(userId);
                dispatch(setGroups(res));
            }
        };

        fetchGroups();
    }, [dispatch]);

    const selectedGroup = useSelector((state) => state.selectedGroup);

    // ✅ 캘린더 슬롯 선택시!
    const onSlotSelect = async (date) => {
        setSelectedDate(date); // 선택한 날짜를 상태로 저장

        console.log(date);
        try {
            let res;

            console.log("selGId", selectedGroup);

            if (selectedGroup.groupId === -1) {
                res = await getPersonalDetailSchedule(
                    localStorage.getItem("userId"),
                    date,
                    navigate
                );
            } else {
                res = await getGroupDetailSchedule(
                    selectedGroup.groupId,
                    localStorage.getItem("userId"),
                    date,
                    navigate
                );

                res.data = res.data.map((item) => {
                    return {
                        ...item,
                        id: item.scheduleId,
                    };
                });
            }

            console.log("res3", res);

            if (res && res.code === 200) {
                setSchedule(res.data);
            } else {
                console.error("상세 일정 불러오기 실패", res);
            }
        } catch (error) {
            console.error("상세 일정 불러오기 에러 : ", error);
        }

        setActivePanel("newPanel");
    };

    return (
        <div className="App">
            <div className="left-panel">
                {activePanel === "default" ? (
                    <React.Fragment>
                        <div className="mini-calendar-container">
                            <MiniCalendar />
                        </div>
                        <div className="group-and-button">
                            <div className="groups-list-container">
                                <GroupsList />
                            </div>
                            <div className="button-panel-container">
                                <ButtonPanel />
                            </div>
                        </div>
                    </React.Fragment>
                ) : activePanel === "newPanel" ? (
                    <div className="new-page-container">
                        <NewPage
                            setActivePanel={setActivePanel}
                            selectedDate={selectedDate}
                            schedule={schedule}
                            setEditingSchedule={setEditingSchedule}
                            selectedGroup={selectedGroup}
                        />
                    </div>
                ) : activePanel === "editSchedule" ? (
                    <div className="add-schedule-page-container">
                        <AddSchedulePage
                            setActivePanel={setActivePanel}
                            selectedDate={selectedDate}
                            editingSchedule={editingSchedule}
                        />
                    </div>
                ) : (
                    <div className="add-schedule-page-container">
                        <AddSchedulePage
                            setActivePanel={setActivePanel}
                            selectedDate={selectedDate}
                        />
                    </div>
                )}
            </div>
            <div className="right-panel">
                <MainCalendar onSlotSelect={onSlotSelect} />
                <MainLogo />
            </div>
        </div>
    );
}

export default MainPage;
