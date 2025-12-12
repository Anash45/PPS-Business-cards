import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, router } from "@inertiajs/react";
import { GlobalProvider, useGlobal } from "@/context/GlobalProvider";
import { useEffect, useMemo, useState } from "react";
import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";
import "datatables.net-dt/css/dataTables.dataTables.css";
import Button from "@/Components/Button";
import { createRoot } from "react-dom/client";
import { Dropdown, DropdownItem } from "@/Components/DropdownUi";
import toast from "react-hot-toast";
import axios from "axios";
import { getDomain } from "@/utils/viteConfig";
import { csvFieldDefinitions } from "@/utils/csvFieldDefinitions";
import WalletStatusPill from "@/Components/WalletStatusPill";
import WalletEligibilityPill from "@/Components/WalletEligibilityPill";
import { ChevronDown, EditIcon, Trash2 } from "lucide-react";
import { SyncingWarning } from "@/Components/SyncingWarning";
import CardSyncChecker from "@/Components/CardSyncChecker";
import WalletSyncingPill from "@/Components/WalletSyncingPill";
import {
    useWalletSyncMonitor,
    useEmailSendingMonitor,
} from "@/hooks/useJobMonitor";
import { set } from "date-fns";
import CustomDataTable from "@/Components/CustomDataTable";

// Bind DataTables
DataTable.use(DT);

