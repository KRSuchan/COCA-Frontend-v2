import React, { useEffect, useState } from 'react';
import styles from './css/GroupPage.module.css';
import { useNavigate } from 'react-router-dom';

import SelectedGroupInfo from './groupComp/selectedGroupInfo';
import CreateGroupPage from './groupComp/CreateGroupPage';
import axios from 'axios';
import { refreshAccessToken } from './security/TokenManage';
import Swal from 'sweetalert2';
import { SearchOutlined } from '@ant-design/icons'; // antd 아이콘 추가
import Pagination from '@mui/material/Pagination'; // MUI Pagination 추가

useEffect(() =>{
  const id = localStorage.getItem('userId');
  if(id === null) {
      showLoginRequired(navigate);
  }
}, [])

const GroupPage = () => {

  const navigate = useNavigate(); 
  // 검색어 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [initialSearchTerm, setInitialSearchTerm] = useState('');

  // 생성 페이지 상태
  const [createGroupPage, setCreateGroupPage] = useState(false);

  // 그룹 목록 상태
  const [groups, setGroups] = useState([
    { groupId: 1, name: '재생산 스타디그룹', memberCount: 1009, admin: '니이모를찾아서', description: '이 스터디그룹에서 여러분의 공부를 더욱 북돋을 동료 재수생들과 함께 할 수 있어요!', hashtags: ['#IT', '#스터디'] },
    { groupId: 2, name: '리액트 개발자그룹', memberCount: 5388, admin: '관리자2', description: '그룹 설명...', hashtags: ['#웹개발', '#파이썬'] },
    { groupId: 3, name: 'Vue.js 개발자그룹', memberCount: 891, admin: '관리자3', description: '그룹 설명...', hashtags: ['#Vue', '#JavaScript'] },
  ]);

  // 해시태그 상태
  const [hashtags, setHashtags] = useState(['#IT', '#스터디', '#웹개발', '#파이썬']);
  const [selectedGroup, setSelectedGroup] = useState(null); //목록에서 선택된 그룹

  // 페이지네이션 상태
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 유저 해시태그 상태
  const [userTags, setUserTags] = useState(['', '', '']);

  const handleBackClick = () => { // 뒤로가기 버튼
    navigate("/main");
  }

  // 해시태그 클릭 핸들러
  const handleHashtagClick = (hashtag) => { //해시태그 클릭할때
    setSearchTerm(hashtag);
  };

  const fetchTagList = async () => {
    try {
      const res = await axios.get(process.env.REACT_APP_SERVER_URL + "/api/tag/all");
      console.log(res.data);

      return res.data;
    } catch(error) {
      console.error(error);
    }
  }

  // TODO : 유저 태그 받아와서 첫 목록은 유저 관심사로 검색한 결과 가져오기
  const fetchUserTags = async () => {
    const accessToken = localStorage.getItem('accessToken');
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      };

      const res = await axios.get(process.env.REACT_APP_SERVER_URL + `/api/member/memberTagInquiryReq?memberId=${localStorage.getItem('userId')}`, config);

      console.log(res);

      if(res.data.code === 200) {
        return res.data.data;
      }
      else if (res.data.code === 401) {
        await refreshAccessToken(navigate);
        fetchUserTags();
      }
      else {
        throw new Error('unknown Error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        position: "center",
        icon: "error",
        title: "에러!",
        text: "서버와의 통신에 문제가 생겼어요!",
        showConfirmButton: false,
        timer: 1500
    });
    }
  }

  useEffect(() => {
    const setInitialTerm = async () => {
      const data = await fetchUserTags();
      const randomIndex = Math.floor(Math.random() * data.length);
      const ranSelTag = data[randomIndex].tagName;
      // setInitialSearchTerm(ranSelTag);
      setInitialSearchTerm(ranSelTag);
      setSearchTerm('#'+ranSelTag);

      console.log(ranSelTag);
      console.log('t', searchTerm);
    }

    setInitialTerm();
  }, [])

  useEffect(() => {
    const searchInit = async () => {
      const res = await searchGroupByTag(initialSearchTerm, 1);

      setGroups(res);
    }

    searchInit();
  }, [initialSearchTerm])

  useEffect(() => {
    fetchTagList().then(res => {
      if(res.code === 200) {
        setHashtags(res.data.map(option => `#${option.name}`));
      } else {
        console.error('태그 정보 가져오기 실패');
      }
    })


  }, []);

  // TODO :: 페이지 검색 처리
  const searchGroupByTag = async(searchTag, pageNum) => {
    const accessToken = localStorage.getItem('accessToken');
    try {
        const config = {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
        };

        const url = searchTag !== '' ? `/api/group/find/tag/${searchTag}/pageNum/${pageNum}` : `/api/group/find/tag/pageNum/${pageNum}`
        
        const res = await axios.get(process.env.REACT_APP_SERVER_URL + url, config);
        console.log(res); 
        
        if(res.data.code === 200) {
          setTotalPages(res.data.totalPages);
          return res.data.data;
        }
        else if(res.data.code === 401) {
          await refreshAccessToken(navigate);
          searchGroupByTag(searchTag, pageNum);
        }
        else {
          throw new Error('unknown Error');
        }
        
    } catch (error) {
      console.error(error);
      Swal.fire({
        position: "center",
        icon: "error",
        title: "에러!",
        text: "서버와의 통신에 문제가 생겼어요!",
        showConfirmButton: false,
        timer: 1500
      });
      return null;
    }
  }

  const searchGroupByName = async(searchText, pageNum) => {
    const accessToken = localStorage.getItem('accessToken');
    try {
      const config = {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
      };

      const url = searchText !== '' ? `/api/group/find/groupName/${searchText}/pageNum/${pageNum}` : `/api/group/find/groupName/pageNum/${pageNum}`

      const res = await axios.get(process.env.REACT_APP_SERVER_URL + url, config);
      console.log(res);

      if(res.data.code === 200) {
        setTotalPages(res.data.totalPages);
        return res.data.data;
      }
      else if(res.data.code === 401) {
        await refreshAccessToken(navigate);
        searchGroupByName(searchText, pageNum);
      }
      else {
        throw new Error('unknown Error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        position: "center",
        icon: "error",
        title: "에러!",
        text: "서버와의 통신에 문제가 생겼어요!",
        showConfirmButton: false,
        timer: 1500
      });
      return null;
    }
  }

  const searchGroup = async(pageNum) => {
    let res;

    console.log(searchTerm);
    if(searchTerm === '#') {
      res = await searchGroupByName('', pageNum);
    }
    else if(searchTerm.includes("#")) { // 태그 검색
      const match = searchTerm.match(/#([^\s]+)/)[1];
      console.log("matchText", match);
      res = await searchGroupByTag(match, pageNum);
    } 
    else { // 일반 검색
      res = await searchGroupByName(searchTerm, pageNum);
    }

    setGroups(res);

  }

  const handleSearchEnter = (event) => { // 22✅ 엔터 눌렀을때 [그룹 페이지] 
    if (event.key === 'Enter') {
      // if (searchTerm.trim() === '') {
      //   Swal.fire({
      //     position: "center",
      //     icon: "warning",
      //     title: "경고!",
      //     text: "검색어를 입력해주세요!",
      //     showConfirmButton: false,
      //     timer: 1500
      //   });
      //   return;
      // }
      console.log('검색어:', searchTerm);
      searchGroup(1);
    }
  };

  const handleSearchClick = () => { // 검색 버튼 클릭
    // if (searchTerm.trim() === '') {
    //   Swal.fire({
    //     position: "center",
    //     icon: "warning",
    //     title: "경고!",
    //     text: "검색어를 입력해주세요!",
    //     showConfirmButton: false,
    //     timer: 1500
    //   });
    //   return;
    // }
    console.log('검색 버튼 클릭:', searchTerm);
    searchGroup(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    searchGroup(value);
  };

  // 그룹 선택 핸들러
  const handleGroupSelect = (group) => { // 그룹선택시
    if(selectedGroup === group) {
      setSelectedGroup(null);
    } else {
      setSelectedGroup(group); 
      console.log('그룹 선택:', group.id);
    }
  };

  // 생성 버튼 핸들러
  const handleCreate = () => { // 생성 버튼 [그룹 페이지]
    setCreateGroupPage(!createGroupPage); //그룹 생성 페이지 띄움
  };

  return (
    <div className={styles.groupPageContainer}>
      <div className={styles.leftPanel}>
        <div className={styles.row}>
        <button className={styles.backButton} onClick={handleBackClick}>{'<'}</button>
          <span className={styles.groupSearchTitle}>그룹검색</span>
        </div>
        
        {/* 검색창 */}
        <div className={styles.searchBox}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
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
                backgroundColor: '#41ADCA', 
                color: 'white', 
                padding: '10px 20px', 
                border: 'none', 
                borderRadius: '5px', 
                cursor: 'pointer', 
                fontSize: '16px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                transition: 'background-color 0.3s ease',
                width: '100px',
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#3698B0'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#41ADCA'}
            >
              검색
            </button>
          </div>
          {/* 해시태그 목록 */}
          <div className={styles.hashtags}>
            {hashtags.map((hashtag, index) => (
              <span key={index} className={styles.hashtag} onClick={() => handleHashtagClick(hashtag)}>
                {hashtag}
              </span>
            ))}
          </div>
        </div>

        {/* 그룹 목록 */}
        <div className={styles.groupList}>
          {groups.map((group, index) => (
          <div key={index} className={styles.groupItem} onClick={() => handleGroupSelect(group)}>
                <span className={styles.groupName}>{group.name}</span>
                  <span className={styles.memberCount}>{group.memberCount}명</span>
                </div>
              ))}
          </div>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
            <Pagination 
              count={totalPages} 
              page={page} 
              onChange={handlePageChange} 
              color="primary" 
              className={styles.pagination}
            />
          </div>
          
          <button className={styles.groupCreateButton} onClick={handleCreate}>{createGroupPage? "닫기" : "생성"}</button>
        </div>
      <div className={styles.rightPanel}>

        {/* 우측 판넬의 내용 */}
        {createGroupPage ? (
          <CreateGroupPage />
        ) : selectedGroup ? (
          <SelectedGroupInfo
            groupId={selectedGroup.id}
          />
        ) : null}
        {/* 그룹 생성인가? 아니면 그룹 상세인가? */}
      </div>
    </div>
  );
};

export default GroupPage;
