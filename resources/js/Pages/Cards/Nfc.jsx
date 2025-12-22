import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, router } from "@inertiajs/react";
import { GlobalProvider, useGlobal } from "@/context/GlobalProvider";
import { useEffect, useMemo, useState } from "react";
import CustomDataTable from "@/Components/CustomDataTable";
import { Dropdown, DropdownItem } from "@/Components/DropdownUi";
import toast from "react-hot-toast";
import axios from "axios";
import { getDomain } from "@/utils/viteConfig";
import SelectInput from "@/Components/SelectInput";
import { ChevronDown } from "lucide-react";
import Button from "@/Components/Button";
import AddNfcCardModal from "@/Components/AddNfcCardModal";
import { useModal } from "@/context/ModalProvider";

export default function Nfc() {
    const { nfcCards, isSubscriptionActive } = usePage().props;
    const { setHeaderTitle, setHeaderText } = useGlobal(GlobalProvider);

    console.log("NFC Cards: ", nfcCards);

    const [linkDomain, setLinkDomain] = useState(
        "https://app.ppsbusinesscards.de"
    );

    // Fetch domain on mount
    useEffect(() => {
        (async () => {
            const domain = await getDomain();
            setLinkDomain(domain);
        })();
    }, []);

    useEffect(() => {
        setHeaderTitle("NFC-Card management");
        setHeaderText("");
    }, []);

    const { openModal } = useModal();

    const handleToggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === "active" ? "inactive" : "active";

        if (!confirm(`Are you sure you want to set this card as ${newStatus}?`))
            return;

        try {
            const response = await axios.put(`/nfc-cards/${id}/toggle-status`, {
                status: newStatus,
            });

            if (response.data?.success) {
                toast.success(
                    response.data.message || "Card status updated successfully."
                );

                // Reload only the cards prop via Inertia
                router.reload({ only: ["nfcCards"] });
                setSelectedIds([]);
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

    const [selectedIds, setSelectedIds] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    const handleSelectAll = (e) => {
        e.stopPropagation();
        const isChecked = e.target.checked;
        if (isChecked) {
            const allIds = nfcCards.data.map((card) => card.id);
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
                                selectedIds.length === nfcCards.data?.length
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
                                onChange={(e) =>
                                    handleRowCheckboxChange(e, row.id)
                                }
                            />
                            <span className="text-sm text-gray-700">
                                {row.id}
                            </span>
                        </label>
                    );
                },
            },
            {
                key: "qr_code",
                label: "Code",
                sortable: true,
                render: (qrCode, row) => (
                    <a
                        href={`${linkDomain}/card/${qrCode}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#50bd5b] underline hover:text-[#3da047]"
                    >
                        {qrCode}
                    </a>
                ),
            },
            {
                key: "employee",
                label: "Employee",
                sortable: false,
                render: (employee, row) => {
                    const card = row?.card || null;

                    if (!card) {
                        return (
                            <p className="text-sm text-gray-400">
                                Not assigned
                            </p>
                        );
                    }

                    const nameParts = [
                        card.salutation,
                        card.title,
                        card.first_name,
                        card.last_name,
                    ].filter(Boolean);
                    const fullName = nameParts.join(" ");

                    const profileImage = card.profile_image
                        ? `/storage/${card.profile_image}`
                        : "/assets/images/profile-placeholder.png";

                    return (
                        <div className="flex items-center gap-2">
                            <img
                                src={profileImage}
                                alt="Profile"
                                className="rounded-full border-2 bg-white border-white w-8 h-8 object-cover shrink-0"
                            />
                            <div>
                                <p className="font-medium text-[#181D27] text-sm">
                                    {fullName || "Not assigned"}
                                </p>
                            </div>
                        </div>
                    );
                },
            },
            {
                key: "status",
                label: "Status",
                sortable: true,
                render: (status, row) => {
                    const isActive = status === "active";
                    const badgeClass = isActive
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-red-100 text-red-700 border border-red-200";

                    return (
                        <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${badgeClass}`}
                        >
                            {isActive ? "Active" : "Inactive"}
                        </span>
                    );
                },
            },
            {
                key: "actions",
                label: "Actions",
                sortable: false,
                render: (actions, row) => (
                    <Dropdown>
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
        [linkDomain, selectedIds, nfcCards]
    );

    const [toggling, setToggling] = useState(false);
    const [assigning, setAssigning] = useState(false);

    const handleMultipleToggle = async (status) => {
        if (!selectedIds.length) {
            toast.warning("Please select at least one card.");
            return;
        }

        console.log("selectedIds: ", selectedIds);
        setToggling(true);

        try {
            const response = await axios.post(
                "/nfc-cards/toggle-multiple-status",
                {
                    ids: selectedIds,
                    status, // 'active' or 'inactive'
                }
            );

            toast.success(response.data.message);
            router.reload({ only: ["nfcCards"] });
            setSelectedIds([]);

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

    const assignNfcToCards = async () => {
        if (!selectedIds.length) {
            toast.warning("Please select at least one NFC card.");
            return;
        }
        if (!selectedEmployee) {
            toast.warning("Please select an employee.");
            return;
        }

        setAssigning(true);

        try {
            const response = await axios.post(route("nfc-cards.assign"), {
                ids: selectedIds,
                employee: selectedEmployee,
            });

            toast.success(response.data.message);
            router.reload({ only: ["nfcCards", "employeeCards"] });
            setSelectedIds([]);

            if (typeof refreshTable === "function") refreshTable();
        } catch (error) {
            console.error("Assign failed:", error);
            toast.error(
                error.response?.data?.message || "Failed to assign NFC cards."
            );
        } finally {
            setAssigning(false);
        }
    };

    const unassignNfcCards = async () => {
        if (!selectedIds.length) {
            toast.warning("Please select at least one NFC card.");
            return;
        }

        setAssigning(true);

        try {
            const response = await axios.post(route("nfc-cards.unassign"), {
                ids: selectedIds,
            });

            toast.success(response.data.message);
            router.reload({ only: ["nfcCards", "employeeCards"] });
            setSelectedIds([]);

            if (typeof refreshTable === "function") refreshTable();
        } catch (error) {
            console.error("Unassign failed:", error);
            toast.error(
                error.response?.data?.message || "Failed to unassign NFC cards."
            );
        } finally {
            setAssigning(false);
        }
    };

    console.log("Emp: ", selectedEmployee);

    return (
        <AuthenticatedLayout>
            <Head title="NFC-Card management" />

            <div className="py-4 md:px-6 px-4 flex flex-col gap-6">
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
                                    <Button
                                        onClick={() =>
                                            openModal("AddNfcCardModal")
                                        }
                                        variant="primary"
                                    >
                                        Add Cards
                                    </Button>
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
                                            onClick={() => {
                                                if (
                                                    !selectedIds.length ||
                                                    toggling ||
                                                    !selectedEmployee
                                                )
                                                    return;

                                                const confirmed =
                                                    window.confirm(
                                                        "Are you sure you want to assign these cards? This action cannot be undone."
                                                    );
                                                if (confirmed) {
                                                    assignNfcToCards();
                                                }
                                            }}
                                            disabled={
                                                !selectedIds.length ||
                                                toggling ||
                                                !selectedEmployee
                                            }
                                        >
                                            Assign Card(s)
                                        </DropdownItem>

                                        <DropdownItem
                                            onClick={() => {
                                                if (
                                                    !selectedIds.length ||
                                                    toggling
                                                )
                                                    return;

                                                const confirmed =
                                                    window.confirm(
                                                        "Are you sure you want to unassign these cards? This action cannot be undone."
                                                    );
                                                if (confirmed) {
                                                    unassignNfcCards();
                                                }
                                            }}
                                            disabled={
                                                !selectedIds.length || toggling
                                            }
                                        >
                                            Unassign Card(s)
                                        </DropdownItem>
                                    </Dropdown>
                                    <div className="w-[280px] max-w-full">
                                        <SelectInput
                                            id="employee"
                                            isSearchable={true}
                                            placeholder="Select or search employee..."
                                            name="employee"
                                            value={selectedEmployee}
                                            onChange={(selected) => {
                                                setSelectedEmployee(
                                                    selected.target.value
                                                );
                                            }}
                                            className="w-full block"
                                            async={true}
                                            loadOptions={(inputValue) => {
                                                console.log(
                                                    "Searching for: ",
                                                    inputValue
                                                );
                                                return axios
                                                    .get(
                                                        route(
                                                            "company.employees.search"
                                                        ),
                                                        {
                                                            params: {
                                                                q: inputValue,
                                                            },
                                                        }
                                                    )
                                                    .then((response) => {
                                                        console.log(
                                                            "Search results: ",
                                                            response.data
                                                        );
                                                        return response.data.map(
                                                            (emp) => ({
                                                                value: emp.value,
                                                                label: emp.label,
                                                                icon: () => (
                                                                    <img
                                                                        src={
                                                                            emp.image
                                                                        }
                                                                        alt={
                                                                            emp.label
                                                                        }
                                                                        className="h-6 w-6 rounded-full"
                                                                    />
                                                                ),
                                                            })
                                                        );
                                                    })
                                                    .catch((error) => {
                                                        console.error(
                                                            "Search error: ",
                                                            error
                                                        );
                                                        return [];
                                                    });
                                            }}
                                        />
                                    </div>
                                </div>
                                {selectedIds.length > 0 ? (
                                    <p className="text-sm text-primary top-full left-0 absolute mt-1">
                                        {selectedIds.length} card(s) selected
                                    </p>
                                ) : null}
                            </div>
                            <CustomDataTable
                                columns={columns}
                                data={nfcCards}
                                endpoint={route("company.nfc_cards")}
                                tableKey="nfcCards"
                                searchable={true}
                                paginated={true}
                                perPageOptions={[10, 25, 50, 100]}
                                selectable={true}
                                selectedIds={selectedIds}
                                onSelectionChange={setSelectedIds}
                                emptyMessage="No NFC cards found."
                            />
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
