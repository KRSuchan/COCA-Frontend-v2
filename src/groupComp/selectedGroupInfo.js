// SelectedGroupInfo.js
import React, { useState, useEffect } from 'react';
import { UserOutlined } from '@ant-design/icons'; // 사람 아이콘을 위한 import
import styles from '../css/GroupPage.module.css';
import axios from 'axios';
import { refreshAccessToken } from '../security/TokenManage';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const SelectedGroupInfo = ({ groupId }) => {
  const navigate = useNavigate();

  // 상태 관리를 위한 기본값 설정
  const [group, setGroup] = useState({
    id: 11,
    name: '수정NAME',
    admin: {
      id: 'TESTID1',
      userName: 'TESTNAME1',
      profileImgPath: 'https://file.instiz.net/data/file/20130117/a/6/e/a6e5e3521b4a120d81940cb69638c54b'
    },
    description: '테스트그룹 설명5',
    isPrivate: false,
    groupTags: [
      { id: 1, field: 'IT', name: '스프링' }
    ],
    memberCount: 2,
    isAdmin: false,
    isMember: false
  });
  const [isMember, setIsMember] = useState(false); // 가입여부
  const [isManager, setIsManager] = useState(true); // 관리자 여부를 상태로 관리

  const fetchGroupData = async() => {
    const accessToken = localStorage.getItem('accessToken');

    try {
      const config = {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
      };
      console.log(groupId);
      const res = await axios.get(process.env.REACT_APP_SERVER_URL + `/api/group/detail?memberId=${localStorage.getItem("userId")}&groupId=${groupId}`, config);
      console.log(res);

      if(res.data.code === 200) {
        return res.data.data;
      }
      else if(res.data.code === 401) {
        await refreshAccessToken(navigate);
        fetchGroupData();
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

  // 컴포넌트 마운트 시 백엔드에서 데이터를 가져오는 효과
  useEffect(() => { //✅ 그룹 상세정보 가져오면됨, 해당그룹 가입여부와 관리자여부는 백엔드측에서 추가해야 할듯
    // TODO: 백엔드에서 그룹 정보를 가져오는 로직 구현
    // fetchGroupInfo().then(data => setGroup(data));
    console.log('그룹 선택2:', groupId);
    const setData = async() => {
      const res = await fetchGroupData();
      setGroup(res);
      setIsMember(res.isMember);
      setIsManager(res.isAdmin);
    };

    setData();
  }, [groupId]);

  const joinGroup = async (pw) => {
    const accessToken = localStorage.getItem('accessToken');

    try {
      const config = {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
      };

      const data = {
          member: {
              id: localStorage.getItem("userId")
          },
          group: {
              id :group.id,
              privatePassword : pw
          }
      }

      const res = await axios.post(process.env.REACT_APP_SERVER_URL + "/api/group/join", data, config);

      console.log(res);

      if(res.data.code === 200) {
        return true;
      }
      else if(res.data.code === 400){
        return false;
      }
      else if(res.data.code === 401) {
        await refreshAccessToken(navigate);
        joinGroup(pw);
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

  // 백엔드와 통신하여 그룹 참가 처리
  const handleJoinGroup = () => {
    console.log(group);

    if(group.isPrivate) {
      Swal.fire({
        icon: "question",
        title: "그룹 참가",
        html: `그룹에 참가하시겠나요?<br>현재 그룹은 비공개 그룹이에요!<br>비밀번호를 입력해주세요!`,
        input: 'password',
        inputPlaceholder: '비밀번호',
        showCancelButton: true,
        confirmButtonText: "참가",
        cancelButtonText: "취소",
        showLoaderOnConfirm: true,
        preConfirm: async (password) => {
            const res = await joinGroup(password);
            if(!res) {
                return Swal.showValidationMessage('비밀번호가 달라요!');
            }

            return res;
          }
      }).then(async (res) => {
        if(res.isConfirmed) {
          Swal.fire({
            position: "center",
            icon: "success",
            title: "그룹에 정상적으로 참가했어요!",
            showConfirmButton: false,
            timer: 1500
          });

          setIsMember(true);
        }
        else {
          Swal.fire({
            position: "center",
            icon: "info",
            title: "참가를 취소했어요.",
            showConfirmButton: false,
            timer: 1500
        });
        }
      })
    }
    else {
      Swal.fire({
        icon: "question",
        title: "그룹에 참가하시겠나요?",
        showCancelButton: true,
        confirmButtonText: "참가",
        cancelButtonText: "취소"
    }).then(async (res) => {
        if(res.isConfirmed) {
            await joinGroup(null);

            Swal.fire({
                position: "center",
                icon: "success",
                title: "그룹에 정상적으로 참가했어요!",
                showConfirmButton: false,
                timer: 1500
            });

            setIsMember(true);
        }
        else {
            Swal.fire({
                position: "center",
                icon: "info",
                title: "참가를 취소했어요.",
                showConfirmButton: false,
                timer: 1500
            });
        }
    });
    }
    
    // TODO: 백엔드에 그룹 참가 요청 로직 구현
  };

  const inviteGroup = async (groupId, inviteId) => {
    const accessToken = localStorage.getItem('accessToken');

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      };

      const res = await axios.post(process.env.REACT_APP_SERVER_URL + 
        `/api/request/add/group-invite/from/${localStorage.getItem('userId')}/to/${inviteId}/group/${groupId}`, null, config);
      
        console.log(res);

        if(res.data.code === 201) {
          return 200;
        } else if (res.data.code === 400) {
          return 404;
        } else if (res.data.code === 401) {
          await refreshAccessToken(navigate);
          inviteGroup(groupId, inviteId);
        } else if (res.data.code === 409) {
          return 409;
        } else {
          throw new Error('unknown Error');
        }
    } catch(error) {
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

  // 그룹 초대 버튼 클릭 시 모달 창을 띄우는 함수
  const handleInviteGroup = async () => {
    Swal.fire({
      icon: 'question',
      title: '그룹 초대',
      input: 'text',
      inputPlaceholder: '초대할 ID를 입력하세요',
      showCancelButton: true,
      confirmButtonText: '보내기',
      cancelButtonText: '취소',
      preConfirm: async (inviteId) => {
        console.log(`그룹 ID: ${groupId}, 초대할 사용자 ID: ${inviteId}`);
        const res = await inviteGroup(groupId, inviteId);
        console.log(res);
        if(res === 404) {
          return Swal.showValidationMessage('해당 유저를 찾지 못했어요!');
        }
        if(res === 409) {
          return 409;
        }
        if(res === null) {
          return null;
        }
      }
    }).then(async (res) => {
      if(res.isConfirmed) {
        if(res.value === 200) {
          Swal.fire({
            position: "center",
            icon: "success",
            title: "초대 완료",
            text: "성공적으로 그룹에 초대했어요!",
            showConfirmButton: false,
            timer: 1500
          });
        } else if (res.value === 409) {
          Swal.fire({
            position: "center",
            icon: "error",
            title: "에러!",
            text: "이미 초대를 보냈어요!",
            showConfirmButton: false,
            timer: 1500
          });
        }
      } 
      else {
        Swal.fire({
          position: "center",
          icon: "info",
          title: "초대를 취소했어요.",
          showConfirmButton: false,
          timer: 1500
        });
      }
    });
  };

  return (
    <div className={styles.selectedGroupInfo}>
      <span className={styles.groupNameTitle}>{group.name}</span>
      <span className={styles.memberCountInfo}>{group.memberCount}명</span>
      <div className={styles.groupInfoBox} style={{ display: 'flex', alignItems: 'center' }}>
        {group.admin.profileImgPath ? (
          <img src={group.admin.profileImgPath} alt="관리자 사진" className={styles.adminProfileImage} style={{ borderRadius: '50%', width: '50px', height: '50px', marginRight: '10px' }} />
        ) : (
          <UserOutlined style={{ fontSize: '50px', marginRight: '10px' }} />
        )}
        <p className={styles.adminName}>[관리자] {group.admin.userName}</p>
      </div>
      <div className={styles.groupInfoBox}>
        <p className={styles.groupDescription}>{group.description}</p>
        {/* 해시태그 배열을 처리하는 방식 변경 */}
        <div className={styles.groupHashtags}>
          {group.groupTags.map((tag) => (
            <span key={tag.id} className={styles.hashtag}>{`#${tag.name}`}</span>
          ))}
        </div>
      </div>
      {isMember ? (
        // <button className={styles.joinButton} onClick={handleLeaveGroup}>탈퇴</button>
        <button className={styles.joinButton} onClick={handleInviteGroup}>그룹 초대</button>
      ) : (
        <button className={styles.joinButton} onClick={handleJoinGroup}>참가</button>
      )}
      
    </div>
  );
};

export default SelectedGroupInfo;
