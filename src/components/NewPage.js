import React from "react";
import Swal from "sweetalert2";
import api from "../security/CocaApi";

const NewPage = ({
    setActivePanel,
    selectedDate,
    schedule,
    setEditingSchedule,
    editingSchedule,
    selectedGroup,
}) => {
    const dateToString = () => {
        const year = selectedDate.split("-")[0];
        const month = selectedDate.split("-")[1];
        const day = selectedDate.split("-")[2];

        return `${year}년 ${month}월 ${day}일`;
    };

    const formatDateTime = (dateTime) => {
        const date = new Date(dateTime);
        if (isNaN(date.getTime())) {
            console.error(`Invalid date: ${dateTime}`);
            return "Invalid date";
        }
        const year = String(date.getFullYear()).slice(2); // 연도의 마지막 두 자리
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");
        return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
    };

    const addToMySchedule = async (item) => {
        const res = await api.post("/api/group-schedule/heart", {
            groupId: item.groupId,
            scheduleId: item.scheduleId,
            memberId: localStorage.getItem("userId"),
        });
        if (res.data.code === 200) return true;
        else return false;
    };

    const handleHeartClick = (item) => {
        //✌️ 하트 클릭했을��, 개인일정으로 저장
        // 하트 클릭 핸들러 함수
        Swal.fire({
            icon: "question",
            title: "일정 추가",
            html: `좋아요를 누르고, 이 일정을 내 일정으로 가져올까요?`,
            showCancelButton: true,
            confirmButtonText: "확인",
            cancelButtonText: "취소",
        }).then(async (res) => {
            if (res.isConfirmed) {
                const res = await addToMySchedule(item);
                if (res) {
                    Swal.fire({
                        position: "center",
                        icon: "success",
                        title: "추가 완료",
                        text: "일정을 정상적으로 추가했어요!",
                        showConfirmButton: false,
                        timer: 1500,
                    }).then((res) => {
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
            }
        });
    };

    const addMyScehduleToGroup = async (date) => {
        const res = await api.post("/api/group-schedule/bringMySchedule", {
            groupId: selectedGroup.groupId,
            memberId: localStorage.getItem("userId"),
            date: date,
        });

        if (res.data.code === 200) {
            if (res.data.data.length === 0) {
                return "no";
            }
            return true;
        } else return false;
    };

    const handleImportMySchedule = () => {
        Swal.fire({
            title: "내 일정 가져오기",
            text: `${dateToString(
                selectedDate
            )}에 등록된 내 일정을 모두 가져올까요?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "확",
            cancelButtonText: "취소",
        }).then(async (result) => {
            if (result.isConfirmed) {
                // 확인 버튼을 눌렀을 때 실행할 핸들러
                const res = await addMyScehduleToGroup(selectedDate);
                if (res === "no") {
                    Swal.fire({
                        position: "center",
                        icon: "info",
                        title: "일정 없음",
                        text: "해당 일자에 등록된 내 일정이 없어요!",
                        showConfirmButton: false,
                        timer: 1500,
                    });
                } else if (res === true) {
                    Swal.fire({
                        position: "center",
                        icon: "success",
                        title: "추가 완료",
                        text: "일정을 정상적으로 추가했어요!",
                        showConfirmButton: false,
                        timer: 1500,
                    }).then((res) => {
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
            }
        });
    };

    const downloadFile = async (attachment) => {
        try {
            const response = await fetch(attachment.filePath);
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = attachment.fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading file:", error);
        }
    };

    return (
        <React.Fragment>
            <div className="new-page">
                <div
                    className="col"
                    style={{ backgroundColor: schedule.color }}
                >
                    <h1>{selectedDate}</h1>
                    <button onClick={() => setActivePanel("default")}>X</button>
                </div>
                <div className="schedule-list">
                    {schedule.map((item, index) => (
                        <div key={index} className="schedule-card">
                            <div
                                className="schedule-title"
                                style={{
                                    background: `linear-gradient(to right, ${item.color}, white)`,
                                }}
                                onClick={() => {
                                    if (
                                        selectedGroup.groupId !== -1 &&
                                        !selectedGroup.isAdmin
                                    ) {
                                        Swal.fire({
                                            position: "center",
                                            icon: "warning",
                                            title: "권한 없음",
                                            text: "관리자만 일정을 편집할 수 있습니다.",
                                            showConfirmButton: true,
                                            confirmButtonText: "확인",
                                        });
                                        return;
                                    }
                                    setEditingSchedule(item); // 현재 편집할 일정을 상태로 설정
                                    setActivePanel("editSchedule"); // 편집 패널로 전환
                                }}
                            >
                                {item.title}
                            </div>
                            <div className="col2">
                                <div className="schedule-location">
                                    {item.location}
                                </div>
                                {selectedGroup.groupId !== -1 ? (
                                    <div
                                        className="schedule-hearts"
                                        onClick={() => handleHeartClick(item)}
                                    >
                                        ❤️ {item.hearts}
                                    </div>
                                ) : (
                                    <div className="schedule-privacy">
                                        {item.isPrivate
                                            ? "비공개일정🔒"
                                            : "공개일정🔓"}
                                    </div>
                                )}
                            </div>
                            <div className="schedule-content">
                                {item.description}
                            </div>
                            <div
                                className="schedule-dates"
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "end",
                                    fontFamily: "Noto Sans KR",
                                    color: "#8C8C7F",
                                }}
                            >
                                <div
                                    style={{
                                        marginBottom: "5px",
                                        fontWeight: "bold",
                                    }}
                                >
                                    시작: {formatDateTime(item.startTime)}
                                </div>
                                <div style={{ fontWeight: "bold" }}>
                                    끝: {formatDateTime(item.endTime)}
                                </div>
                            </div>
                            <div className="schedule-attachments">
                                {item.attachments.map((attachment, i) => (
                                    // <a key={i} href={attachment.filePath} download={attachment.fileName} target="_blank" rel="noopener noreferrer">
                                    <a
                                        key={i}
                                        onClick={() => downloadFile(attachment)}
                                    >
                                        <div className="attachment-name">
                                            💾 {attachment.fileName}
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                {selectedGroup.groupId === -1 && (
                    <button
                        className="add-schedule-button"
                        onClick={() => setActivePanel("addSchedule")}
                    >
                        일정추가
                    </button>
                )}
                {selectedGroup.groupId !== -1 &&
                    (selectedGroup.isAdmin || selectedGroup.isManager) && (
                        <div style={{ display: "flex", flexDirection: "row" }}>
                            <button
                                className="add-schedule-button"
                                onClick={() => setActivePanel("addSchedule")}
                                style={{ marginRight: "10px" }}
                            >
                                일정추가
                            </button>
                            <button
                                className="add-schedule-button"
                                style={{ fontSize: "19px" }}
                                onClick={handleImportMySchedule}
                            >
                                내일정가져오기
                            </button>
                        </div>
                    )}
            </div>
        </React.Fragment>
    );
};

export default NewPage;
