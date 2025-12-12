import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, router } from "@inertiajs/react";
import { GlobalProvider, useGlobal } from "@/context/GlobalProvider";
import { useEffect, useState } from "react";
import { EditIcon, Trash2, Mail, Eye } from "lucide-react";
import { getDomain } from "@/utils/viteConfig";
import WalletStatusPill from "@/Components/WalletStatusPill";
import WalletEligibilityPill from "@/Components/WalletEligibilityPill";
import { SyncingWarning } from "@/Components/SyncingWarning";
import CardSyncChecker from "@/Components/CardSyncChecker";
import {
    useWalletSyncMonitor,
    useEmailSendingMonitor,
} from "@/hooks/useJobMonitor";
import CustomDataTable from "@/Components/CustomDataTable";

export default function Company() {
    const { cards, isSubscriptionActive, hasRunningJob, hasRunningEmailJob } =
        usePage().props;
    const { setHeaderTitle, setHeaderText } = useGlobal(GlobalProvider);

    const [linkDomain, setLinkDomain] = useState(
        "https://app.ppsbusinesscards.de"
    );

    // Monitor running jobs
    useWalletSyncMonitor(hasRunningJob);
    useEmailSendingMonitor(hasRunningEmailJob);

    // Fetch domain on mount
    useEffect(() => {
        (async () => {
            const domain = await getDomain();
            setLinkDomain(domain);
        })();
    }, []);

    useEffect(() => {
        setHeaderTitle("Employees Management");
        setHeaderText("");
    }, []);

    // Helper functions for date formatting
    const formatDateTime = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
        const dateStr = `${pad(date.getDate())}.${pad(
            date.getMonth() + 1
        )}.${date.getFullYear()}`;
        let hours = date.getHours();
        const minutes = pad(date.getMinutes());
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        if (hours === 0) hours = 12;
        const timeStr = `${hours}:${minutes} ${ampm}`;
        return { dateStr, timeStr };
    };

    const renderWalletStatus = (row) => {
        const container = document.createElement("div");

        setTimeout(() => {
            const root = createRoot(container);
            root.render(
                <div className="flex gap-1 items-center flex-wrap">
                    <WalletEligibilityPill
                        eligibility={row?.is_eligible_for_sync?.eligible}
                    />

                    {row.is_syncing && Number(row.is_syncing) === 1 ? (
                        <WalletSyncingPill /> // show spinner when syncing
                    ) : (
                        <WalletStatusPill status={row?.wallet_status?.status} /> // show regular status
                    )}
                </div>
            );
        }, 0);

        return container;
    };

    // Column definitions for CustomDataTable
    const columns = [
        {
            key: "id",
            label: "ID",
            sortable: true,
            render: (id) => <span className="font-medium">#{id}</span>,
        },
        {
            key: "code",
            label: "Code",
            sortable: true,
            render: (code) => (
                <a
                    href={`${linkDomain}/card/${code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#50bd5b] underline hover:text-[#3da147]"
                >
                    {code}
                </a>
            ),
        },
        {
            key: "first_name",
            label: "User",
            sortable: true,
            render: (firstName, row) => {
                const nameParts = [
                    row.salutation,
                    row.title,
                    row.first_name,
                    row.last_name,
                ].filter(Boolean);
                const fullName = nameParts.join(" ") || "Not assigned";

                return (
                    <div className="flex items-center gap-2">
                        <img
                            src={
                                row.profile_image
                                    ? `/storage/${row.profile_image}`
                                    : "/assets/images/profile-placeholder.png"
                            }
                            alt="Profile"
                            className="rounded-full border-2 bg-white border-white w-8 h-8 object-cover shrink-0"
                        />
                        <div className="space-y-0.5">
                            <p className="font-medium text-[#181D27] text-sm">
                                {fullName}
                            </p>
                            {row.primary_email && (
                                <p className="text-xs text-gray-600">
                                    {row.primary_email}
                                </p>
                            )}
                        </div>
                    </div>
                );
            },
        },
        {
            key: "position",
            label: "Position",
            sortable: true,
            render: (position) =>
                position || <span className="text-gray-400">—</span>,
        },
        {
            key: "department",
            label: "Department",
            sortable: true,
            render: (department) =>
                department || <span className="text-gray-400">—</span>,
        },
        {
            key: "last_email_sent",
            label: "Notified",
            sortable: true,
            render: (lastEmailSent) => {
                console.log("Last Email Sent:", lastEmailSent);
                const datetime = formatDateTime(lastEmailSent);

                if (datetime) {
                    return (
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 border border-green-200">
                                Sent
                            </span>
                            <div className="flex flex-col leading-tight text-xs">
                                <span>{datetime.dateStr}</span>
                                <span className="text-gray-500">
                                    {datetime.timeStr}
                                </span>
                            </div>
                        </div>
                    );
                }

                return (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 border border-red-200">
                        Never
                    </span>
                );
            },
        },
        {
            key: "status",
            label: "Status",
            sortable: true,
            render: (status) => {
                const isActive = status === "active";
                return (
                    <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                            isActive
                                ? "bg-green-100 text-green-700 border border-green-200"
                                : "bg-red-100 text-red-700 border border-red-200"
                        }`}
                    >
                        {isActive ? "Active" : "Inactive"}
                    </span>
                );
            },
        },
        {
            key: "wallet_status",
            label: "Wallet",
            sortable: true,
            render: (_,row) => (
                console.log(row),
                <div className="flex gap-1 items-center flex-wrap">
                    <WalletEligibilityPill
                        eligibility={row?.is_eligible_for_sync?.eligible}
                    />

                    {row.is_syncing && Number(row.is_syncing) === 1 ? (
                        <WalletSyncingPill /> // show spinner when syncing
                    ) : (
                        <WalletStatusPill status={row?.wallet_status?.status} /> // show regular status
                    )}
                </div>
            ),
        },
        {
            key: "wallet_eligibility",
            label: "Eligibility",
            sortable: true,
            render: (eligibility) => (
                <WalletEligibilityPill status={eligibility} />
            ),
        },
        {
            key: "actions",
            label: "Actions",
            sortable: false,
            className: "text-right",
            headerClassName: "text-right",
            render: (_, row) => (
                <div className="flex items-center justify-end gap-1">
                    <button
                        onClick={() => handleView(row)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="View Card"
                    >
                        <Eye className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => handleEdit(row)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                        title="Edit Card"
                    >
                        <EditIcon className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => handleSendEmail(row)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                        title="Send Email"
                    >
                        <Mail className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => handleDelete(row)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete Card"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            ),
        },
    ];

    // Action handlers
    const handleView = (card) => {
        window.open(`${linkDomain}/card/${card.code}`, "_blank");
    };

    const handleEdit = (card) => {
        router.visit(route("cards.edit", card.id));
    };

    const handleSendEmail = (card) => {
        // Implement email sending logic
        console.log("Send email to:", card);
    };

    const handleDelete = (card) => {
        if (
            confirm(
                `Are you sure you want to delete the card for ${card.first_name} ${card.last_name}?`
            )
        ) {
            router.delete(route("cards.destroy", card.id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Employee Cards" />
            <div className="py-4 md:px-6 px-4 flex flex-col gap-6">
                {/* Syncing Warning */}
                {(hasRunningJob || hasRunningEmailJob) && (
                    <SyncingWarning
                        hasWalletSync={hasRunningJob}
                        hasEmailSync={hasRunningEmailJob}
                    />
                )}

                {!isSubscriptionActive ? (
                    <div className="p-4 bg-red-100 text-red-700 rounded-md">
                        You can only access this page with a valid subscription.
                        Contact Admin for more information.
                    </div>
                ) : (
                    <div className="space-y-5">
                        <div className="py-4 md:px-6 px-4 rounded-[14px] bg-white flex flex-col gap-3">
                            <div className="mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Employee Cards
                                </h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    Manage your company's employee business
                                    cards
                                </p>
                            </div>

                            <CustomDataTable
                                columns={columns}
                                data={cards}
                                endpoint={route("company.cards1")}
                                tableKey="cards"
                                searchable={true}
                                paginated={true}
                                perPageOptions={[10, 25, 50, 100]}
                                emptyMessage="No employee cards found. Create your first card to get started."
                            />
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
