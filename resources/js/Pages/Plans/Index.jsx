import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, router } from "@inertiajs/react";
import { GlobalProvider, useGlobal } from "@/context/GlobalProvider";
import { useEffect, useMemo } from "react";
import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";
import "datatables.net-dt/css/dataTables.dataTables.css";
import Button from "@/Components/Button";
import { Plus, Pencil, Trash } from "lucide-react";
import { useModal } from "@/context/ModalProvider";
import { createRoot } from "react-dom/client";
import { Dropdown, DropdownItem } from "@/Components/DropdownUi";

// Bind DataTables
DataTable.use(DT);

export default function Plans() {
    const { plans } = usePage().props;
    const { setHeaderTitle, setHeaderText } = useGlobal(GlobalProvider);
    const { openModal } = useModal();

    useEffect(() => {
        setHeaderTitle("Plans Management");
        setHeaderText("");
    }, []);

    // Custom render helper for action column (React inside DataTables)
    const renderActions = (data, type, row) => {
        const container = document.createElement("div");

        // Render React component inside DataTables cell
        setTimeout(() => {
            const root = createRoot(container);
            root.render(
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
            );
        }, 0);

        return container;
    };

    const handleDelete = (id) => {
        if (!confirm("Are you sure you want to delete this plan?")) return;
        router.delete(`/plans/${id}`, {
            preserveScroll: true,
            onSuccess: () => {
                console.log("Plan deleted successfully");
            },
        });
    };

    // Define table columns
    const columns = useMemo(
        () => [
            { title: "Name", data: "name" },
            { title: "Employees", data: "cards_included" },
            { title: "NFC Cards", data: "nfc_cards_included" },
            {
                title: "Monthly Price",
                data: "price_monthly",
                render: (data) => `$${parseFloat(data).toFixed(2)}`,
            },
            {
                title: "Annual Price",
                data: "price_annual",
                render: (data) => `$${parseFloat(data).toFixed(2)}`,
            },
            {
                title: "Custom",
                data: "is_custom",
                render: (data) => (data ? "Yes" : "No"),
            },
            {
                title: "Active",
                data: "active",
                render: (data) => {
                    const isActive = Boolean(data);
                    const badgeClass = isActive
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-gray-100 text-gray-700 border border-gray-200";

                    const text = isActive ? "Active" : "Inactive";

                    return `
            <span class="px-2 py-1 text-xs font-medium rounded-full ${badgeClass}">
                ${text}
            </span>
        `;
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
        []
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
                    <DataTable
                        data={plans}
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
        </AuthenticatedLayout>
    );
}
