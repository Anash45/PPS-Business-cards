import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { GlobalProvider, useGlobal } from "@/context/GlobalProvider";
import { useEffect, useMemo, useState } from "react";
import CustomDataTable from "@/Components/CustomDataTable";
import dayjs from "dayjs";
import "dayjs/locale/de";
import capitalize from "@/utils/capitalize";
import { Dropdown, DropdownItem } from "@/Components/DropdownUi";

dayjs.locale("de");

export default function BackgroundJobsIndex({ walletJobs, emailJobs }) {
    const { setHeaderTitle, setHeaderText } = useGlobal(GlobalProvider);
    const [activeTab, setActiveTab] = useState("wallet");

    useEffect(() => {
        setHeaderTitle("Background Jobs");
        setHeaderText("Track wallet sync and email sending jobs");
    }, []);

    // Auto-refresh data every 10 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                only: ["walletJobs", "emailJobs"],
            });
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const walletColumns = useMemo(
        () => [
            {
                key: "id",
                label: "ID",
                sortable: true,
            },
            {
                key: "status",
                label: "Status",
                sortable: true,
                render: (value) => {
                    let badgeClass =
                        "bg-gray-100 text-gray-700 border-gray-200";
                    if (value === "completed") {
                        badgeClass =
                            "bg-green-100 text-green-700 border-green-200";
                    } else if (value === "processing") {
                        badgeClass =
                            "bg-blue-100 text-blue-700 border-blue-200";
                    } else if (value === "failed") {
                        badgeClass = "bg-red-100 text-red-700 border-red-200";
                    } else if (value === "pending") {
                        badgeClass =
                            "bg-yellow-100 text-yellow-700 border-yellow-200";
                    }

                    return (
                        <span
                            className={`px-2 py-1 text-xs font-medium rounded-full border ${badgeClass}`}
                        >
                            {capitalize(value)}
                        </span>
                    );
                },
            },
            {
                key: "progress",
                label: "Progress",
                sortable: false,
                render: (value, row) => {
                    const total = row.total_items || 0;
                    const processed = row.processed_items || 0;
                    const percent =
                        total > 0 ? Math.round((processed / total) * 100) : 0;

                    return (
                        <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-blue-500 h-full transition-all"
                                    style={{ width: `${percent}%` }}
                                ></div>
                            </div>
                            <span className="text-xs font-medium">
                                {processed}/{total}
                            </span>
                        </div>
                    );
                },
            },
            {
                key: "last_processed_at",
                label: "Last Processed",
                sortable: true,
                render: (value) =>
                    value ? dayjs(value).format("DD.MM.YYYY HH:mm") : "—",
            },
            {
                key: "reason",
                label: "Reason",
                sortable: false,
                render: (value) => value || "—",
            },
            {
                key: "created_at",
                label: "Created",
                sortable: true,
                render: (value) => dayjs(value).format("DD.MM.YYYY HH:mm"),
            },
            {
                key: "actions",
                label: "Actions",
                sortable: false,
                render: (value, row) => {
                    const canCancel =
                        row.status === "pending" || row.status === "processing";

                    if (!canCancel) {
                        return <span className="text-gray-400 text-xs">—</span>;
                    }

                    return (
                        <Dropdown>
                            <DropdownItem
                                onClick={() => handleCancelWalletJob(row.id)}
                            >
                                Cancel
                            </DropdownItem>
                        </Dropdown>
                    );
                },
            },
        ],
        []
    );

    const emailColumns = useMemo(
        () => [
            {
                key: "id",
                label: "ID",
                sortable: true,
            },
            {
                key: "status",
                label: "Status",
                sortable: true,
                render: (value) => {
                    let badgeClass =
                        "bg-gray-100 text-gray-700 border-gray-200";
                    if (value === "completed") {
                        badgeClass =
                            "bg-green-100 text-green-700 border-green-200";
                    } else if (value === "processing") {
                        badgeClass =
                            "bg-blue-100 text-blue-700 border-blue-200";
                    } else if (value === "failed") {
                        badgeClass = "bg-red-100 text-red-700 border-red-200";
                    } else if (value === "pending") {
                        badgeClass =
                            "bg-yellow-100 text-yellow-700 border-yellow-200";
                    }

                    return (
                        <span
                            className={`px-2 py-1 text-xs font-medium rounded-full border ${badgeClass}`}
                        >
                            {capitalize(value)}
                        </span>
                    );
                },
            },
            {
                key: "progress",
                label: "Progress",
                sortable: false,
                render: (value, row) => {
                    const total = row.total_items || 0;
                    const processed = row.processed_items || 0;
                    const percent =
                        total > 0 ? Math.round((processed / total) * 100) : 0;

                    return (
                        <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-green-500 h-full transition-all"
                                    style={{ width: `${percent}%` }}
                                ></div>
                            </div>
                            <span className="text-xs font-medium">
                                {processed}/{total}
                            </span>
                        </div>
                    );
                },
            },
            {
                key: "last_processed_at",
                label: "Last Processed",
                sortable: true,
                render: (value) =>
                    value ? dayjs(value).format("DD.MM.YYYY HH:mm") : "—",
            },
            {
                key: "reason",
                label: "Reason",
                sortable: false,
                render: (value) => value || "—",
            },
            {
                key: "created_at",
                label: "Created",
                sortable: true,
                render: (value) => dayjs(value).format("DD.MM.YYYY HH:mm"),
            },
            {
                key: "actions",
                label: "Actions",
                sortable: false,
                render: (value, row) => {
                    const canCancel =
                        row.status === "pending" || row.status === "processing";

                    if (!canCancel) {
                        return <span className="text-gray-400 text-xs">—</span>;
                    }

                    return (
                        <Dropdown>
                            <DropdownItem
                                onClick={() => handleCancelEmailJob(row.id)}
                            >
                                Cancel
                            </DropdownItem>
                        </Dropdown>
                    );
                },
            },
        ],
        []
    );

    const handleCancelWalletJob = (jobId) => {
        if (!confirm("Are you sure you want to cancel this wallet sync job?")) {
            return;
        }

        router.post(
            route("background-jobs.wallet.cancel", jobId),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    router.reload({ only: ["walletJobs"] });
                },
            }
        );
    };

    const handleCancelEmailJob = (jobId) => {
        if (
            !confirm("Are you sure you want to cancel this email sending job?")
        ) {
            return;
        }

        router.post(
            route("background-jobs.email.cancel", jobId),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    router.reload({ only: ["emailJobs"] });
                },
            }
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Background Jobs" />
            <div className="py-4 md:px-6 px-4 flex flex-col gap-6">
                <div className="bg-white rounded-[14px] p-4 md:p-6">
                    {/* Tab Navigation */}
                    <div className="flex border-b border-gray-200 mb-6">
                        <button
                            onClick={() => setActiveTab("wallet")}
                            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                                activeTab === "wallet"
                                    ? "border-[#698F6D] text-[#698F6D]"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            Wallet Sync Jobs
                        </button>
                        <button
                            onClick={() => setActiveTab("email")}
                            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                                activeTab === "email"
                                    ? "border-[#698F6D] text-[#698F6D]"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            Email Sending Jobs
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div
                        className="overflow-auto"
                        style={{ maxHeight: "700px" }}
                    >
                        {activeTab === "wallet" && (
                            <CustomDataTable
                                columns={walletColumns}
                                data={walletJobs}
                                endpoint={route("background-jobs.index")}
                                tableKey="walletJobs"
                                searchable={true}
                                paginated={true}
                                perPageOptions={[10, 25, 50]}
                                size="sm"
                            />
                        )}
                        {activeTab === "email" && (
                            <CustomDataTable
                                columns={emailColumns}
                                data={emailJobs}
                                endpoint={route("background-jobs.index")}
                                tableKey="emailJobs"
                                searchable={true}
                                paginated={true}
                                perPageOptions={[10, 25, 50]}
                                size="sm"
                            />
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
