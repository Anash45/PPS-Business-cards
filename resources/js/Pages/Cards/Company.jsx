import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, router } from "@inertiajs/react";
import { GlobalProvider, useGlobal } from "@/context/GlobalProvider";
import { useEffect, useMemo, useState } from "react";
import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";
import "datatables.net-dt/css/dataTables.dataTables.css";
import Button from "@/Components/Button";
import { Plus, Pencil } from "lucide-react";
import { useModal } from "@/context/ModalProvider";
import { createRoot } from "react-dom/client";
import { Dropdown, DropdownItem } from "@/Components/DropdownUi";
import toast from "react-hot-toast";
import axios from "axios";
import { getDomain } from "@/utils/viteConfig";
import SampleCsvDownload from "@/Components/SampleCsvDownload";

// Bind DataTables
DataTable.use(DT);

export default function Company() {
    const { cards, isSubscriptionActive } = usePage().props;
    const { setHeaderTitle, setHeaderText } = useGlobal(GlobalProvider);

    const [linkDomain, setLinkDomain] = useState(
        "https://app.ppsbusinesscards.de"
    );

    // Fetch domain on mount
    useEffect(() => {
        (async () => {
            const domain = await getDomain();
            setLinkDomain(domain);
            console.log("asdsad", domain);
        })();
    }, []);

    useEffect(() => {
        setHeaderTitle("Cards Management");
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
                        Edit
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

    const columns = useMemo(
        () => [
            { title: "ID", data: "id" },
            {
                title: "Code",
                data: "code",
                render: (data, type, row) => {
                    return `<a href="${linkDomain}/card/${data}" target="_blank" class="text-[#50bd5b] underline">${data}</a>`;
                },
            },
            {
                title: "Name",
                data: null,
                render: (data, type, row) => {
                    const parts = [
                        row.salutation,
                        row.title,
                        row.first_name,
                        row.last_name,
                    ].filter(Boolean);
                    return parts.join(" ");
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
                        : "bg-gray-100 text-gray-700 border border-gray-200";

                    return `<span class="px-2 py-1 text-xs font-medium rounded-full ${badgeClass}">${
                        isActive ? "Active" : "Inactive"
                    }</span>`;
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

    return (
        <AuthenticatedLayout>
            <Head title="Cards" />

            <div className="py-4 md:px-6 px-4 flex flex-col gap-6">
                <SampleCsvDownload cards={cards} />
                {!isSubscriptionActive ? (
                    <div className="p-4 bg-red-100 text-red-700 rounded-md">
                        You can only access this page with a valid subscription.
                        Contact Admin for more information.
                    </div>
                ) : (
                    <div className="space-y-5">
                        <div className="py-4 md:px-6 px-4 rounded-[14px] bg-white flex flex-col gap-3">
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
