"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, EllipsisVertical } from "lucide-react";

export function Dropdown({ label = "Actions", children }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative inline-block text-left" ref={ref}>
            <button
                onClick={() => setOpen((prev) => !prev)}
                className="inline-flex justify-center w-full rounded-md px-3 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
                <EllipsisVertical className="h-5 w-5" />
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1">{children}</div>
                </div>
            )}
        </div>
    );
}

export function DropdownItem({ children, onClick }) {
    return (
        <button
            onClick={onClick}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-primary/20"
        >
            {children}
        </button>
    );
}
