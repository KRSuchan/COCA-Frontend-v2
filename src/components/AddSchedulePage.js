import React, { useState } from "react";
import { SketchPicker } from "react-color"; // Color Picker를 위한 라이브러리
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../security/CocaApi";
import { dateValidationCheck } from "../security/ErrorController";

// ✨ 추가, 수정, 삭제가 모두 가능한 페이지입니다.
// ✨ 수정 삭제하러 들어왔을 때에만 editingSchedule 에 수정할 이벤트정보가 담겨서 오게되어요
// ✨ 기존 저장버튼을 누르면 postSchedule 함수 실행했던 것이 saveSchedule 함수로 가도록 수정함

const AddSchedulePage = ({ setActivePanel, selectedDate, editingSchedule }) => {
    const navigate = useNavigate();

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

    // 상태 초기화를 editingSchedule이 있을 경우 해당 데이터로 설정
    const [scheduleId, setScheduleId] = useState(
        editingSchedule ? editingSchedule.id : null
    );
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
        editingSchedule
            ? [
                  editingSchedule.attachments[0] || null,
                  editingSchedule.attachments[1] || null,
              ]
            : [null, null]
    );

    const [showColorPicker, setShowColorPicker] = useState(false); // Color Picker 표시 여부를 관리하는 state

    const selectedGroup = useSelector((state) => state.selectedGroup);

    // 첨부파일 변경 처리 함수
    const handleAttachmentChange = (event, index) => {
        // 선택된 파일을 attachments 배열에 설정
        const newAttachments = [...attachments];
        newAttachments[index] = event.target.files[0];
        setAttachments(newAttachments);
    };

    // 첨부파일 삭제 처리 함수
    const handleAttachmentDelete = (index) => {
        const newAttachments = [...attachments];
        newAttachments[index] = null; // 인덱스에 해당하는 첨부파일을 null로 설정
        setAttachments(newAttachments);
        document.getElementById(`attachment-${index}`).value = ""; // input 필드를 초기화
    };

    // 일정 추가 또는 수정 로직
    const saveSchedule = async () => {
        //✅ 저장버튼 혹은 수정버튼을 눌렀을때
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

    // 일정 삭제 로직
    const deleteSchedule = async () => {
        // ✅ 삭제버튼을 눌렀을때
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

        if (res.data.code === 200) {
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
                const res = await deleteSchedule();

                if (res) {
                    Swal.fire({
                        position: "center",
                        icon: "success",
                        title: "삭제 완료",
                        text: "일정을 정상적으로 삭제했어요!",
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

    // 개인
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
                // attachments: attachmentData
            },
            member: {
                id: localStorage.getItem("userId"),
            },
            // attachments: tmpAttachments || null // attachments가 존재하지 않으면 null로 설정
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

        if (response.data.code === 200 || response.data.code === 201) {
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
            }).then((res) => {
                window.location.reload();
            });
        }
    };

    // 그룹
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
            // isPrivate: isPrivate
            // attachments: tmpAttachments || null // attachments가 존재하지 않으면 null로 설정
        };
        const response = await api.post(
            url,
            requestData,
            "attachments",
            attachments
        );

        if (response.data.code === 200 || response.data.code === 201) {
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
            }).then((res) => {
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
                    />{" "}
                    {/* 날짜와 시간 선택 */}
                    <input
                        type="datetime-local"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />{" "}
                    {/* 날짜와 시간 선택 */}
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
                    {" "}
                    {/* 색상 박스 클릭 시 Color Picker 표시 여부 토글 */}
                    <div
                        style={{ height: "30px", background: colorCode }}
                    />{" "}
                    {/* 선택된 색상 표시 */}
                </button>
                {showColorPicker && (
                    <div style={{}}>
                        <div
                            style={{}}
                            onClick={() => setShowColorPicker(false)}
                        />
                        <SketchPicker
                            color={colorCode}
                            onChangeComplete={(color) => {
                                setColorCode(color.hex);
                            }}
                        />
                    </div>
                )}{" "}
                {/* Color Picker */}
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
                {/* <button className="add-schedule-button" onClick={postSchedule}>일정추가</button> */}
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
