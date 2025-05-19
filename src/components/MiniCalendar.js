// MiniCalendar.js
import { useState } from "react";
import RCalendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const MiniCalendar = () => {
    const [date, setDate] = useState(new Date());

    const onChange = (newDate) => {
        setDate(newDate);
    };

    const formatShortWeekday = (locale, date) => {
        return ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];
    };

    const formatDay = (locale, date) => {
        return date.getDate().toString();
    };

    return (
        <div className="calendar-component">
            <RCalendar
                onChange={onChange}
                value={date}
                formatShortWeekday={formatShortWeekday}
                formatDay={formatDay}
            />
        </div>
    );
};

export default MiniCalendar;
