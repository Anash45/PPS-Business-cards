import { Link, router } from "@inertiajs/react";
import { Edit, Trash2, Search, VenetianMask } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function UserTable({ users }) {
    const [search, setSearch] = useState("");

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

    // console.log(users.data);

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
                <div className="hidden sm:flex border-b border-gray-200 pb-2 px-4 text-sm font-semibold text-[#263238]">
                    <div className="pr-2 w-16">ID</div>
                    <div className="px-2 flex-1">Name</div>
                    <div className="px-2 flex-1">Email</div>
                    <div className="px-2 w-24">Role</div>
                    <div className="pl-2 w-60 text-right">Actions</div>
                </div>

                {/* 👥 Rows */}
                {users.data.length > 0 ? (
                    users.data.map((user) => (
                        <div
                            key={user.id}
                            className="border border-gray-300 rounded-lg py-3 px-4 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:bg-gray-50 transition"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:flex-1">
                                <div className="pr-2 sm:w-16">
                                    <span className="sm:hidden text-xs text-gray-500">
                                        ID:{" "}
                                    </span>
                                    <span className="text-sm text-gray-800">
                                        {user.id}
                                    </span>
                                </div>
                                <div className="px-2 sm:flex-1">
                                    <span className="sm:hidden text-xs text-gray-500">
                                        Name:{" "}
                                    </span>
                                    <span className="text-sm text-gray-800">
                                        {user.name}
                                    </span>
                                </div>
                                <div className="px-2 sm:flex-1">
                                    <span className="sm:hidden text-xs text-gray-500">
                                        Email:{" "}
                                    </span>
                                    <span className="text-sm text-gray-800">
                                        {user.email}
                                    </span>
                                </div>
                                <div className="pl-2 sm:w-24">
                                    <span className="sm:hidden text-xs text-gray-500">
                                        Role:{" "}
                                    </span>
                                    <span
                                        className={`text-xs font-medium px-2 py-1 rounded-full 
                                    ${
                                        user.role === "admin"
                                            ? "bg-green-100 text-green-700"
                                            : user.role === "company"
                                            ? "bg-blue-100 text-blue-700"
                                            : user.role === "team"
                                            ? "bg-yellow-100 text-yellow-700"
                                            : "bg-gray-100 text-gray-700"
                                    }`}
                                    >
                                        {user.role.charAt(0).toUpperCase() +
                                            user.role.slice(1)}
                                    </span>
                                    {user.role == "company" && (
                                        <p className="block text-sm">
                                            {user.company.name
                                                .charAt(0)
                                                .toUpperCase() +
                                                user.company.name.slice(1)}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-3 sm:mt-0 flex gap-3 justify-end sm:w-60">
                                <Link
                                    href={route("users.edit", user.id)}
                                    className="px-2 py-1.5 text-sm rounded-md border border-indigo-500 text-white bg-indigo-600 hover:bg-indigo-700 transition"
                                >
                                    <Edit className="h-4 w-4" strokeWidth={2} />
                                </Link>
                                <button
                                    onClick={() => handleDelete(user.id)}
                                    className="px-2 py-1.5 text-sm rounded-md border border-red-500 text-white bg-red-600 hover:bg-red-700 transition"
                                >
                                    <Trash2
                                        className="h-4 w-4"
                                        strokeWidth={2}
                                    />
                                </button>

                                <button
                                    onClick={() => handleImpersonate(user.id)}
                                    className="px-2 py-1.5 flex items-center text-sm rounded-md border border-green-500 text-white bg-green-600 hover:bg-green-700 transition"
                                >
                                    <VenetianMask className="h-5 mr-2" /> Impersonate
                                </button>
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
