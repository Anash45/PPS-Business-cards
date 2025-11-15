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
import SelectInput from "@/Components/SelectInput";

// Bind DataTables
DataTable.use(DT);

export default function Nfc() {
    const { nfcCards, employeeCards, isSubscriptionActive } = usePage().props;
    const { setHeaderTitle, setHeaderText } = useGlobal(GlobalProvider);

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
        setHeaderTitle("NFC Cards Management");
        setHeaderText("");
    }, []);

    const renderActions = (data, type, row) => {
        const container = document.createElement("div");

        setTimeout(() => {
            const root = createRoot(container);
            root.render(
                <Dropdown>
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

    console.log("nfcCards: ", nfcCards);

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

    const [isAnyChecked, setIsAnyChecked] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

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
                data: "qr_code",
                render: (data, type, row) => {
                    return `<a href="${linkDomain}/card/${row.qr_code}" target="_blank" class="text-[#50bd5b] underline">${data}</a>`;
                },
            },
            {
                title: "Employee",
                data: null,
                render: (data, type, row) => {
                    // Use the associated card
                    const card = row.card;

                    if (!card) {
                        return `<p class="text-sm text-gray-400">Not assigned</p>`;
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

                    return `
        <div class="flex items-center gap-2">
            <img
                src="${profileImage}"
                alt="Profile"
                class="rounded-full border-2 bg-white border-white w-8 h-8 object-cover shrink-0"
            />
            <div>
                <p class="font-medium text-[#181D27] text-sm">
                    ${fullName || "Not assigned"}
                </p>
            </div>
        </div>
        `;
                },
            },
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
            <Head title="Cards" />

            <div className="py-4 md:px-6 px-4 flex flex-col gap-6">
                {!isSubscriptionActive ? (
                    <div className="p-4 bg-red-100 text-red-700 rounded-md">
                        You can only access this page with a valid subscription.
                        Contact Admin for more information.
                    </div>
                ) : (
                    <div className="space-y-5">
                        <div className="py-4 md:px-6 px-4 rounded-[14px] bg-white flex flex-col gap-3 space-y-3">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <Button
                                        onClick={() =>
                                            handleMultipleToggle("active")
                                        }
                                        disabled={
                                            !selectedIds.length || toggling
                                        }
                                        variant="primary-outline"
                                    >
                                        Set Active
                                    </Button>

                                    <Button
                                        onClick={() =>
                                            handleMultipleToggle("inactive")
                                        }
                                        disabled={
                                            !selectedIds.length || toggling
                                        }
                                        variant="danger-outline"
                                    >
                                        Set Inactive
                                    </Button>
                                    <div className="min-w-[200px]">
                                        <SelectInput
                                            id="employee"
                                            name="employee"
                                            value={selectedEmployee} // use the new state
                                            onChange={(selected) => {
                                                setSelectedEmployee(
                                                    selected.target.value
                                                ); // update new state
                                            }}
                                            className="w-full block"
                                            options={employeeCards.map(
                                                (employee) => ({
                                                    value: employee.id,
                                                    label:
                                                        [
                                                            employee.id,
                                                            employee.salutation,
                                                            employee.title,
                                                            employee.first_name,
                                                            employee.last_name,
                                                        ]
                                                            .filter(Boolean)
                                                            .join(" ") ||
                                                        "Not assigned",
                                                })
                                            )}
                                        />
                                    </div>

                                    <Button
                                        onClick={() => assignNfcToCards()}
                                        disabled={
                                            !selectedIds.length ||
                                            toggling ||
                                            !selectedEmployee
                                        }
                                        variant="primary"
                                    >
                                        Assign Card(s)
                                    </Button>

                                    <Button
                                        onClick={() => unassignNfcCards()}
                                        disabled={
                                            !selectedIds.length || toggling
                                        }
                                        variant="danger"
                                    >
                                        Unassign Card(s)
                                    </Button>
                                </div>
                                {selectedIds.length > 0 ? (
                                    <p className="text-sm text-primary">
                                        {selectedIds.length} cards selected
                                    </p>
                                ) : null}
                            </div>
                            <DataTable
                                key={linkDomain}
                                data={nfcCards}
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
