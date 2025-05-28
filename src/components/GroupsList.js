import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ListGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { SettingOutlined, DeleteOutlined } from "@ant-design/icons";
import Swal from "sweetalert2";
import api from "../security/CocaApi";

// 캘린더 목록
const GroupsList = () => {
    const groups = useSelector((state) => state.groups);
    const [selectedGroup, setSelectedGroup] = useState(
        useSelector((state) => state.selectedGroup)
    );
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const quitGroup = async (group) => {
        const res = await api.del(
            `/api/group/leave/member/${localStorage.getItem("userId")}/group/${
                group.groupId
            }`
        );
        return res.data;
    };

    useEffect(() => {
        let group = JSON.parse(localStorage.getItem("selectedGroup"));
        if (!group || group.groupId === -1) {
            setSelectedGroup(groups[0]);
        } else {
            setSelectedGroup(groups[group.groupId]);
            dispatch({ type: "SELECT_GROUP", payload: group });
        }
    }, [groups]);

    const handleClick = (group) => {
        setSelectedGroup(group);
        localStorage.setItem("selectedGroup", JSON.stringify(group));
        dispatch({ type: "SELECT_GROUP", payload: group });
    };

    const handleSettingsClick = (group) => {
        if (group.isAdmin) {
            navigate(`/editgroup/${group.groupId}`);
        }
    };

    const handleDeleteClick = (group) => {
        console.log(`Deleting group with ID: ${group.groupId}`);

        if (group.groupId !== -1) {
            Swal.fire({
                icon: "warning",
                title: "그룹에서 탈퇴하시려구요?",
                showCancelButton: true,
                confirmButtonText: "탈퇴",
                cancelButtonText: "취소",
            }).then(async (res) => {
                if (res.isConfirmed) {
                    const res = await quitGroup(group);
                    if (res.code === 200) {
                        Swal.fire({
                            position: "center",
                            icon: "success",
                            title: "정상적으로 탈퇴되었어요!",
                            showConfirmButton: false,
                            timer: 1500,
                        }).then(async (res) => {
                            dispatch({ type: "RESET_STATE", payload: null });
                            localStorage.removeItem("selectedGroup");
                            navigate(-1);
                        });
                    } else if (res.code === 400) {
                        Swal.fire({
                            position: "center",
                            icon: "error",
                            title: "그룹 관리자는 탈퇴할 수 없어요!",
                            showConfirmButton: false,
                            timer: 1500,
                        }).then(async (res) => {
                            navigate(-1);
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
                        title: "탈퇴를 취소했어요.",
                        showConfirmButton: false,
                        timer: 1500,
                    });
                }
            });
        }
    };

    return (
        <div
            className="calendar-component"
            style={{ overflowY: "auto", maxHeight: "400px" }}
        >
            <ListGroup variant="flush">
                {groups.map((group) => (
                    <ListGroup.Item
                        key={group.groupId}
                        style={{
                            borderRadius: "15px",
                            background:
                                group === selectedGroup
                                    ? "linear-gradient(to right, #2d69f4, #125BDC)"
                                    : "#f8f9fa",
                            color: group === selectedGroup ? "white" : "black",
                            marginBottom: "10px",
                            padding: "15px",
                            paddingLeft: "25px",
                            fontSize: "15pt",
                            fontFamily: "Noto Sans KR",
                            fontWeight:
                                group === selectedGroup ? "bold" : "normal",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            transition: "background 0.3s ease",
                        }}
                        onClick={() => handleClick(group)}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background =
                                "linear-gradient(to right, #91CCDF, #357ABD)";
                            e.currentTarget
                                .querySelectorAll(".icon-hover")
                                .forEach(
                                    (icon) => (icon.style.color = "white")
                                );
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background =
                                group === selectedGroup
                                    ? "linear-gradient(to right, #2d69f4, #125BDC)"
                                    : "#f8f9fa";
                            e.currentTarget
                                .querySelectorAll(".icon-hover")
                                .forEach((icon) => (icon.style.color = "gray"));
                        }}
                    >
                        <span>{group.groupName}</span>
                        <div>
                            {group.isAdmin && (
                                <SettingOutlined
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSettingsClick(group);
                                    }}
                                    style={{
                                        color: "gray",
                                        fontSize: "20px",
                                        marginRight: "10px",
                                        cursor: "pointer",
                                    }}
                                    className="icon-hover"
                                    onMouseOver={(e) =>
                                        (e.currentTarget.style.color =
                                            "#125BDC")
                                    }
                                    onMouseOut={(e) =>
                                        (e.currentTarget.style.color = "gray")
                                    }
                                />
                            )}
                            {group.groupId !== -1 && (
                                <DeleteOutlined
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteClick(group);
                                    }}
                                    style={{
                                        color: "gray",
                                        fontSize: "20px",
                                        cursor: "pointer",
                                    }}
                                    className="icon-hover"
                                    onMouseOver={(e) =>
                                        (e.currentTarget.style.color = "red")
                                    }
                                    onMouseOut={(e) =>
                                        (e.currentTarget.style.color = "gray")
                                    }
                                />
                            )}
                        </div>
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </div>
    );
};

export default GroupsList;
