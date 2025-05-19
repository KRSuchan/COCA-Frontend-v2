import { Button } from "antd";
import {
    SmileOutlined,
    SearchOutlined,
    StarOutlined,
    SettingOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const ButtonPanel = () => {
    const navigate = useNavigate();

    const handleGroupClick = () => {
        navigate("/group");
    };

    const handleSettingClick = () => {
        navigate("/check");
    };

    const handleFriendsClick = () => {
        navigate("/friends");
    };

    const handleEmptyScheduleClick = () => {
        navigate("/emptyschedule");
    };

    return (
        <div className="button-panel">
            <Button
                icon={<SmileOutlined style={{ fontSize: "30px" }} />}
                className="button disappointment"
                onClick={handleFriendsClick}
            >
                <div>친구</div>
            </Button>
            <Button
                icon={<SearchOutlined style={{ fontSize: "30px" }} />}
                className="button green-color"
                onClick={handleGroupClick}
            >
                <div>그룹검색</div>
            </Button>
            <Button
                icon={<StarOutlined style={{ fontSize: "30px" }} />}
                className="button violet"
                onClick={handleEmptyScheduleClick}
            >
                <div>빈일정</div>
            </Button>
            <Button
                icon={<SettingOutlined style={{ fontSize: "30px" }} />}
                className="button navy-blue"
                onClick={handleSettingClick}
            >
                <div>내설정</div>
            </Button>
        </div>
    );
};
export default ButtonPanel;
