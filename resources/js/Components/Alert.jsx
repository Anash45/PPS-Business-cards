import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-700" />,
    danger: <XCircle className="w-5 h-5 text-red-700" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-700" />,
    info: <Info className="w-5 h-5 text-blue-700" />,
};

const baseClasses = "flex items-center justify-between gap-2 p-3 rounded-md border";

const typeClasses = {
    success: "bg-green-50 border-green-300 text-green-700",
    danger: "bg-red-50 border-red-300 text-red-700",
    warning: "bg-yellow-50 border-yellow-300 text-yellow-700",
    info: "bg-blue-50 border-blue-300 text-blue-700",
};

export default function Alert({ type = "info", message, dismissible = false }) {
    const [visible, setVisible] = useState(message !== "");

    // 👇 re-show when message changes
    useEffect(() => {
        if (message) setVisible(true);
    }, [message]);

    if (!visible || !message) return null;

    return (
        <div className={`${baseClasses} ${typeClasses[type] || typeClasses.info}`}>
            <div className="flex items-center gap-2">
                {icons[type] || icons.info}
                <span className="text-sm font-medium">{message}</span>
            </div>
            {dismissible && (
                <button onClick={() => setVisible(false)} className="ml-2">
                    <X className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                </button>
            )}
        </div>
    );
}