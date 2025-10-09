"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronUp, LogOut, LucideChevronsUpDown, User } from "lucide-react";
import { router, usePage } from "@inertiajs/react";

const SidebarUserDrop = () => {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef(null);
    const user = usePage().props.auth.user;

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={wrapperRef} className="drop-wrapper relative">
            {/* Trigger */}
            <div
                onClick={() => setOpen(!open)}
                className={`px-3 py-2 rounded-xl flex items-center gap-3 justify-between cursor-pointer border transition-all duration-300 ${
                    open ? "border-[#6366F1]" : "border-[#EAECF0]"
                }`}
            >
                <div className="flex items-center gap-3 font-inter">
                    <img
                        src={
                            user.profile_image
                                ? `/storage/${user.profile_image}`
                                : "/assets/images/user-placeholder.svg"
                        }
                        alt="User Avatar"
                        className="h-11 w-11 rounded-full object-cover object-center"
                    />
                    <div className="flex flex-col gap-0 font-public-sans">
                        <span className="text-sm text-[#000000] font-semibold">
                            {user.name}
                        </span>
                        <span className="text-xs leading-[18px] text-[#667085] font-medium break-all">
                            {user.email}
                        </span>
                    </div>
                </div>
                <LucideChevronsUpDown
                    className={`text-[#71717A] h-[22px] w-[22px] transition-transform duration-300 ${
                        open ? "rotate-180" : ""
                    }`}
                    strokeWidth={2}
                />
            </div>

            {/* Dropup Menu */}
            <div
                className={`absolute user-dropup p-2 bottom-full left-0 right-0 bg-white border border-[#EAECF0] rounded-lg overflow-hidden transition-all duration-300 ${
                    open
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-2 pointer-events-none"
                }`}
            >
                <ul className="flex flex-col px-2">
                    <li>
                        <a
                            href={route("profile.edit")}
                            className="flex items-center gap-3 p-2 text-[#09090B] font-medium rounded-md text-sm hover:bg-gray-100"
                        >
                            <User
                                className="h-4 w-4 text-[#1E293B]"
                                strokeWidth={2}
                            />
                            <span>My Profile</span>
                        </a>
                    </li>

                    <div className="py-1 px-2">
                        <div className="border-b border-b-[#E4E4E7]"></div>
                    </div>

                    <li>
                        <button
                            onClick={() => router.post(route("logout"))}
                            className="flex items-center gap-3 p-2 text-[#09090B] font-medium rounded-md text-sm hover:bg-gray-100 w-full text-left"
                        >
                            <LogOut
                                className="h-4 w-4 text-[#1E293B]"
                                strokeWidth={2}
                            />
                            <span>Sign Out</span>
                        </button>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default SidebarUserDrop;
