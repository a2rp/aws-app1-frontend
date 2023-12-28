import { useEffect, useState } from "react";
import styles from "./styles.module.scss";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
        axios.defaults.baseURL = "http://127.0.0.1:1198/api/v1";
    } else {
        axios.defaults.baseURL = "http://3.111.215.242:1198/api/v1";
    }
    const [message, setMessage] = useState("message");
    const [dateTime, setDateTime] = useState(new Date().toISOString());

    const handleSetMessage = async () => {
        try {
            const config = {
                type: "GET",
                url: "/a2rp",
            };
            const response = await axios(config);
            console.log(response);
            const data = response.data;
            if (data.success === true) {
                setMessage(data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
            setMessage(error.message);
        }
    };
    useEffect(() => {
        handleSetMessage();
    }, []);

    const handleSetDateTime = () => {
        const value = new Date().toISOString();
        setDateTime(value);
    };
    useEffect(() => {
        const timeout = setTimeout(handleSetDateTime, 1000 * 1 / 30);
        return () => { clearTimeout(timeout); };
    }, [dateTime]);

    return (
        <div className={styles.container}>
            <div className={styles.messageFromAPI}>Message from backend &rArr; {message}</div>
            <div className={styles.dateTime}>Date time &rArr; {dateTime}</div>

            <ToastContainer />
        </div>
    );
}

export default App;
