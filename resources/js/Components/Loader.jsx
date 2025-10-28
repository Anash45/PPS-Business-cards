// ./components/Loader.jsx
import React from "react";

export default function Loader({ show }) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-[9999]">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
}
