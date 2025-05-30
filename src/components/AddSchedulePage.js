import React, { useState } from "react";
import { SketchPicker } from "react-color";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import api from "../security/CocaApi";
import { dateValidationCheck } from "../security/ErrorController";

const AddSchedulePage = ({ setActivePanel, selectedDate, editingSchedule }) => {
    // 최상단에서 useSelector 사용
    const reduxSelectedGroup = useSelector((state) => state.selectedGroup);

    // localStorage에서 selectedGroup 우선 적용
    const selectedGroup = (() => {
        const saved = localStorage.getItem("selectedGroup");
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                return reduxSelectedGroup;
            }
        }
        return reduxSelectedGroup;
    })();

    const formatDate = (date) => {
        const tmpDate = new Date(date);
        const year = tmpDate.getFullYear();
        const month = String(tmpDate.getMonth() + 1).padStart(2, "0");
        const day = String(tmpDate.getDate()).padStart(2, "0");
        const hours = String(tmpDate.getHours()).padStart(2, "0");
        const minutes = String(tmpDate.getMinutes()).padStart(2, "0");
        const seconds = String(tmpDate.getSeconds()).padStart(2, "0");
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    // 상태 초기화
    const scheduleId = editingSchedule
        ? editingSchedule.id || editingSchedule.scheduleId
        : null;
    const [scheduleName, setScheduleName] = useState(
        editingSchedule ? editingSchedule.title : ""
    );
    const [scheduleDescription, setScheduleDescription] = useState(
        editingSchedule ? editingSchedule.description : ""
    );
    const [colorCode, setColorCode] = useState(
        editingSchedule ? editingSchedule.color : "#000000"
    );
    const [startDate, setStartDate] = useState(
        editingSchedule && editingSchedule.startTime
            ? editingSchedule.startTime
            : selectedDate
    );
    const [endDate, setEndDate] = useState(
        editingSchedule && editingSchedule.endTime
            ? editingSchedule.endTime
            : selectedDate
    );
    const [location, setLocation] = useState(
        editingSchedule ? editingSchedule.location : ""
    );
    const [isPrivate, setIsPrivate] = useState(
        editingSchedule ? editingSchedule.isPrivate : false
    );
    const [attachments, setAttachments] = useState(
        editingSchedule && editingSchedule.attachments
            ? [
                  editingSchedule.attachments[0] || null,
                  editingSchedule.attachments[1] || null,
              ]
            : [null, null]
    );
    const [showColorPicker, setShowColorPicker] = useState(false);

    // 첨부파일 변경
    const handleAttachmentChange = (event, index) => {
        const newAttachments = [...attachments];
        newAttachments[index] = event.target.files[0];
        setAttachments(newAttachments);
    };

    // 첨부파일 삭제
    const handleAttachmentDelete = (index) => {
        const newAttachments = [...attachments];
        newAttachments[index] = null;
        setAttachments(newAttachments);
        document.getElementById(`attachment-${index}`).value = "";
    };

    // 일정 저장
    const saveSchedule = async () => {
        if (!(await dateValidationCheck(startDate, endDate))) {
            return;
        }
        let url;
        const method = editingSchedule ? "put" : "post";
        if (selectedGroup.groupId === -1) {
            url = editingSchedule
                ? `/api/personal-schedule/update`
                : `/api/personal-schedule/add`;
            await postSchedule(url, method);
        } else {
            url = editingSchedule
                ? `/api/group-schedule/update`
                : `/api/group-schedule/add`;
            await postGroupSchedule(url, method);
        }
    };

    // 일정 삭제
    const deleteSchedule = async () => {
        const userId = localStorage.getItem("userId");
        let res;
        if (selectedGroup.groupId === -1) {
            res = await api.del(
                `/api/personal-schedule/delete?memberId=${userId}&personalScheduleId=${scheduleId}`
            );
        } else {
            res = await api.del(
                `/api/group-schedule/delete?memberId=${userId}&groupId=${selectedGroup.groupId}&scheduleId=${scheduleId}`
            );
        }
        if (
            res &&
            res.data &&
            (res.data.code === 200 || res.data.code === 201)
        ) {
            return true;
        } else {
            return false;
        }
    };

    const handleDelete = () => {
        Swal.fire({
            icon: "warning",
            title: "일정 삭제",
            html: `정말로 일정을 삭제하시겠나요?<br>삭제 시, 모든 정보가 사라져요!`,
            showCancelButton: true,
            confirmButtonText: "삭제",
            cancelButtonText: "취소",
        }).then(async (res) => {
            if (res.isConfirmed) {
                const result = await deleteSchedule();
                if (result) {
                    Swal.fire({
                        position: "center",
                        icon: "success",
                        title: "삭제 완료",
                        text: "일정을 정상적으로 삭제했어요!",
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
            }
        });
    };

    // 개인 일정 저장
    const postSchedule = async (url, method) => {
        const requestData = {
            personalSchedule: {
                id: scheduleId,
                title: scheduleName,
                description: scheduleDescription,
                location: location,
                startTime: formatDate(startDate),
                endTime: formatDate(endDate),
                color: colorCode,
                isPrivate: isPrivate,
            },
            member: {
                id: localStorage.getItem("userId"),
            },
        };
        let response;
        if (method === "post") {
            response = await api.post(
                url,
                requestData,
                "attachments",
                attachments
            );
        } else {
            response = await api.put(
                url,
                requestData,
                "attachments",
                attachments
            );
        }
        if (
            response &&
            response.data &&
            (response.data.code === 200 || response.data.code === 201)
        ) {
            Swal.fire({
                position: "center",
                icon: "success",
                title: method === "post" ? "등록 완료" : "수정 완료",
                text:
                    method === "post"
                        ? "일정을 정상적으로 등록했어요!"
                        : "일정을 정상적으로 수정했어요!",
                showConfirmButton: false,
                timer: 1500,
            }).then(() => {
                window.location.reload();
            });
        }
    };

    // 그룹 일정 저장
    const postGroupSchedule = async (url, method) => {
        const requestData = {
            scheduleId: scheduleId,
            memberId: localStorage.getItem("userId"),
            groupId: selectedGroup.groupId,
            title: scheduleName,
            description: scheduleDescription,
            location: location,
            startTime: formatDate(startDate),
            endTime: formatDate(endDate),
            color: colorCode,
        };
        let response;
        if (method === "post") {
            response = await api.post(
                url,
                requestData,
                "attachments",
                attachments
            );
        } else {
            response = await api.put(
                url,
                requestData,
                "attachments",
                attachments
            );
        }
        if (
            response &&
            response.data &&
            (response.data.code === 200 || response.data.code === 201)
        ) {
            Swal.fire({
                position: "center",
                icon: "success",
                title: method === "post" ? "등록 완료" : "수정 완료",
                text:
                    method === "post"
                        ? "일정을 정상적으로 등록했어요!"
                        : "일정을 정상적으로 수정했어요!",
                showConfirmButton: false,
                timer: 1500,
            }).then(() => {
                window.location.reload();
            });
        }
    };

    return (
        <React.Fragment>
            <div
                className="add-schedule-page"
                style={{ overflowY: "scroll", height: "90vh" }}
            >
                <div className="col">
                    <h1>{selectedDate}</h1>
                    <button onClick={() => setActivePanel("newPanel")}>
                        X
                    </button>
                </div>
                <div className="add-schedule-form">
                    <input
                        type="text"
                        value={scheduleName}
                        onChange={(e) => setScheduleName(e.target.value)}
                        placeholder="일정 이름"
                    />
                    <input
                        type="text"
                        value={scheduleDescription}
                        onChange={(e) => setScheduleDescription(e.target.value)}
                        placeholder="일정 설명"
                    />
                    <input
                        type="datetime-local"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                    <input
                        type="datetime-local"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="장소"
                    />
                </div>
                {attachments.map((attachment, index) => (
                    <div className="form-group" key={index}>
                        <label htmlFor={`attachment-${index}`}>
                            첨부파일 {index + 1}
                        </label>
                        <input
                            type="file"
                            id={`attachment-${index}`}
                            onChange={(e) => handleAttachmentChange(e, index)}
                        />
                        {attachment && (
                            <div>
                                <a
                                    href={attachment.filePath}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {attachment.fileName}
                                </a>
                                <span
                                    style={{
                                        marginLeft: "10px",
                                        color: "red",
                                        cursor: "pointer",
                                    }}
                                    onClick={() =>
                                        handleAttachmentDelete(index)
                                    }
                                >
                                    삭제
                                </span>
                            </div>
                        )}
                    </div>
                ))}
                <button
                    style={{
                        height: "40px",
                        color: colorCode,
                        backgroundColor: colorCode,
                    }}
                    onClick={() => setShowColorPicker((show) => !show)}
                >
                    <div style={{ height: "30px", background: colorCode }} />
                </button>
                {showColorPicker && (
                    <div>
                        <div onClick={() => setShowColorPicker(false)} />
                        <SketchPicker
                            color={colorCode}
                            onChangeComplete={(color) => {
                                setColorCode(color.hex);
                            }}
                        />
                    </div>
                )}
                {selectedGroup.groupId === -1 && (
                    <label className="col2">
                        <p>비공개일정🔒</p>
                        <input
                            type="checkbox"
                            checked={isPrivate}
                            onChange={(e) => setIsPrivate(e.target.checked)}
                        />
                    </label>
                )}
                <button
                    className="add-schedule-button"
                    style={{ marginTop: "10px" }}
                    onClick={saveSchedule}
                >
                    {editingSchedule ? "수정" : "일정추가"}
                </button>
                {editingSchedule && (
                    <button
                        className="add-schedule-button"
                        onClick={handleDelete}
                    >
                        삭제
                    </button>
                )}
            </div>
        </React.Fragment>
    );
};

export default AddSchedulePage;
