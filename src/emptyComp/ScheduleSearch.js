const ScheduleSearch = () => {
    return (
        <div style={{ display: "flex", height: "100%" }}>
            <div
                style={{
                    backgroundColor: "white",
                    borderRadius: "16px",
                    width: "17%",
                    height: "100%",
                }}
            >
                왼쪽판넬
            </div>

            <div
                style={{
                    backgroundColor: "white",
                    borderRadius: "16px",
                    width: "83%",
                    height: "100%",
                    marginLeft: "2%",
                }}
            >
                우측판넬
            </div>
        </div>
    );
};

export default ScheduleSearch;
