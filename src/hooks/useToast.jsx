import React, { createContext, useContext, useRef, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [msg, setMsg] = useState('');
    const [show, setShow] = useState(false);
    const timerRef = useRef(null);

    const showToast = (message) => {
        setMsg(message);
        setShow(true);
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setShow(false), 3000);
    };

    return (
        <ToastContext.Provider value={showToast}>
            {children}
            <div
                id="toast"
                style={{
                    transform: show ? 'translateY(0)' : 'translateY(80px)',
                    opacity: show ? 1 : 0,
                }}
            >
                {msg}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    return useContext(ToastContext);
}
