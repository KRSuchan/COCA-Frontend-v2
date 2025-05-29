import { useEffect, useState } from "react";
import styles from "./css/GroupPage.module.css";
import { useNavigate } from "react-router-dom";

import SelectedGroupInfo from "./groupComp/selectedGroupInfo";
import CreateGroupPage from "./groupComp/CreateGroupPage";

import api from "./security/CocaApi";
import Pagination from "@mui/material/Pagination"; // MUI Pagination 추가

const GroupPage = () => {
    const navigate = useNavigate();

    // 검색어 상태
    const [searchTerm, setSearchTerm] = useState("");

    // 생성 페이지 상태
    const [createGroupPage, setCreateGroupPage] = useState(false);

    // 그룹 목록 상태
    const [groups, setGroups] = useState([]);

    // 해시태그 상태
    const [hashtags, setHashtags] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null); //목록에서 선택된 그룹

    // 페이지네이션 상태
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const handleBackClick = () => {
        // 뒤로가기 버튼
        navigate("/main");
    };

    // 해시태그 클릭 핸들러
    const handleHashtagClick = (hashtag) => {
        //해시태그 클릭할때
        setSearchTerm(hashtag);
    };

    const fetchTagList = async () => {
        try {
            const res = await api.get("/api/tag/all");
            return res.data;
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const searchInit = async () => {
            const res = await searchGroupByName("", 1);
            setGroups(res);
        };

        searchInit();
    }, []);

    useEffect(() => {
        fetchTagList().then((res) => {
            if (res.code === 200) {
                setHashtags(res.data.map((option) => `#${option.name}`));
            } else {
                console.error("태그 정보 가져오기 실패");
            }
        });
    }, []);

    const searchGroupByTag = async (searchTag, pageNum) => {
        const url =
            searchTag !== ""
                ? `/api/group/find/tag/${searchTag}/pageNum/${pageNum}`
                : `/api/group/find/tag/pageNum/${pageNum}`;

        const res = await api.get(url);
        if (res.data.code === 200) {
            setTotalPages(res.data.totalPages);
            return res.data.data;
        }
    };

    const searchGroupByName = async (searchText, pageNum) => {
        const url =
            searchText !== ""
                ? `/api/group/find/groupName/${searchText}/pageNum/${pageNum}`
                : `/api/group/find/groupName/pageNum/${pageNum}`;

        const res = await api.get(url);

        if (res && res.data.code === 200) {
            setTotalPages(res.data.totalPages);
            return res.data.data;
        } else return null;
    };

    const searchGroup = async (pageNum) => {
        let res;
        if (searchTerm === "#") {
            res = await searchGroupByName("", pageNum);
        } else if (searchTerm.includes("#")) {
            // 태그 검색
            const match = searchTerm.match(/#([^\s]+)/)[1];
            res = await searchGroupByTag(match, pageNum);
        } else {
            // 일반 검색
            res = await searchGroupByName(searchTerm, pageNum);
        }

        setGroups(res);
    };

    const handleSearchEnter = (event) => {
        // 22✅ 엔터 눌렀을때 [그룹 페이지]
        if (event.key === "Enter") {
            searchGroup(1);
        }
    };

    const handleSearchClick = () => {
        // 검색 버튼 클릭
        searchGroup(1);
    };

    const handlePageChange = (event, value) => {
        setPage(value);
        searchGroup(value);
    };

    // 그룹 선택 핸들러
    const handleGroupSelect = (group) => {
        // 그룹선택시
        if (selectedGroup === group) {
            setSelectedGroup(null);
        } else {
            setSelectedGroup(group);
        }
    };

    // 생성 버튼 핸들러
    const handleCreate = () => {
        // 생성 버튼 [그룹 페이지]
        setCreateGroupPage(!createGroupPage); //그룹 생성 페이지 띄움
    };

    return (
        <div className={styles.groupPageContainer}>
            <div className={styles.leftPanel}>
                <div className={styles.row}>
                    <button
                        className={styles.backButton}
                        onClick={handleBackClick}
                    >
                        {"<"}
                    </button>
                    <span className={styles.groupSearchTitle}>그룹검색</span>
                </div>

                {/* 검색창 */}
                <div className={styles.searchBox}>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                        }}
                    >
                        <input
                            type="text"
                            placeholder="검색 (빈 칸은 전체 검색)"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleSearchEnter}
                            className={styles.searchInput}
                        />
                        <button
                            onClick={handleSearchClick}
                            style={{
                                backgroundColor: "#41ADCA",
                                color: "white",
                                padding: "10px 20px",
                                border: "none",
                                borderRadius: "5px",
                                cursor: "pointer",
                                fontSize: "16px",
                                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                                transition: "background-color 0.3s ease",
                                width: "100px",
                            }}
                            onMouseOver={(e) =>
                                (e.target.style.backgroundColor = "#3698B0")
                            }
                            onMouseOut={(e) =>
                                (e.target.style.backgroundColor = "#41ADCA")
                            }
                        >
                            검색
                        </button>
                    </div>
                    {/* 해시태그 목록 */}
                    <div className={styles.hashtags}>
                        {hashtags.map((hashtag, index) => (
                            <span
                                key={index}
                                className={styles.hashtag}
                                onClick={() => handleHashtagClick(hashtag)}
                            >
                                {hashtag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* 그룹 목록 */}
                <div className={styles.groupList}>
                    {groups.map((group, index) => (
                        <div
                            key={index}
                            className={styles.groupItem}
                            onClick={() => handleGroupSelect(group)}
                        >
                            <span className={styles.groupName}>
                                {group.name}
                            </span>
                            <span className={styles.memberCount}>
                                {group.memberCount}명
                            </span>
                        </div>
                    ))}
                </div>
                <div
                    style={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                        marginTop: "10px",
                    }}
                >
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={handlePageChange}
                        color="primary"
                        className={styles.pagination}
                    />
                </div>

                <button
                    className={styles.groupCreateButton}
                    onClick={handleCreate}
                >
                    {createGroupPage ? "닫기" : "생성"}
                </button>
            </div>
            <div className={styles.rightPanel}>
                {/* 우측 판넬의 내용 */}
                {createGroupPage ? (
                    <CreateGroupPage />
                ) : selectedGroup ? (
                    <SelectedGroupInfo groupId={selectedGroup.id} />
                ) : null}
                {/* 그룹 생성인가? 아니면 그룹 상세인가? */}
            </div>
        </div>
    );
};

export default GroupPage;
