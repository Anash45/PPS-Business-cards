import { Dropdown, DropdownItem } from "@/Components/DropdownUi";
import { useModal } from "@/context/ModalProvider";
import { Link, router } from "@inertiajs/react";
import { Edit, Trash2, Search, VenetianMask, CreditCard } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function UserTable({ users, plans, companies, authUser }) {
    const [search, setSearch] = useState("");
    const { openModal } = useModal();

    // 🔍 Debounced search
    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                route("users.index"),
                { search },
                { preserveState: true, replace: true }
            );
        }, 100);

        return () => clearTimeout(timeout);
    }, [search]);

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this user?")) return;

        try {
            const res = await axios.delete(route("users.destroy", id));

            if (res.data.success) {
                toast.success(res.data.message);
                router.reload(); // refresh the page
            } else {
                toast.error(res.data.message || "Failed to delete user.");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "An error occurred.");
        }
    };

    const handleImpersonate = async (userId) => {
        if (confirm("Are you sure you want to impersonate this user?")) {
            try {
                const res = await axios.post(
                    route("users.impersonate", userId)
                );

                if (res.data.success) {
                    toast.success(res.data.message);
                    // Optionally redirect to dashboard as impersonated user
                    setTimeout(() => {
                        window.location.href = route("dashboard");
                    }, 1000);
                } else {
                    toast.error(res.data.message || "Failed to impersonate");
                }
            } catch (err) {
                toast.error(err.response?.data?.message || "An error occurred");
            }
        }
    };

    console.log(authUser);

    return (
        <div className="py-6 px-4 rounded-[14px] main-box bg-white flex flex-col gap-6 overflow-x-auto">
            {/* 🔍 Search Bar */}
            <div className="flex items-center gap-3">
                <div className="relative w-full sm:w-1/3">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search users..."
                        className="w-full border border-gray-300 rounded-md py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                </div>
            </div>

            <div className="space-y-3">
                {/* 🧾 Header (hidden on mobile) */}
                <div className="hidden xl:flex border-b border-gray-200 pb-2 px-4 text-sm font-semibold text-[#263238]">
                    <div className="xl:pr-2 px-2 w-[5%]">ID</div>
                    <div className="px-2 w-[30%]">Name</div>
                    <div className="px-2 w-[30%]">Email</div>
                    <div className="px-2 w-[30%]">Role</div>
                    <div className="pl-2 w-[5%] text-right">Actions</div>
                </div>

                {/* 👥 Rows */}
                {users.data.length > 0 ? (
                    users.data.map((user) => (
                        <div
                            key={user.id}
                            className="border border-gray-300 rounded-lg py-3 px-4 flex flex-col xl:flex-row xl:items-center xl:justify-between hover:bg-gray-50 transition"
                        >
                            <div className="xl:pr-2 px-2 xl:w-[5%]">
                                <span className="xl:hidden text-xs text-gray-500">
                                    ID:{" "}
                                </span>
                                <span className="text-sm text-gray-800">
                                    {user.id}
                                </span>
                            </div>
                            <div className="px-2 xl:w-[30%]">
                                <span className="xl:hidden text-xs text-gray-500">
                                    Name:{" "}
                                </span>
                                <span className="text-sm text-gray-800">
                                    {user.name}
                                </span>
                            </div>
                            <div className="px-2 xl:w-[30%]">
                                <span className="xl:hidden text-xs text-gray-500">
                                    Email:{" "}
                                </span>
                                <span className="text-sm text-gray-800">
                                    {user.email}
                                </span>
                            </div>
                            <div className="pl-2 xl:w-[30%]">
                                <span className="xl:hidden text-xs text-gray-500">
                                    Role:{" "}
                                </span>
                                <span
                                    className={`text-xs font-medium px-2 py-1 rounded-full 
                                    ${
                                        user.role === "admin"
                                            ? "bg-green-100 text-green-700"
                                            : user.role === "company"
                                            ? "bg-blue-100 text-blue-700"
                                            : user.role === "editor"
                                            ? "bg-purple-100 text-purple-700"
                                            : user.role === "team"
                                            ? "bg-yellow-100 text-yellow-700"
                                            : "bg-gray-100 text-gray-700"
                                    }`}
                                >
                                    {user.role.charAt(0).toUpperCase() +
                                        user.role.slice(1)}
                                </span>
                                {user.role !== "admin" && (
                                    <div className="flex gap-1 items-center flex-wrap mt-1">
                                        <p className="text-sm">
                                            {user.company.name
                                                .charAt(0)
                                                .toUpperCase() +
                                                user.company.name.slice(1)}
                                        </p>

                                        {authUser.role === "admin" && user.role == "company" ? (
                                            <span
                                                className={`text-xs font-semibold px-2 py-1 rounded-full 
                                    ${
                                        user?.subscription?.is_active == true
                                            ? "text-green-700"
                                            : user?.subscription?.is_active ==
                                              false
                                            ? "text-orange-500"
                                            : "text-red-700"
                                    }`}
                                            >
                                                {user?.subscription?.is_active
                                                    ? "Active"
                                                    : user?.subscription
                                                          ?.is_active === false
                                                    ? "Expired"
                                                    : "No Subscribed"}
                                            </span>
                                        ) : null}
                                    </div>
                                )}
                            </div>

                            <div className="mt-3 sm:mt-0 flex gap-3 justify-end sm:w-[5%] flex-wrap">
                                <Dropdown>
                                    <DropdownItem
                                        onClick={() =>
                                            openModal("ManageUserModal", {
                                                user: user,
                                                authUser: authUser,
                                                companies: companies,
                                            })
                                        }
                                    >
                                        <div className="flex items-center gap-2">
                                            <Edit
                                                className="h-4 w-4"
                                                strokeWidth={2}
                                            />
                                            <span>Edit</span>
                                        </div>
                                    </DropdownItem>
                                    {user.role == "company" ? (
                                        <DropdownItem
                                            onClick={() =>
                                                openModal(
                                                    "ManageSubscriptionModal",
                                                    {
                                                        user: user,
                                                        plans: plans,
                                                    }
                                                )
                                            }
                                        >
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="h-4 w-4" />{" "}
                                                <span>Subscription</span>
                                            </div>
                                        </DropdownItem>
                                    ) : null}
                                    {authUser.role == "admin" ? (
                                        <DropdownItem
                                            onClick={() =>
                                                handleImpersonate(user.id)
                                            }
                                        >
                                            <div className="flex items-center gap-2">
                                                <VenetianMask className="h-4 w-4" />{" "}
                                                <span>Impersonate</span>
                                            </div>
                                        </DropdownItem>
                                    ) : null}
                                    <DropdownItem
                                        onClick={() => handleDelete(user.id)}
                                    >
                                        <div className="flex items-center gap-2 text-red-500">
                                            <Trash2
                                                className="h-4 w-4"
                                                strokeWidth={2}
                                            />
                                            <span>Delete</span>
                                        </div>
                                    </DropdownItem>
                                </Dropdown>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500 py-4">
                        No users found.
                    </p>
                )}
            </div>

            {/* 📄 Pagination */}
            <div className="p-4 flex flex-wrap gap-2 justify-center">
                {users.links.map((link, index) => (
                    <Link
                        key={index}
                        href={link.url || "#"}
                        className={`px-3 py-1 text-sm rounded ${
                            link.active
                                ? "bg-primary hover:bg-[#60ae68] text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        } ${!link.url ? "opacity-50 cursor-not-allowed" : ""}`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ))}
            </div>
        </div>
    );
}
