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

// Bind DataTables
DataTable.use(DT);

export default function Company() {
    const { cards, isSubscriptionActive } = usePage().props;
    const { setHeaderTitle, setHeaderText } = useGlobal(GlobalProvider);

    const [linkDomain, setLinkDomain] = useState(
        "https://app.ppsbusinesscards.de"
    );

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
            console.log("Cards", cards);
        })();
    }, []);

    useEffect(() => {
        setHeaderTitle("Employees Management");
        setHeaderText("");
    }, []);

    const renderActions = (data, type, row) => {
        const container = document.createElement("div");

        setTimeout(() => {
            const root = createRoot(container);
            root.render(
                <Dropdown>
                    <DropdownItem
                        onClick={() =>
                            (window.location.href = `/company/cards/${row.id}/edit`)
                        }
                    >
                        <div className="flex items-center gap-1">
                            <EditIcon className="h-4 w-4" /> <span>Edit</span>
                        </div>
                    </DropdownItem>
                    <DropdownItem onClick={() => handleDeleteEmployee(row.id)}>
                        <div className="flex items-center gap-1">
                            <Trash2 className="h-4 w-4" /> <span>Delete</span>
                        </div>
                    </DropdownItem>
                    <DropdownItem
                        onClick={() => handleToggleStatus(row.id, row.status)}
                    >
                        {row.status === "active"
                            ? "Set Inactive"
                            : "Set Active"}
                    </DropdownItem>
                </Dropdown>
            );
        }, 0);

        return container;
    };

    const renderWalletStatus = (data, type, row) => {
        const container = document.createElement("div");

        setTimeout(() => {
            const root = createRoot(container);
            root.render(
                <div className="flex gap-1 items-center flex-wrap">
                    <WalletEligibilityPill
                        eligibility={row?.is_eligible_for_sync?.eligible}
                    />
                    <WalletStatusPill status={row?.wallet_status?.status} />
                </div>
            );
        }, 0);

        return container;
    };

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
    const [isAnyChecked, setIsAnyChecked] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);

    const columns = useMemo(
        () => [
            {
                title: `<input type="checkbox" id="select-all" /> ID`,
                data: "id",
                orderable: false,
                render: (data, type, row) => {
                    const isChecked = selectedIds.includes(row.id);
                    return `
        <div class="flex items-center gap-2">
            <input type="checkbox" 
                   class="row-checkbox" 
                   value="${row.id}" 
                   ${isChecked ? "checked" : ""} />
            <span>${row.id}</span>
        </div>
    `;
                },
            },
            {
                title: "Code",
                data: "code",
                render: (data, type, row) => {
                    return `<a href="${linkDomain}/card/${data}" target="_blank" class="text-[#50bd5b] underline">${data}</a>`;
                },
            },
            {
                title: "User",
                data: null,
                render: (data, type, row) => {
                    const nameParts = [
                        row.salutation,
                        row.title,
                        row.first_name,
                        row.last_name,
                    ].filter(Boolean);
                    const fullName = nameParts.join(" ");
                    return `
                    <div class="flex items-center gap-2">
                        <img
                            src="${
                                row.profile_image
                                    ? `/storage/${row.profile_image}`
                                    : "/assets/images/profile-placeholder.png"
                            }"
                            alt="Profile"
                            class="rounded-full border-2 bg-white border-white w-8 h-8 object-cover shrink-0"
                        />
                        <div class="space-y0.5">
                            <p class="font-medium text-[#181D27] text-sm">
                                ${fullName || "Not assigned"}
                            </p>
                            ${
                                row.primary_email
                                    ? `<p class="text-xs">${row.primary_email}</p>`
                                    : ""
                            }
                        </div>
                    </div>
                `;
                },
            },
            { title: "Position", data: "position" },
            { title: "Department", data: "department" },
            {
                title: "Status",
                data: "status",
                render: (data) => {
                    const isActive = data === "active";
                    const badgeClass = isActive
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-red-100 text-red-700 border border-red-200";

                    return `<span class="px-2 py-1 text-xs font-medium rounded-full ${badgeClass}">
                    ${isActive ? "Active" : "Inactive"}
                </span>`;
                },
            },
            {
                title: "Wallet Status",
                data: null,
                render: renderWalletStatus,
            },
            {
                title: "Actions",
                data: null,
                orderable: false,
                searchable: false,
                render: renderActions,
            },
        ],
        [linkDomain]
    );

    useEffect(() => {
        const selectAll = document.getElementById("select-all");
        if (!selectAll) return;

        // Handle "select all"
        const handleSelectAll = (e) => {
            const isChecked = e.target.checked;
            const checkboxes = document.querySelectorAll(".row-checkbox");

            const newSelectedIds = [];
            checkboxes.forEach((cb) => {
                cb.checked = isChecked;
                if (isChecked) newSelectedIds.push(parseInt(cb.value));
            });

            setSelectedIds(isChecked ? newSelectedIds : []);
            setIsAnyChecked(isChecked);
        };

        // Handle individual checkbox changes
        const handleRowCheckboxChange = () => {
            const checkboxes = document.querySelectorAll(".row-checkbox");
            const checkedBoxes = Array.from(
                document.querySelectorAll(".row-checkbox:checked")
            );
            const ids = checkedBoxes.map((cb) => parseInt(cb.value));

            // Update the "Select All" checkbox
            selectAll.checked = checkedBoxes.length === checkboxes.length;

            // Update states
            setSelectedIds(ids);
            setIsAnyChecked(ids.length > 0);
        };

        // Add listeners
        selectAll.addEventListener("change", handleSelectAll);
        document.addEventListener("change", (e) => {
            if (e.target.classList.contains("row-checkbox")) {
                handleRowCheckboxChange();
            }
        });

        // Cleanup
        return () => {
            selectAll.removeEventListener("change", handleSelectAll);
        };
    }, [linkDomain]);

    const [saving, setSaving] = useState(false);

    const handleDownload = async () => {
        if (!cards?.length || !selectedIds?.length) return;

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
            toast.warning("Please select at least one card.");
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

    const handleSyncMultipleWallets = async () => {
        if (!selectedIds.length) {
            toast.warning("Please select at least one card.");
            return;
        }

        setIsSyncing(true);
        setBackendErrors([]); // reset errors

        try {
            const response = await axios.post(
                "/company/cards/sync-multiple-wallets",
                { ids: selectedIds }
            );

            // ✅ Only success responses reach here
            toast.success(
                response.data.message || "Cards synced successfully!"
            );
            router.reload({ only: ["cards"] });
            setSelectedIds([]);

            if (typeof refreshTable === "function") refreshTable();
        } catch (error) {
            // ❌ Catch block will handle 422 or other errors
            console.error("Sync failed:", error);

            if (error.response?.status === 422 && error.response.data.errors) {
                // Backend returned validation / eligibility errors
                setBackendErrors(error.response.data.errors);
            } else {
                // Other errors
                const msg =
                    error.response?.data?.message || "Failed to update wallet.";
                toast.error(msg);
            }
        } finally {
            setIsSyncing(false);
        }
    };

    console.log("backendErrors: ", backendErrors);

    return (
        <AuthenticatedLayout>
            <Head title="Cards" />

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
                                            onClick={handleSyncMultipleWallets}
                                            closeOnClick={true}
                                            disabled={!isAnyChecked}
                                        >
                                            {isSyncing
                                                ? "Syncing..."
                                                : "Sync wallet"}
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
                            <DataTable
                                key={linkDomain}
                                data={cards}
                                columns={columns}
                                className="display site-datatable"
                                options={{
                                    responsive: true,
                                    pageLength: 10,
                                    lengthMenu: [10, 25, 50, 100],
                                    dom:
                                        "<'flex justify-between items-center mb-3 sd-top'<'flex items-center gap-2'l><'flex items-center gap-2'f>>" +
                                        "rt" +
                                        "<'flex justify-center mt-3 sd-bottom'p>",
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
