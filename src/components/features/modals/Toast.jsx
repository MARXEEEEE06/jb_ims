import React, { useEffect, useState } from "react";
import "./Toast.css";

function Toast({ message, duration = 3000, onDone }) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onDone, 300); // wait for fade out
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onDone]);

    return (
        <div className={`toast ${visible ? 'toast-show' : 'toast-hide'}`}>
            <span>{message}</span>
            <div
                className="toast-progress"
                style={{ animationDuration: `${duration}ms` }}
            />
        </div>
    );
}

export default Toast;