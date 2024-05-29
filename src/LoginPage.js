import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './css/LoginPage.css';
import Swal from 'sweetalert2';

function LoginPage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    login();
    // navigate('/main');
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  const login = () => {
    axios.post(process.env.REACT_APP_SERVER_URL + "/api/member/loginReq", {
      id: userId,
      password: password
    })
    .then(res => {

      console.log(res);

      if(res.data.code === 200) {
        console.log("로그인 성공 : ", res.data);
      
        localStorage.setItem('userId', userId);
        localStorage.setItem('accessToken', res.data.data.accessToken);
        localStorage.setItem('refreshToken', res.data.data.refreshToken);

        navigate('/main');
      } else if(res.data.code === 400) {
        console.log("로그인 실패 : ", res.data); 
        Swal.fire({
          position: "center",
          icon: "error",
          title: "로그인 실패!",
          text: "아이디 또는 비밀번호가 달라요!",
          showConfirmButton: false,
          timer: 1500
        });
      } else {
        Swal.fire({
          position: "center",
          icon: "error",
          title: "로그인 실패!",
          text: "알 수 없는 오류가 생겼거나, 서버로부터 응답이 없어요!",
          showConfirmButton: false,
          timer: 1500
        });
      }

      
    })
    .catch(error => {
      console.log("로그인 실패 : ", error);
    })
  }

  return (
    <div className="container">
      <div className = "cards-container">

        <div className="info-card">
          <h2><span role="img" aria-label="sparkles">✨</span>빈일정찾기</h2>
          <p>빈 일정 찾기 버튼을 눌러, 모두의 일정을 비교하고 모두가 빈 시간에 회의하거나, 여행 일정을 추가해 보세요!</p>
        </div>
        <div className="login-card">
          <div className="transparent-box">
            <input
              type="text"
              id="id"
              name="id"
              placeholder="ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
            <input
              type="password"
              id="pw"
              name="pw"
              placeholder="PW"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="button-container">
              <button className="login-button" type="submit" onClick={handleLogin}>LOGIN</button>
              <button className="signup-button" type="submit" onClick={handleSignUp}>SIGN UP</button>
            </div>
          </div>
          <h1 className="right-aligned">COCA</h1>
        </div>

      </div>
      
    </div>
);

}

export default LoginPage;
