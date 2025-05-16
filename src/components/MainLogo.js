// import React, { useState } from 'react';
import React, { useState, useEffect } from "react";
import { LogoutOutlined, BellOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import api from "../security/TokenManage";
import { useDispatch, useSelector } from "react-redux";

const MainLogo = () => {
    const [showNotification, setShowNotification] = useState(true);
    const [notices, setNotices] = useState([]);
    const navigate = useNavigate();
    const selectedGroup = useSelector((state) => state.selectedGroup);

    const handleLogOut = async () => {
        const res = await api.post("/api/member/logoutReq", null, navigate);
        localStorage.clear();
        navigate("/");
    };

    const handleNotificationClick = () => {
        navigate("/notice");
    };

    useEffect(() => {
        const fetchNotices = async () => {
            //✌️ 공지사항 받아오기 구현, 내 캘린더일때는 아래 콘텐츠 띄우게 설정해두었음당
            if (selectedGroup.groupId === -1) {
                const contents =
                    "우리 캘린더는 당신의 바쁜 일정을 완벽하게 관리해드리며, 효율적인 시간 관리를 도와드립니다! 또한, 중요한 약속과 미팅을 놓치지 않도록 알림 기능을 제공하며, 팀과의 협업을 원활하게 할 수 있도록 도와줍니다. 우리의 캘린더는 사용자의 편의성을 최우선으로 생각하여 직관적인 인터페이스와 다양한 기능을 갖추고 있습니다. 지금 바로 사용해보세요!";
                setNotices([contents]);
            } else {
                try {
                    const res = api.get(
                        `/api/group/notice?memberId=${localStorage.getItem(
                            "userId"
                        )}&groupId=${selectedGroup.groupId}`,
                        navigate
                    );

                    console.log(res);
                    const data = res.data.data;
                    if (data.contents === null) {
                        data.contents = "현재 공지가 없습니다.";
                    }
                    if (res.data.code === 200) {
                        setNotices([res.data.data.contents]);
                        console.log(notices);
                    }
                } catch (error) {
                    console.error("Failed to fetch notices:", error);
                }
            }
        };

        fetchNotices();
    }, [selectedGroup]);

    useEffect(() => {
        const marquee = document.querySelector(".marquee");
        let scrollAmount = 0;
        const scrollStep = 1; // 스크롤 속도 조절

        const scrollMarquee = () => {
            scrollAmount -= scrollStep;
            if (scrollAmount <= -marquee.scrollWidth) {
                scrollAmount = marquee.offsetWidth;
            }
            marquee.style.transform = `translateX(${scrollAmount}px)`;
        };

        const interval = setInterval(scrollMarquee, 30); // 스크롤 주기 조절

        return () => clearInterval(interval);
    }, [notices]);

    return (
        <div
            className="logo-container"
            style={{ display: "flex", alignItems: "center" }}
        >
            {showNotification && (
                <div
                    style={{
                        marginLeft: "20px",
                        marginRight: "10px",
                        cursor: "pointer",
                    }}
                    onClick={handleNotificationClick}
                >
                    <BellOutlined style={{ color: "gray", fontSize: "24px" }} />
                </div>
            )}
            <div
                style={{
                    marginLeft: "10px",
                    cursor: "pointer",
                    marginRight: "20px",
                }}
                onClick={handleLogOut}
            >
                <LogoutOutlined style={{ color: "gray", fontSize: "24px" }} />
            </div>
            <div
                className="marquee-container"
                style={{
                    flexGrow: 1,
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    display: "flex",
                    justifyContent: "flex-end",
                }}
            >
                <div
                    className="marquee"
                    style={{ display: "inline-block", whiteSpace: "nowrap" }}
                >
                    {notices.map((notice, index) => (
                        <span
                            key={index}
                            style={{
                                marginRight: "50px",
                                fontFamily: "Noto Sans KR",
                            }}
                        >
                            {notice}
                        </span>
                    ))}
                </div>
            </div>
            <div className="logo-text" style={{ marginLeft: "10px" }}>
                COCA
            </div>
        </div>
    );
};

export default MainLogo;
