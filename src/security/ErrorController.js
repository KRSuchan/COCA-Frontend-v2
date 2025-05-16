import Swal from "sweetalert2";

export const showAxiosError = () => {
    Swal.fire({
        position: "center",
        icon: "error",
        title: "에러!",
        text: "서버와의 통신에 문제가 생겼어요!",
        showConfirmButton: false,
        timer: 1500,
    }).then((res) => {
        window.location.reload();
    });
};

export const showLoginRequired = (navigate) => {
    Swal.fire({
        position: "center",
        icon: "error",
        title: "에러!",
        text: "로그인은 필수에요!",
        showConfirmButton: false,
        timer: 1500,
    }).then((res) => {
        navigate("/");
    });
};

export const dateValidationCheck = async (sDate, eDate) => {
    const startDate = new Date(sDate);
    const endDate = new Date(eDate);

    if (startDate > endDate) {
        Swal.fire({
            position: "center",
            icon: "error",
            title: "에러!",
            text: "일정의 시작이 일정의 끝 보다 나중일 수 없어요!",
            showConfirmButton: false,
            timer: 1500,
        });
        return false;
    } else {
        return true; // 가능
    }
};
