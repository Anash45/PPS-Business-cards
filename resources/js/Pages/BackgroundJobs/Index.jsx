import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { GlobalProvider, useGlobal } from "@/context/GlobalProvider";
import { useEffect, useMemo, useState } from "react";
import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";
import "datatables.net-dt/css/dataTables.dataTables.css";
import dayjs from "dayjs";
import "dayjs/locale/de";
import capitalize from "@/utils/capitalize";

// Bind DataTables
DataTable.use(DT);
dayjs.locale("de");

export default function BackgroundJobsIndex({ walletJobs, emailJobs }) {
    const { setHeaderTitle, setHeaderText } = useGlobal(GlobalProvider);
    const [activeTab, setActiveTab] = useState("wallet");
    const [tableKey, setTableKey] = useState(0);

    useEffect(() => {
        setHeaderTitle("Background Jobs");
        setHeaderText("Track wallet sync and email sending jobs");
    }, []);

    // Auto-refresh data every 10 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ 
                only: ['walletJobs', 'emailJobs'],
                onSuccess: () => {
                    // Force DataTable re-render by updating key
                    setTableKey(prev => prev + 1);
                }
            });
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const walletColumns = useMemo(
        () => [
            { title: "ID", data: "id" },
            {
                title: "Status",
                data: "status",
                render: (data) => {
                    let badgeClass =
                        "bg-gray-100 text-gray-700 border-gray-200";
                    if (data === "completed") {
                        badgeClass =
                            "bg-green-100 text-green-700 border-green-200";
                    } else if (data === "processing") {
                        badgeClass =
                            "bg-blue-100 text-blue-700 border-blue-200";
                    } else if (data === "failed") {
                        badgeClass = "bg-red-100 text-red-700 border-red-200";
                    } else if (data === "pending") {
                        badgeClass =
                            "bg-yellow-100 text-yellow-700 border-yellow-200";
                    }

                    return `<span class="px-2 py-1 text-xs font-medium rounded-full border ${badgeClass}">
                        ${capitalize(data)}
                    </span>`;
                },
            },
            {
                title: "Progress",
                data: null,
                render: (data, type, row) => {
                    const total = row.total_items || 0;
                    const processed = row.processed_items || 0;
                    const percent =
                        total > 0 ? Math.round((processed / total) * 100) : 0;

                    return `
                        <div class="flex items-center gap-2">
                            <div class="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div class="bg-blue-500 h-full" style="width: ${percent}%"></div>
                            </div>
                            <span class="text-xs font-medium">${processed}/${total}</span>
                        </div>
                    `;
                },
            },
            {
                title: "Last Processed",
                data: "last_processed_at",
                render: (data) => {
                    if (!data) return "—";
                    return dayjs(data).format("DD.MM.YYYY HH:mm");
                },
            },
            {
                title: "Reason",
                data: "reason",
                render: (data) => data || "—",
            },
            {
                title: "Created",
                data: "created_at",
                render: (data) => {
                    return dayjs(data).format("DD.MM.YYYY HH:mm");
                },
            },
        ],
        []
    );

    const emailColumns = useMemo(
        () => [
            { title: "ID", data: "id" },
            {
                title: "Status",
                data: "status",
                render: (data) => {
                    let badgeClass =
                        "bg-gray-100 text-gray-700 border-gray-200";
                    if (data === "completed") {
                        badgeClass =
                            "bg-green-100 text-green-700 border-green-200";
                    } else if (data === "processing") {
                        badgeClass =
                            "bg-blue-100 text-blue-700 border-blue-200";
                    } else if (data === "failed") {
                        badgeClass = "bg-red-100 text-red-700 border-red-200";
                    } else if (data === "pending") {
                        badgeClass =
                            "bg-yellow-100 text-yellow-700 border-yellow-200";
                    }

                    return `<span class="px-2 py-1 text-xs font-medium rounded-full border ${badgeClass}">
                        ${capitalize(data)}
                    </span>`;
                },
            },
            {
                title: "Progress",
                data: null,
                render: (data, type, row) => {
                    const total = row.total_items || 0;
                    const processed = row.processed_items || 0;
                    const percent =
                        total > 0 ? Math.round((processed / total) * 100) : 0;

                    return `
                        <div class="flex items-center gap-2">
                            <div class="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div class="bg-green-500 h-full" style="width: ${percent}%"></div>
                            </div>
                            <span class="text-xs font-medium">${processed}/${total}</span>
                        </div>
                    `;
                },
            },
            {
                title: "Last Processed",
                data: "last_processed_at",
                render: (data) => {
                    if (!data) return "—";
                    return dayjs(data).format("DD.MM.YYYY HH:mm");
                },
            },
            {
                title: "Reason",
                data: "reason",
                render: (data) => data || "—",
            },
            {
                title: "Created",
                data: "created_at",
                render: (data) => {
                    return dayjs(data).format("DD.MM.YYYY HH:mm");
                },
            },
        ],
        []
    );

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
                            <DataTable
                                key={`wallet-${tableKey}`}
                                data={walletJobs}
                                columns={walletColumns}
                                className="display site-datatable text-sm"
                                options={{
                                    pageLength: 25,
                                    order: [[0, "desc"]],
                                    responsive: true,
                                    scrollX: true,
                                    dom:
                                        "<'flex justify-between items-center mb-3 sd-top'<'flex items-center gap-2'l><'flex items-center gap-2'f>>" +
                                        "rt" +
                                        "<'flex justify-center mt-3 sd-bottom'p>",
                                }}
                            />
                        )}
                        {activeTab === "email" && (
                            <DataTable
                                key={`email-${tableKey}`}
                                data={emailJobs}
                                columns={emailColumns}
                                className="display site-datatable text-sm"
                                options={{
                                    pageLength: 25,
                                    order: [[0, "desc"]],
                                    responsive: true,
                                    scrollX: true,
                                    dom:
                                        "<'flex justify-between items-center mb-3 sd-top'<'flex items-center gap-2'l><'flex items-center gap-2'f>>" +
                                        "rt" +
                                        "<'flex justify-center mt-3 sd-bottom'p>",
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
