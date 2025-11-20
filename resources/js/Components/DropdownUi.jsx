"use client";
import React, { useState, useRef, useEffect, cloneElement } from "react";
import { EllipsisVertical } from "lucide-react";

export function Dropdown({
    label = "Actions",
    children,
    button, // JSX element
    position = "down", // vertical: "down" | "up"
    align = "right", // horizontal: "right" | "left" | "center"
    className = "",
}) {
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
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const verticalClasses =
        position === "up" ? "bottom-full mb-2" : "top-full mt-2";
    const horizontalClasses =
        align === "left"
            ? "left-0"
            : align === "center"
            ? "left-1/2 -translate-x-1/2"
            : "right-0";

    // Clone children to inject a function to close dropdown
    const childrenWithCloseControl = React.Children.map(children, (child) => {
        if (!child) return null;
        return cloneElement(child, {
            closeDropdown: () => setOpen(false), // inject function
        });
    });

    return (
        <div
            className={`relative inline-block text-left ${className}`}
            ref={ref}
        >
            {button ? (
                <div onClick={() => setOpen((prev) => !prev)}>{button}</div>
            ) : (
                <button
                    type="button"
                    onClick={() => setOpen((prev) => !prev)}
                    className="inline-flex justify-center w-full rounded-md px-3 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    <EllipsisVertical className="h-5 w-5" />
                </button>
            )}

            {open && (
                <div
                    className={`absolute ${horizontalClasses} ${verticalClasses} w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10`}
                >
                    <div className="py-1">{childrenWithCloseControl}</div>
                </div>
            )}
        </div>
    );
}

export function DropdownItem({
    children,
    onClick,
    disabled = false,
    closeOnClick = false,
    closeDropdown,
}) {
    const handleClick = () => {
        if (!disabled) {
            onClick?.();
            if (closeOnClick) closeDropdown?.();
        }
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={disabled}
            className={`w-full dropdown-item text-left px-4 py-2 text-sm text-gray-700 hover:bg-primary/20 border-b border-b-gray-200 ${
                disabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
        >
            {children}
        </button>
    );
}
