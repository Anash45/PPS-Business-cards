import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, router } from "@inertiajs/react";
import { GlobalProvider, useGlobal } from "@/context/GlobalProvider";
import { useEffect, useMemo, useCallback } from "react";
import Button from "@/Components/Button";
import { Plus } from "lucide-react";
import { useModal } from "@/context/ModalProvider";
import { Dropdown, DropdownItem } from "@/Components/DropdownUi";
import CustomDataTable from "@/Components/CustomDataTable";

export default function Plans() {
    const { plans } = usePage().props;
    const { setHeaderTitle, setHeaderText } = useGlobal(GlobalProvider);
    const { openModal } = useModal();

    useEffect(() => {
        setHeaderTitle("Plans Management");
        setHeaderText("");
    }, []);

    const handleDelete = useCallback((id) => {
        if (!confirm("Are you sure you want to delete this plan?")) return;
        router.delete(`/plans/${id}`, {
            preserveScroll: true,
            onSuccess: () => {
                console.log("Plan deleted successfully");
            },
        });
    }, []);

    // Define table columns
    const columns = useMemo(
        () => [
            {
                key: "name",
                label: "Name",
                sortable: true,
            },
            {
                key: "cards_included",
                label: "Employees",
                sortable: true,
            },
            {
                key: "nfc_cards_included",
                label: "NFC Cards",
                sortable: true,
            },
            {
                key: "price_monthly",
                label: "Monthly Price",
                sortable: true,
                render: (value) => `€${parseFloat(value).toFixed(2)}`,
            },
            {
                key: "price_annual",
                label: "Annual Price",
                sortable: true,
                render: (value) => `€${parseFloat(value).toFixed(2)}`,
            },
            {
                key: "is_custom",
                label: "Custom",
                sortable: false,
                render: (value) => (value ? "Yes" : "No"),
            },
            {
                key: "active",
                label: "Active",
                sortable: true,
                render: (value, row) => {
                    const isActive = Boolean(value);
                    const badgeClass = isActive
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-gray-100 text-gray-700 border border-gray-200";
                    const text = isActive ? "Active" : "Inactive";

                    return (
                        <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${badgeClass}`}
                        >
                            {text}
                        </span>
                    );
                },
            },
            {
                key: "actions",
                label: "Actions",
                sortable: false,
                className: "text-center",
                render: (value, row) => (
                    <Dropdown>
                        <DropdownItem
                            onClick={() =>
                                openModal("CreatePlanModal", {
                                    existingPlan: row,
                                })
                            }
                        >
                            Edit
                        </DropdownItem>
                        <DropdownItem onClick={() => handleDelete(row.id)}>
                            Delete
                        </DropdownItem>
                    </Dropdown>
                ),
            },
        ],
        [handleDelete, openModal]
    );

    return (
        <AuthenticatedLayout>
            <Head title="Plans" />

            <div className="py-4 md:px-6 px-4 flex flex-col gap-6">
                <div className="flex items-center justify-end">
                    <Button
                        onClick={() => openModal("CreatePlanModal")}
                        variant="primary"
                        className="flex items-center gap-1 justify-center"
                    >
                        <Plus className="h-4 w-4" strokeWidth={2} /> Add Plan
                    </Button>
                </div>

                <div className="py-4 md:px-6 px-4 rounded-[14px] main-box bg-white flex flex-col gap-3">
                    <CustomDataTable
                        columns={columns}
                        data={plans}
                        endpoint={route("plans.index")}
                        tableKey="plans"
                        searchable={true}
                        paginated={true}
                        perPageOptions={[10, 25, 50, 100]}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
