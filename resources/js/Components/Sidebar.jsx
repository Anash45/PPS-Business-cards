import React, { useState } from "react";
import ApplicationLogo from "./ApplicationLogo";
import SidebarMenu from "./SidebarMenu";
import { Link } from "@inertiajs/react";
import SidebarUserDrop from "./SidebarUserDrop";
import { Menu, X } from "lucide-react";

const Sidebar = () => {
    const [isMobileMenuOpened, setIsMobileMenuOpened] = useState(false);

    return (
        <aside className="lg:w-[260px] w-full bg-white border-r border-r-[#EAECF0]">
            {/* Mobile Header */}
            <div className="py-4 lg:pe-4 px-4 flex items-center gap-3 justify-between lg:hidden">
                <Link href={route("dashboard")}>
                    <ApplicationLogo className="md:h-[30.77px] h-6 w-auto" />
                </Link>
                <button
                    className="h-8 w-8 rounded-full bg-[#83af8221] flex items-center justify-center"
                    onClick={() => setIsMobileMenuOpened(true)}
                >
                    <Menu strokeWidth={2} className="text-black h-4 w-4" />
                </button>
            </div>

            {/* Sidebar Wrapper */}
            <div
                className={`h-full lg:static fixed top-0 left-0 z-50 w-full mobile-sidebar-wrapper transition-all duration-500 ${
                    isMobileMenuOpened
                        ? "translate-x-0"
                        : "lg:translate-x-0 -translate-x-full"
                }`}
                onClick={() => setIsMobileMenuOpened(false)}
            >
                <div
                    className="flex flex-col py-6 px-4 gap-[22px] h-full lg:w-full w-[290px] bg-white lg:shadow-none shadow-lg max-h-screen overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="pb-4 flex items-center gap-3 justify-between border-b border-b-[#EAECF0]">
                        <Link href={route("dashboard")}>
                            <ApplicationLogo className="md:h-[30px] h-6 w-auto" />
                        </Link>
                        <button
                            className="h-8 w-8 rounded-full bg-[#83af8221] flex items-center justify-center lg:hidden"
                            onClick={() => setIsMobileMenuOpened(false)}
                        >
                            <X strokeWidth={2} className="text-black h-4 w-4" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex grow flex-col justify-content-between">
                        <SidebarMenu />
                        <div className="flex flex-col gap-2 mt-auto">
                            <div className="py-1">
                                <div className="border-b border-b-[#E4E4E7]"></div>
                            </div>
                            <SidebarUserDrop />
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
