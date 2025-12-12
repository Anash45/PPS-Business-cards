import { Dropdown, DropdownItem } from "@/Components/DropdownUi";
import { useGlobal } from "@/context/GlobalProvider";
import { useModal } from "@/context/ModalProvider";
import { router } from "@inertiajs/react";
import { Edit, Trash2, VenetianMask, CreditCard, MoreVertical } from "lucide-react";
import { useMemo } from "react";
import toast from "react-hot-toast";
import CustomDataTable from "@/Components/CustomDataTable";

export default function UserTable({ users, plans, companies, authUser }) {
    const { openModal } = useModal();
    const { setIsPageLoading } = useGlobal();

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this user?")) return;

        try {
            const res = await axios.delete(route("users.destroy", id));

            if (res.data.success) {
                toast.success(res.data.message);
                router.reload({ only: ["users"] });
            } else {
                toast.error(res.data.message || "Failed to delete user.");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "An error occurred.");
        }
    };

    const handleImpersonate = async (userId) => {
        setIsPageLoading(true);
        try {
            const res = await axios.post(route("users.impersonate", userId));

            if (res.data.success) {
                toast.success(res.data.message);
                setTimeout(() => {
                    window.location.href = route(res.data.route);
                }, 1000);
                setIsPageLoading(false);
            } else {
                setIsPageLoading(false);
                toast.error(res.data.message || "Failed to impersonate");
            }
        } catch (err) {
            setIsPageLoading(false);
            toast.error(err.response?.data?.message || "An error occurred");
        }
    };

    const columns = useMemo(
        () => [
            {
                key: "id",
                label: "ID",
                sortable: true,
            },
            {
                key: "company",
                label: "Company",
                render: (value, row) => {
                    if (row.role === "admin") return "-";

                    return (
                        <div className="flex flex-col gap-1">
                            {row.company?.name && (
                                <p
                                    className="text-sm border-b border-b-gray-800 cursor-pointer inline-block w-fit"
                                    onClick={() =>
                                        authUser.role === "admin" &&
                                        openModal("ManageCompanyModal", {
                                            company: row.company,
                                        })
                                    }
                                >
                                    {row.company.name.charAt(0).toUpperCase() +
                                        row.company.name.slice(1)}
                                </p>
                            )}
                            {authUser.role === "admin" &&
                                row.role === "company" && (
                                    <span
                                        className={`text-xs font-semibold py-1 rounded-full ${
                                            row?.subscription?.is_active === true
                                                ? "text-green-700"
                                                : row?.subscription?.is_active ===
                                                  false
                                                ? "text-orange-500"
                                                : "text-red-700"
                                        }`}
                                    >
                                        {row?.subscription?.is_active
                                            ? "Active"
                                            : row?.subscription?.is_active ===
                                              false
                                            ? "Expired"
                                            : "No Subscribed"}
                                    </span>
                                )}
                        </div>
                    );
                },
            },
            {
                key: "name",
                label: "Name",
                sortable: true,
            },
            {
                key: "email",
                label: "Email",
                sortable: true,
            },
            {
                key: "role",
                label: "Role",
                sortable: true,
                render: (value, row) => (
                    <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                            row.role === "admin"
                                ? "bg-green-100 text-green-700"
                                : row.role === "company"
                                ? "bg-blue-100 text-blue-700"
                                : row.role === "template_editor"
                                ? "bg-orange-100 text-orange-700"
                                : row.role === "editor"
                                ? "bg-purple-100 text-purple-700"
                                : row.role === "team"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                        }`}
                    >
                        {row.role_name}
                    </span>
                ),
            },
            {
                key: "actions",
                label: "Actions",
                render: (value, row) => (
                    <Dropdown
                        trigger={
                            <button className="p-1 hover:bg-gray-100 rounded">
                                <MoreVertical className="h-4 w-4" />
                            </button>
                        }
                    >
                        <DropdownItem
                            onClick={() =>
                                openModal("ManageUserModal", {
                                    user: row,
                                    authUser: authUser,
                                    companies: companies,
                                })
                            }
                        >
                            <div className="flex items-center gap-2">
                                <Edit className="h-4 w-4" strokeWidth={2} />
                                <span>Edit</span>
                            </div>
                        </DropdownItem>
                        {row.role === "company" &&
                            authUser.role === "admin" && (
                                <DropdownItem
                                    onClick={() =>
                                        openModal("ManageSubscriptionModal", {
                                            user: row,
                                            plans: plans,
                                        })
                                    }
                                >
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="h-4 w-4" />
                                        <span>Subscription</span>
                                    </div>
                                </DropdownItem>
                            )}
                        {authUser.role === "admin" && (
                            <DropdownItem
                                onClick={() => handleImpersonate(row.id)}
                            >
                                <div className="flex items-center gap-2">
                                    <VenetianMask className="h-4 w-4" />
                                    <span>Impersonate</span>
                                </div>
                            </DropdownItem>
                        )}
                        <DropdownItem onClick={() => handleDelete(row.id)}>
                            <div className="flex items-center gap-2 text-red-500">
                                <Trash2 className="h-4 w-4" strokeWidth={2} />
                                <span>Delete</span>
                            </div>
                        </DropdownItem>
                    </Dropdown>
                ),
            },
        ],
        [authUser, companies, plans]
    );

    return (
        <CustomDataTable
            columns={columns}
            data={users}
            endpoint={route("users.index")}
            tableKey="users"
            searchable={true}
            paginated={true}
            perPageOptions={[10, 25, 50, 100]}
            emptyMessage="No users found."
        />
    );
}
