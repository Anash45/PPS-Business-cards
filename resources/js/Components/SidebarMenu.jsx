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
} from "lucide-react";
import React from "react";

// 🧩 Regular user menu
const companyMenuGroups = [
    {
        groupName: "Overview",
        items: [
            { name: "Overview", icon: LayoutDashboard, route: "dashboard" },
            { name: "Team", icon: Users2, route: "users.index" },
        ],
    },
    {
        groupName: "Design",
        items: [{ name: "Template", icon: Palette, route: "design.index" }],
    },
    {
        groupName: "Business Cards",
        items: [
            { name: "Cards", icon: IdCardIcon, route: "company.cards" },
            {
                name: "Bulk Import",
                icon: UploadCloud,
                route: "csv.index",
            },
        ],
    },
    {
        groupName: "System",
        items: [
            { name: "Setting", icon: SettingsIcon, route: "profile.edit" },
            { name: "API Documentation", icon: Book, route: "profile.edit" },
        ],
    },
];

// 🧩 Regular user menu
const editorMenuGroups = [
    {
        groupName: "Design",
        items: [{ name: "Template", icon: Palette, route: "design.index" }],
    },
];

// 🧩 Admin-only menu
const adminMenuGroups = [
    {
        groupName: "Admin Panel",
        items: [
            { name: "Overview", icon: LayoutDashboard, route: "dashboard" },
            { name: "Users", icon: Users2, route: "users.index" },
            { name: "Plans", icon: Crown, route: "plans.index" },
            { name: "Cards", icon: IdCardIcon, route: "cards.index" },
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

    // 👇 Choose menu based on user role
    const menuGroups =
        user?.role === "admin" ? adminMenuGroups : user?.role == "company" ? companyMenuGroups : user?.role == "editor" ? editorMenuGroups : null;

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
