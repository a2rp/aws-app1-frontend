import { useCallback, useEffect, useState } from "react";
import styles from "./styles.module.scss";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "http://127.0.0.1:1198/api/v1" : "http://3.111.215.242:1198/api/v1");
const api = axios.create({ baseURL: apiBaseUrl, timeout: 10000 });

function App() {
    const [message, setMessage] = useState("Connecting to the backend...");
    const [status, setStatus] = useState("loading");
    const [dateTime, setDateTime] = useState(() => new Date());

    const fetchMessage = useCallback(async () => {
        setStatus("loading");
        try {
            const { data } = await api.get("/a2rp");
            if (!data?.success) throw new Error(data?.message || "Backend returned an unsuccessful response.");
            setMessage(data.message || "Backend is online."); setStatus("online");
        } catch (error) {
            const errorMessage = axios.isAxiosError(error) ? (error.code === "ECONNABORTED" ? "The backend request timed out." : "Unable to reach the backend.") : error.message;
            setMessage(errorMessage); setStatus("offline"); toast.error(errorMessage);
        }
    }, []);
    useEffect(() => { fetchMessage(); }, [fetchMessage]);

    const handleSetDateTime = () => {
        setDateTime(new Date());
    };
    useEffect(() => {
        const interval = setInterval(handleSetDateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    const formattedDateTime = dateTime.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "medium" });
    const statusLabel = status === "loading" ? "Checking service" : status === "online" ? "Service online" : "Service unavailable";

    return (
        <main className={styles.page}><section className={styles.card} aria-labelledby="app-title">
            <div className={styles.eyebrow}>AWS APP | SYSTEM STATUS</div><h1 id="app-title">Backend connection monitor</h1>
            <p className={styles.subtitle}>A quick, live view of your application service.</p>
            <div className={`${styles.status} ${styles[status]}`} role="status" aria-live="polite"><span className={styles.statusDot} aria-hidden="true" />{statusLabel}</div>
            <div className={styles.panel}><span className={styles.label}>Message from backend</span><p>{message}</p></div>
            <div className={styles.meta}><div><span className={styles.label}>Local time</span><strong>{formattedDateTime}</strong></div><button className={styles.button} type="button" onClick={fetchMessage} disabled={status === "loading"}>{status === "loading" ? "Checking..." : "Check again"}</button></div>
        </section><footer className={styles.footer}>
            <span>Copyright &copy; {new Date().getFullYear()} </span>
            <a href="https://www.ashishranjan.net" target="_blank" rel="noopener noreferrer">Ashish Ranjan</a>
            <nav aria-label="Footer links">
                <a href="https://github.com/a2rp" target="_blank" rel="noopener noreferrer">GitHub</a>
                <a href="mailto:ash.ranjan09@gmail.com">Email</a>
                <a href="https://a2rp-donation-page.netlify.app/" target="_blank" rel="noopener noreferrer">Support</a>
                <a href="https://buymeacoffee.com/a2rp" target="_blank" rel="noopener noreferrer">Buy Me A Coffee</a>
                <a href="https://patreon.com/a2rp" target="_blank" rel="noopener noreferrer">Patreon</a>
            </nav>
        </footer><ToastContainer position="bottom-right" autoClose={5000} theme="dark" /></main>
    );
}

export default App;