export default function Company() {
    const { cards, isSubscriptionActive, hasRunningJob, hasRunningEmailJob } =
        usePage().props;
    const { setHeaderTitle, setHeaderText } = useGlobal(GlobalProvider);

    const [linkDomain, setLinkDomain] = useState(
        "https://app.ppsbusinesscards.de"
    );

    const [employees, setEmployees] = useState(cards);

    const handleDeleteEmployee = async (id) => {
        if (
            !window.confirm(
                "This will delete all card details and related data permanently. Are you sure?"
            )
        ) {
            return;
        }

        try {
            const response = await axios.put(`/company/cards/${id}/delete`);
            if (response.data.success) {
                toast.success(response.data.message);
                // Optional: refresh your table here
                router.reload({ only: ["cards"] });

                // ✅ Optional: refresh DataTable or state
                if (typeof refreshTable === "function") refreshTable();
            } else {
                toast.error(response.data.message || "Failed to delete card.");
            }
        } catch (error) {
            console.error(error);
            toast.error(
                error.response?.data?.message ||
                    "An error occurred while deleting the card."
            );
        }
    };

    const handleDeleteMultipleEmployees = async () => {
        if (!selectedIds || selectedIds.length === 0) {
            toast.error("Please select at least one employee.");
            return;
        }

        if (
            !window.confirm(
                `This will delete all details for ${selectedIds.length} employee(s) permanently. Are you sure?`
            )
        ) {
            return;
        }

        try {
            const response = await axios.put(`/company/cards/bulk-delete`, {
                ids: selectedIds,
            });

            if (response.data.success) {
                toast.success(response.data.message);
                router.reload({ only: ["cards"] });

                if (typeof refreshTable === "function") refreshTable();
            } else {
                toast.error(
                    response.data.message ||
                        "Failed to delete selected employees."
                );
            }
        } catch (error) {
            console.error(error);
            toast.error(
                error.response?.data?.message ||
                    "An error occurred while deleting selected employees."
            );
        }
    };

    // Fetch domain on mount
    useEffect(() => {
        (async () => {
            const domain = await getDomain();
            setLinkDomain(domain);
            console.log("Cards", employees);
        })();
    }, []);

    useEffect(() => {
        setHeaderTitle("Employees Management");
        setHeaderText("");
    }, []);

    const handleToggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === "active" ? "inactive" : "active";

        if (!confirm(`Are you sure you want to set this card as ${newStatus}?`))
            return;

        try {
            const response = await axios.put(`/cards/${id}/toggle-status`, {
                status: newStatus,
            });

            if (response.data?.success) {
                toast.success(
                    response.data.message || "Card status updated successfully."
                );

                // Reload only the cards prop via Inertia
                router.reload({ only: ["cards"] });

                // ✅ Optional: refresh DataTable or state
                if (typeof refreshTable === "function") refreshTable();
            } else {
                toast.error(
                    response.data?.message || "Failed to update card status."
                );
            }
        } catch (error) {
            // Handle Axios / backend errors
            if (error.response && error.response.data) {
                const data = error.response.data;

                if (data.message) {
                    toast.error(data.message);
                } else if (data.errors) {
                    Object.values(data.errors).forEach((err) => {
                        toast.error(err);
                    });
                } else {
                    toast.error("An unexpected error occurred.");
                }
            } else {
                toast.error("Network error or server is unreachable.");
            }
        }
    };

    const [isSyncing, setIsSyncing] = useState(false);
    const [isSyncingBg, setIsSyncingBg] = useState(hasRunningJob ?? false);
    const [isSendingEmails, setIsSendingEmails] = useState(
        hasRunningEmailJob ?? false
    );
    const [isAnyChecked, setIsAnyChecked] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);

    // Monitor wallet sync jobs
    useWalletSyncMonitor(isSyncingBg, (hasRunning) => {
        if (!hasRunning && isSyncingBg) {
            setIsSyncingBg(false);
            toast.success("Wallet sync completed!");
        }
    });

    // Monitor email sending jobs
    useEmailSendingMonitor(isSendingEmails, (hasRunning) => {
        if (!hasRunning && isSendingEmails) {
            setIsSendingEmails(false);
            toast.success("Email sending completed!");
        }
    });

    // Helper function for date formatting
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

    const handleSelectAll = (e) => {
        e.stopPropagation();
        const isChecked = e.target.checked;
        if (isChecked) {
            const allIds = cards.data.map((card) => card.id);
            setSelectedIds(allIds);
        } else {
            setSelectedIds([]);
        }
    };

    const handleRowCheckboxChange = (e, id) => {
        e.stopPropagation();
        setSelectedIds((prev) => {
            if (prev.includes(id)) {
                return prev.filter((selectedId) => selectedId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    useEffect(() => {
        setIsAnyChecked(selectedIds.length > 0);
    }, [selectedIds]);

    const columns = useMemo(
        () => [
            {
                key: "id",

                label: (
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={
                                selectedIds.length > 0 &&
                                selectedIds.length === cards.data?.length
                            }
                            onChange={handleSelectAll}
                            onClick={(e) => e.stopPropagation()}
                            className="rounded border-gray-300"
                        />
                        <span>ID</span>
                    </label>
                ),
                sortable: true,
                render: (id, row) => {
                    const isChecked = selectedIds.includes(row.id);
                    return (
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                className="row-checkbox rounded border-gray-300"
                                value={row.id}
                                checked={isChecked}
                                onChange={(e) => handleRowCheckboxChange(e, row.id)}
                            />
                            <span className="text-sm text-gray-700">{row.id}</span>
                        </label>
                    );
                },
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
                label: "Wallet Status",
                sortable: true,
                render: (walletStatus, row) => (
                    <div className="flex gap-1 items-center flex-wrap">
                        <WalletEligibilityPill
                            eligibility={row?.is_eligible_for_sync?.eligible}
                        />
                        {row.is_syncing && Number(row.is_syncing) === 1 ? (
                            <WalletSyncingPill />
                        ) : (
                            <WalletStatusPill
                                status={row?.wallet_status?.status}
                            />
                        )}
                    </div>
                ),
            },
            {
                key: "actions",
                label: "Actions",
                sortable: false,
                className: "text-right",
                headerClassName: "text-right",
                render: (_, row) => (
                    <Dropdown>
                        <DropdownItem
                            onClick={() =>
                                (window.location.href = `/company/cards/${row.id}/edit`)
                            }
                        >
                            <div className="flex items-center gap-1">
                                <EditIcon className="h-4 w-4" />{" "}
                                <span>Edit</span>
                            </div>
                        </DropdownItem>
                        <DropdownItem
                            onClick={() => handleDeleteEmployee(row.id)}
                        >
                            <div className="flex items-center gap-1">
                                <Trash2 className="h-4 w-4" />{" "}
                                <span>Delete</span>
                            </div>
                        </DropdownItem>
                        <DropdownItem
                            onClick={() =>
                                handleToggleStatus(row.id, row.status)
                            }
                        >
                            {row.status === "active"
                                ? "Set Inactive"
                                : "Set Active"}
                        </DropdownItem>
                    </Dropdown>
                ),
            },
        ],
        [linkDomain, selectedIds]
    );

    const [saving, setSaving] = useState(false);

    const handleDownload = async () => {
        if (!selectedIds.length) {
            toast.error("Please select at least one employee.");
            return;
        }

        setSaving(true);

        try {
            const response = await axios.post(
                "/cards/download",
                {
                    selected_ids: selectedIds,
                    csv_fields: csvFieldDefinitions.map((f) => f.name),
                },
                { responseType: "blob" } // Important: expect binary data
            );

            // ✅ Create a downloadable link
            const blob = new Blob([response.data], {
                type: "text/csv;charset=utf-8;",
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "base_sample.csv";
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("CSV download failed:", error);
        } finally {
            setSaving(false);
        }
    };

    const [toggling, setToggling] = useState(false);

    const handleMultipleToggle = async (status) => {
        if (!selectedIds.length) {
            toast.error("Please select at least one employee.");
            return;
        }

        setToggling(true);

        try {
            const response = await axios.post("/cards/toggle-multiple-status", {
                ids: selectedIds,
                status, // 'active' or 'inactive'
            });

            toast.success(response.data.message);
            router.reload({ only: ["cards"] });

            // ✅ Optional: refresh DataTable or state
            if (typeof refreshTable === "function") refreshTable();
        } catch (error) {
            console.error("Toggle failed:", error);
            const msg =
                error.response?.data?.message || "Failed to update status.";
            toast.error(msg);
        } finally {
            setToggling(false);
        }
    };

    const [backendErrors, setBackendErrors] = useState([]);


    const handleSendEmails = async () => {
        if (!selectedIds.length) {
            toast.error("Please select at least one employee.");
            return;
        }

        setIsSendingEmails(true);
        setBackendErrors([]);

        // Save previous state to restore in case of error
        let previousEmployeesState = [...employees.data];

        try {
            const response = await axios.post(
                "/company/cards/card-sending-emails",
                { ids: selectedIds }
            );

            console.log("Email sending response:", response.data);

            if (response.data?.success) {
                toast.success(
                    response.data.message || "Emails sending in background!"
                );
                setSelectedIds([]);
            } else {
                toast.error(
                    response.data.message ||
                        "Failed to schedule background email sending."
                );
                // revert to previous state
                setEmployees(previousEmployeesState);
                setIsSendingEmails(false);
            }
        } catch (error) {
            console.error("Background email sending schedule failed:", error);
            // restore previous state
            setIsSendingEmails(false);
            setSelectedIds([]);

            if (error.response?.status === 422 && error.response.data.errors) {
                setBackendErrors(error.response.data.errors);
            } else {
                toast.error(
                    error.response?.data?.message ||
                        "Failed to schedule background email sending."
                );
            }
        }
    };

    console.log("hasRunningJob: ", hasRunningJob);

    useEffect(() => {
        setIsSyncingBg(hasRunningJob);
    }, [hasRunningJob]);

    console.log("backendErrors: ", backendErrors);

    return (
        <AuthenticatedLayout>
            <Head title="Cards" />
            <CardSyncChecker
                isSyncingBg={isSyncingBg}
                setIsSyncingBg={setIsSyncingBg}
                employees={employees}
                setEmployees={setEmployees}
            />
            <div className="py-4 md:px-6 px-4 flex flex-col gap-6">
                {/* <SampleCsvDownload cards={cards} /> */}
                {!isSubscriptionActive ? (
                    <div className="p-4 bg-red-100 text-red-700 rounded-md">
                        You can only access this page with a valid subscription.
                        Contact Admin for more information.
                    </div>
                ) : (
                    <div className="space-y-5">
                        <div className="py-4 md:px-6 px-4 rounded-[14px] bg-white flex flex-col gap-3 space-y-3">
                            <div className="relative mb-2">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <Dropdown
                                        align="left"
                                        button={
                                            <div className="flex items-center py-[9px] gap-2 cursor-pointer px-4 rounded-md border border-gray-500 text-sm">
                                                <span>Bulk actions</span>
                                                <ChevronDown className="h-5 w-5" />
                                            </div>
                                        }
                                    >
                                        <DropdownItem
                                            onClick={() =>
                                                handleMultipleToggle("active")
                                            }
                                            disabled={
                                                !selectedIds.length || toggling
                                            }
                                        >
                                            Set Active
                                        </DropdownItem>

                                        <DropdownItem
                                            onClick={() =>
                                                handleMultipleToggle("inactive")
                                            }
                                            disabled={
                                                !selectedIds.length || toggling
                                            }
                                        >
                                            Set Inactive
                                        </DropdownItem>

                                        <DropdownItem
                                            onClick={() =>
                                                handleDeleteMultipleEmployees()
                                            }
                                            disabled={
                                                !selectedIds.length || toggling
                                            }
                                        >
                                            Delete Multiple
                                        </DropdownItem>

                                        <DropdownItem
                                            onClick={handleDownload}
                                            disabled={!isAnyChecked}
                                        >
                                            {saving
                                                ? "Saving..."
                                                : "Download Base CSV"}
                                        </DropdownItem>

                                        <DropdownItem
                                            onClick={handleSendEmails}
                                            closeOnClick={true}
                                            disabled={!isAnyChecked}
                                        >
                                            {isSendingEmails
                                                ? "Sending E-mails..."
                                                : "Send E-mails"}
                                        </DropdownItem>
                                    </Dropdown>
                                </div>
                                {selectedIds.length > 0 ? (
                                    <p className="text-sm text-primary top-full left-0 absolute mt-1">
                                        {selectedIds.length} card(s) selected
                                    </p>
                                ) : null}
                            </div>
                            {Object.keys(backendErrors).length > 0 && (
                                <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 mb-2">
                                    <p className="font-bold">
                                        Some cards could not be synced, fix the
                                        issues first then try again.
                                    </p>
                                    <ul className="mt-2 list-disc list-inside text-sm">
                                        {Object.entries(backendErrors).map(
                                            ([cardId, errs]) =>
                                                errs.map((err, i) => (
                                                    <li key={`${cardId}-${i}`}>
                                                        Card #{cardId}:{" "}
                                                        {err.message}
                                                    </li>
                                                ))
                                        )}
                                    </ul>
                                </div>
                            )}
                            <SyncingWarning isSyncing={isSyncing} />
                            <SyncingWarning
                                isSyncing={isSyncingBg}
                                syncType="background"
                            />
                            <SyncingWarning
                                isSyncing={isSendingEmails}
                                syncType="emailSending"
                            />

                            <CustomDataTable
                                columns={columns}
                                data={cards}
                                endpoint={route("company.cards")}
                                tableKey="cards"
                                searchable={true}
                                paginated={true}
                                perPageOptions={[10, 25, 50, 100]}
                                emptyMessage="No employees found."
                            />
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
