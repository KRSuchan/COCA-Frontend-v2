
# 📅 COCA Frontend

이 프로젝트는 **COCA** 서비스의 프론트엔드입니다. 
**COCA** 서비스의 백엔드는 [해당 링크](https://github.com/kit-COCA/COCA-Backend)를 참고해주세요.
### 프로젝트 개요
COCA 프로젝트는 사용자 간 일정 공유와 협업을 지원하는 서비스로, 개인 일정뿐 아니라 그룹 단위의 일정 조율까지 한 번에 관리할 수 있는 플랫폼입니다.
Spring Security와 JWT를 기반으로 한 안정적인 인증 시스템을 통해 세션을 관리하며, 사용자 간의 효율적인 소통과 협업을 가능하게 합니다.
### 프로젝트 목표
COCA 프로젝트의 목표는 사용자가 개인 및 그룹 일정을 손쉽게 관리하고, 다른 사용자와 효율적으로 협업할 수 있도록 지원하는 것입니다.
이를 통해 학업, 업무, 일상 등 다양한 환경에서 발생하는 일정 충돌 문제를 최소화하고, 생산성과 소통 효율을 극대화하는 일정 플랫폼을 구축하고자 합니다.

![](https://github.com/user-attachments/assets/b564ebf3-897d-4df5-977e-cfb3139599e1) | ![](https://github.com/user-attachments/assets/34cdc9da-fb51-4963-b57d-00a8c95764d6)
---|---|

## 👨‍💻👩‍💻 역할 분담
- **이수찬**: 프로젝트 총괄, DB 설계, 시스템 구조 설계, Spring 백엔드 구현  
- **이상헌**: 프론트 서버 통신 구현, 핵심 알고리즘(빈일정) 구현, CORS 관리, Spring 백엔드 보조, 프론트 UI 보조  
- **임희열**: React UI/UX 설계 및 구현, 프론트 서버 통신 보조  
- **이채연**: Spring 백엔드 구현, 프론트 서버 통신 보조, 핵심 알고리즘(MD5) 구현  

## 🚀 기술 스택
- **Frontend**: JavaScript, React.js
- **Backend**: Spring Boot 3.2.5, Spring Security 6.2.4
- **File Storage**: AWS S3 (첨부파일 관리)
- **Database**: MySQL
- **Token Management**: Redis (JWT 관리)
- **API Documentation**: Notion

## 📌 주요 기능(42) 
- **회원 관리**(6): 회원 가입, 로그인, 로그아웃, 개인 정보 조회 및 수정, 회원 탈퇴
- **일정 관리**(14): 빈 일정 찾기, 개인 일정 관리(CRUD), 그룹 일정 관리(CRUD) 등 14개 기능
- **그룹 관리**(10): 그룹 관리(CRUD), 그룹 공지 관리(CRUD) 등 10개 기능
- **친구 관리**(5): 친구 관리(CRUD), 친구 일정 조회
- **요청 관리**(4): 요청 관리(CRUD)
- **회원 인증**(3): 회원 토큰 생성, 인증, 삭제

## 📖 API 문서  
COCA 백엔드에서 제공하는 API 명세서는 아래 Notion 페이지에서 확인할 수 있습니다.  
[📄 COCA JSON API 문서](https://bitter-nut-ad9.notion.site/COCA-Json-API-Doc-1b7328d2c5d94c058f0bacc363d484e8)

## 🖥️ 시스템 구조도
![시스템구조도](https://github.com/user-attachments/assets/24f5f984-5380-4cfb-9127-7f36710438d3)

## 📂 프로젝트 구조
```
cocaFront/
    ├── src/
        ├── components
            ├── AddSchedulePage.js
            ├── ButtonPanel.js
            ├── GroupsList.js
            ├── MainCalendar.js
            ├── MainLogo.js
            ├── MiniCalendar.js
            └── NewPage.js
        ├── css                     # 각종 css
        ├── emptyComp               # 빈일정찾기 컴퍼넌트
            └── ScheduleSearch.js
        ├── groupComp               # 그룹 관련 컴퍼넌트
            ├── CreateGroupPage.js
            ├── EditGroupPage.js
            └── selectedGroupInfo.js
        ├── security                # 보안 관련
            ├── ErrorController.js
            └── TokenManage.js
        ├── App.js
        ├── FriendsPage.js
        ├── GroupPage.js
        ├── index.js
        ├── LoginCheckPage.js
        ├── MainPage.js
        ├── NoticePage.js
        ├── reducer.js
        ├── SettingPage.js
        ├── SignupPage.js
        └── ...
    ├── .env
    ├── README.md
    ├── .gitignore
    ├── package-lock.json
    ├── package.json
    └── ...
```
## 📊 ERD  
![COCA_DB 설계V3](https://github.com/user-attachments/assets/5ee2763c-56c9-4e09-9320-d15bb307c0bc)

## 🧱 클래스 다이어그램(백엔드)  
### 빈일정 찾기 시스템 클래스
![image](https://github.com/user-attachments/assets/6872a2a2-3b63-4f8c-9ce1-b0907c6cf2b5)
자세한 클래스 다이어그램은 프로젝트 문서 혹은 리뷰 블로그 참고 바랍니다.  
[3. 설계명세서(이수찬, 이상헌, 임희열, 이채연)v1.pdf](https://github.com/kit-COCA/cocaBack/blob/main/documents/3.%20%E1%84%89%E1%85%A5%E1%86%AF%E1%84%80%E1%85%A8%E1%84%86%E1%85%A7%E1%86%BC%E1%84%89%E1%85%A6%E1%84%89%E1%85%A5(%E1%84%8B%E1%85%B5%E1%84%89%E1%85%AE%E1%84%8E%E1%85%A1%E1%86%AB%2C%20%E1%84%8B%E1%85%B5%E1%84%89%E1%85%A1%E1%86%BC%E1%84%92%E1%85%A5%E1%86%AB%2C%20%E1%84%8B%E1%85%B5%E1%86%B7%E1%84%92%E1%85%B4%E1%84%8B%E1%85%A7%E1%86%AF%2C%20%E1%84%8B%E1%85%B5%E1%84%8E%E1%85%A2%E1%84%8B%E1%85%A7%E1%86%AB)v1.pdf)    
[5. 최종보고서(이수찬, 이상헌, 임희열, 이채연)v1.pdf](https://github.com/kit-COCA/cocaBack/blob/main/documents/5.%20%E1%84%8E%E1%85%AC%E1%84%8C%E1%85%A9%E1%86%BC%E1%84%87%E1%85%A9%E1%84%80%E1%85%A9%E1%84%89%E1%85%A5(%E1%84%8B%E1%85%B5%E1%84%89%E1%85%AE%E1%84%8E%E1%85%A1%E1%86%AB%2C%20%E1%84%8B%E1%85%B5%E1%84%89%E1%85%A1%E1%86%BC%E1%84%92%E1%85%A5%E1%86%AB%2C%20%E1%84%8B%E1%85%B5%E1%86%B7%E1%84%92%E1%85%B4%E1%84%8B%E1%85%A7%E1%86%AF%2C%20%E1%84%8B%E1%85%B5%E1%84%8E%E1%85%A2%E1%84%8B%E1%85%A7%E1%86%AB)v1.pdf)  
혹은 [COCA 시스템 개발 리뷰](https://velog.io/@lsc4814/COCA-v1-%EA%B5%AC%ED%98%84-%EC%8B%9C%EC%8A%A4%ED%85%9C-%EB%A6%AC%EB%B7%B0)를 참고해주세요

## ⚙️ 실행 방법
### 0. 백엔드 프로젝트 실행
프론트엔드 프로젝트가 정상적으로 실행되기 위해서는 백엔드 프로젝트가 우선 실행되어야 합니다.
### 1. npm 설치
터미널에 아래 내용을 입력하고 Enter
```
npm install
```
### 2. 환경 변수 설정
`cocaFront/.env`을 아래 내용을 참고하여 수정합니다:
```yaml
REACT_APP_API_URL=http://localhost:8080
```
### 3. 빌드 및 실행
터미널에 아래 내용을 입력하고 Enter
```
npm start
```
---
### 3. 로그인
ID : tester0000  
PWD : tester0000  
#### 더 자세한 내용은 [프로젝트 문서](https://github.com/kit-COCA/cocaBack/tree/main/documents)를 참고해주세요.
