import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./css/SignupPage.css"; // 스타일시트 임포트
import Swal from "sweetalert2";
import api from "./security/TokenManage";

function SignUpPage() {
    const navigate = useNavigate();
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [nickname, setNickname] = useState("");
    const [interests, setInterests] = useState(["", "", ""]); //✅ 관심사 이부분 수정되었어요 기존은 []
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [agreeToPolicy, setAgreeToPolicy] = useState(false);
    const [isDupchecked, setIsDupChecked] = useState(false);
    const [tagList, setTagList] = useState([
        {
            id: 1,
            field: "IT",
            name: "스프링",
        },
        {
            id: 2,
            field: "IT",
            name: "자바",
        },
        {
            id: 3,
            field: "IT",
            name: "리액트",
        },
    ]);

    const handleDuplicateCheck = async () => {
        // 통신 구현 필요
        const res = await api.post(
            "/api/member/validate-id",
            {
                id: userId,
            },
            navigate
        );

        console.log(res);

        if (res.data.data === true) {
            Swal.fire({
                icon: "question",
                title: "사용 가능한 아이디에요!",
                text: "이 아이디를 사용하시겠나요?",
                showCancelButton: true,
                confirmButtonText: "네! 사용할래요!",
                cancelButtonText: "아니요, 바꿀래요.",
            }).then(async (resp) => {
                if (resp.isConfirmed) {
                    setIsDupChecked(true);
                }
            });
        } else {
            Swal.fire({
                position: "center",
                icon: "error",
                title: `이 아이디는 사용할 수 없어요.`,
                showConfirmButton: false,
                timer: 1500,
            });
        }
    };

    // 비밀번호 일치 확인
    const isPasswordMatch = () => {
        return password === confirmPassword;
    };

    const fetchTagList = async () => {
        try {
            const res = await api.get("/api/tag/all", navigate);
            console.log(res.data);

            return res.data;
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchTagList().then((res) => {
            if (res.code === 200) {
                setTagList(res.data.map((option) => option));
            } else {
                console.error("태그 정보 가져오기 실패");
            }
        });
    }, []);

    const signUp = async () => {
        try {
            const interestId = interests
                .filter((interestItem) => interestItem !== "")
                .map((interestItem) => {
                    const tag = tagList.find(
                        (tag) => tag.name === interestItem
                    );
                    return tag ? { tagId: tag.id, TagName: tag.name } : null;
                })
                .filter((tag) => tag !== null);

            const requestData = {
                id: userId,
                password: password,
                userName: nickname,
                isDefaultImage: profilePhoto === null ? true : false,
                interestId: interestId,
            };

            const formData = new FormData();
            formData.append(
                "data",
                new Blob([JSON.stringify(requestData)], {
                    type: "application/json",
                })
            );

            if (profilePhoto) {
                formData.append("profileImage", profilePhoto);
            } else {
                formData.append("profileImage", "[]");
            }

            const res = await axios.post(
                process.env.REACT_APP_SERVER_URL + "/api/member/joinReq",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            console.log(res);

            return res.data;
        } catch (error) {
            console.error(error);
        }
    };

    // 회원가입 처리 함수
    const handleSignUp = async (e) => {
        e.preventDefault();
        if (!isPasswordMatch()) {
            Swal.fire({
                icon: "error",
                title: "비밀번호가 일치하지 않아요!",
                confirmButtonText: "확인",
            });
            return;
        }
        if (!agreeToPolicy) {
            Swal.fire({
                icon: "error",
                title: "정책에 동의 해 주셔야 해요!",
                confirmButtonText: "확인",
            });
            return;
        }
        if (!isDupchecked) {
            Swal.fire({
                icon: "error",
                title: "아이디 중복 체크가 필요해요!",
                confirmButtonText: "확인",
            });
        }
        // 회원가입 API 호출
        try {
            const response = await signUp();

            console.log("reg : ", response);

            if (response.code === 200) {
                navigate("/"); // 회원가입 성공 시 홈페이지로 이동
            } else {
                Swal.fire({
                    icon: "error",
                    title: "회원가입이 정상적으로 이루어지지 않았어요!",
                    confirmButtonText: "확인",
                });
            }
        } catch (error) {
            console.error("회원가입 실패:", error);
        }
    };

    // 관심사 변경 처리
    const handleInterestChange = (index, event) => {
        const value = event.target.value;
        setInterests((prevInterests) => {
            const newInterests = [...prevInterests];
            newInterests[index] = value;
            return newInterests;
        });
    };

    // 프로필 사진 변경 처리
    const handleProfilePhotoChange = (event) => {
        setProfilePhoto(event.target.files[0]);
    };

    return (
        <div className="signup-container">
            <form className="signup-form" onSubmit={handleSignUp}>
                <h2>회원가입</h2>
                <div className="form-group">
                    <label htmlFor="userId">아이디</label>
                    <input
                        type="text"
                        id="userId"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        disabled={isDupchecked}
                        required
                    />
                    {!isDupchecked && (
                        <button type="button" onClick={handleDuplicateCheck}>
                            중복 체크
                        </button>
                    )}
                </div>
                <div className="form-group">
                    <label htmlFor="password">비밀번호</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="confirmPassword">비밀번호 확인</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="nickname">닉네임</label>
                    <input
                        type="text"
                        id="nickname"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group interest-group">
                    <label htmlFor="interest">관심사</label>
                    {interests.map((interest, index) => (
                        <select
                            key={index}
                            id={`interest-${index}`}
                            style={{ marginRight: "10px" }}
                            value={interest}
                            onChange={(e) => handleInterestChange(index, e)}
                            required
                        >
                            <option value="" disabled>
                                선택하세요
                            </option>
                            {tagList
                                .filter(
                                    (tag) =>
                                        !interests.includes(tag.name) ||
                                        tag.name === interest
                                )
                                .map((tag) => (
                                    <option key={tag.id} value={tag.name}>
                                        {tag.name}
                                    </option>
                                ))}
                        </select>
                    ))}
                </div>
                <div className="form-group">
                    <label htmlFor="profilePhoto">프로필 사진</label>
                    <input
                        type="file"
                        id="profilePhoto"
                        onChange={handleProfilePhotoChange}
                    />
                </div>
                <div className="policy-container">
                    <h3>개인정보처리방침</h3>
                    <div className="policy-box">
                        {/* 개인정보처리방침 내용 */}
                        <p>
                            <strong>개인정보 처리방침</strong>
                        </p>
                        <p>
                            본 COCA 서비스는 회원님의 개인정보를 소중히 다루며,
                            회원가입 시 제공하신 정보는 다음과 같은 목적으로
                            사용됩니다:
                        </p>
                        <ul>
                            <li>
                                서비스 제공: 회원님의 아이디, 비밀번호, 닉네임
                                등은 서비스 이용을 위해 필요한 최소한의 정보로
                                활용됩니다.
                            </li>
                            <li>
                                일정 공유: 회원님이 공개하신 일정은 다른 회원,
                                그룹, 친구들과 공유될 수 있습니다. 이는 서비스의
                                핵심 기능 중 하나로, 회원 간의 소통과 협업을
                                촉진합니다.
                            </li>
                            <li>
                                개인화된 경험: 회원님의 관심사에 기반하여 맞춤형
                                서비스를 제공합니다.
                            </li>
                        </ul>
                        <p>
                            <strong>정보 보호 조치</strong>
                        </p>
                        <ul>
                            <li>
                                모든 개인정보는 암호화되어 안전하게 저장됩니다.
                            </li>
                            <li>
                                서버는 철저한 보안 조치를 통해 외부로부터의
                                접근을 차단합니다.
                            </li>
                        </ul>
                        <p>
                            <strong>정보 공유 및 공개</strong>
                        </p>
                        <ul>
                            <li>
                                회원님이 동의하지 않는 한, 개인정보는 제3자에게
                                공개되거나 공유되지 않습니다.
                            </li>
                            <li>
                                공개된 일정은 회원님의 동의 하에 특정 사용자
                                또는 그룹과만 공유됩니다.
                            </li>
                        </ul>
                        <p>
                            <strong>동의 철회</strong>
                        </p>
                        <p>
                            회원님은 언제든지 개인정보 처리에 대한 동의를 철회할
                            수 있으며, 이 경우 관련 서비스 이용에 제한이 있을 수
                            있습니다.
                        </p>
                        <p>
                            <strong>문의 및 변경</strong>
                        </p>
                        <p>
                            개인정보 처리방침에 대한 문의나 변경 요청은 언제든지
                            서비스 고객센터로 연락 주시기 바랍니다.
                        </p>
                        <p>
                            본 개인정보 처리방침은 [24.06.01]에 마지막으로
                            업데이트되었습니다.
                        </p>
                    </div>

                    <label>
                        <input
                            type="checkbox"
                            checked={agreeToPolicy}
                            onChange={(e) => setAgreeToPolicy(e.target.checked)}
                        />
                        개인정보처리방침에 동의합니다.
                    </label>
                </div>

                <button type="submit" className="signup-button">
                    가입하기
                </button>
            </form>
        </div>
    );
}

export default SignUpPage;
