"use client";
import { Link, usePage } from "@inertiajs/react";
import {
    Book,
    HomeIcon,
    IdCardIcon,
    Palette,
    SettingsIcon,
    UploadCloud,
    Users2,
    LayoutDashboard,
    Crown,
    ScanQrCodeIcon,
    ListTodo,
} from "lucide-react";
import React from "react";

// 🧩 Menu items with role-based access control
const allMenuItems = [
    {
        groupName: "Overview",
        roles: ["admin", "company"],
        items: [
            { name: "Overview", icon: LayoutDashboard, route: "dashboard", roles: ["admin", "company"] },
            { name: "Team", icon: Users2, route: "users.index", roles: ["company", "template_editor"] },
        ],
    },
    {
        groupName: "Design",
        roles: ["company", "template_editor"],
        items: [
            { name: "Template", icon: Palette, route: "design.index", roles: ["company", "template_editor"] },
        ],
    },
    {
        groupName: "Business Cards",
        roles: ["company", "editor", "template_editor"],
        items: [
            { name: "NFC-Cards", icon: ScanQrCodeIcon, route: "company.nfc_cards", roles: ["company", "editor", "template_editor"] },
            { name: "Employees", icon: IdCardIcon, route: "company.cards", roles: ["company", "editor", "template_editor"] },
            { name: "Bulk Import", icon: UploadCloud, route: "csv.index", roles: ["company", "editor", "template_editor"] },
            { name: "Background Jobs", icon: ListTodo, route: "background-jobs.index", roles: ["company", "editor", "template_editor"] },
        ],
    },
    {
        groupName: "System",
        roles: ["company"],
        items: [
            { name: "Setting", icon: SettingsIcon, route: "settings.index", roles: ["company"] },
            { name: "API Documentation", icon: Book, route: "api.documentation", roles: ["company"] },
        ],
    },
    {
        groupName: "Admin Panel",
        roles: ["admin"],
        items: [
            { name: "Users", icon: Users2, route: "users.index", roles: ["admin"] },
            { name: "Plans", icon: Crown, route: "plans.index", roles: ["admin"] },
            { name: "Cards", icon: IdCardIcon, route: "cards.index", roles: ["admin"] },
        ],
    },
];

const SidebarMenu = () => {
    const { props, url } = usePage();
    const user = props.auth?.user;

    const currentUrl = url || window.location.pathname;

    const isActive = (routeName) => {
        try {
            const routeUrl = new URL(route(routeName)).pathname;
            const currentPath = window.location.pathname;

            // Normalize slashes (avoid issues with trailing slashes)
            const normalize = (path) => path.replace(/\/+$/, "");

            const base = normalize(routeUrl);
            const current = normalize(currentPath);

            // Match if current path equals base OR starts with base + '/'
            return current === base || current.startsWith(base + "/");
        } catch (error) {
            console.error("Error in isActive:", error);
            return false;
        }
    };

    // 👇 Filter menu based on user role
    const menuGroups = allMenuItems
        .filter(group => group.roles.includes(user?.role))
        .map(group => ({
            ...group,
            items: group.items.filter(item => item.roles.includes(user?.role))
        }))
        .filter(group => group.items.length > 0);

    return (
        <ul className="flex flex-col gap-3.5 pb-4 overflow-y-auto">
            {menuGroups.map((group, gIndex) => (
                <div key={gIndex} className="space-y-3">
                    <p className="text-[#6B7280] text-xs font-medium">
                        {group.groupName}
                    </p>
                    {group.items.map((item, iIndex) => {
                        const Icon = item.icon;
                        const active = isActive(item.route);
                        return (
                            <li key={iIndex}>
                                <Link
                                    href={route(item.route)}
                                    className={`p-3 flex items-center gap-2 text-sm relative font-medium rounded-lg ${
                                        active
                                            ? "bg-[#F4FAF5] text-[#698F6D] active-nav-link"
                                            : "bg-transparent text-[#667085]"
                                    }`}
                                >
                                    <Icon strokeWidth={2} className="h-5 w-5" />
                                    <span>{item.name}</span>
                                </Link>
                            </li>
                        );
                    })}
                </div>
            ))}
        </ul>
    );
};

export default SidebarMenu;
