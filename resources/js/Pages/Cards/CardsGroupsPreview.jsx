import { router } from "@inertiajs/react";
import axios from "axios";
import dayjs from "dayjs";
import { Download, Eye, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";
import { createRoot } from "react-dom/client";
import "datatables.net-dt/css/dataTables.dataTables.css";

// Bind DataTables
DataTable.use(DT);

export default function CardsGroupsPreview({ previewGroups, setPreviewCards }) {
    // console.log("previewGroups: ", previewGroups);
    // Preview cards
    const handlePreviewCards = (cards, company) => {
        const cardsWithCompany = cards.map((card) => ({
            ...card,
            company: {
                id: company.id,
                name: company.name,
                billing_email: company.billing_email,
            },
        }));
        setPreviewCards(cardsWithCompany);
    };

    // Delete entire group
    const handleDeleteGroup = async (groupId) => {
        if (
            !confirm(
                "Are you sure? It will only be deleted if there are no active cards."
            )
        )
            return;

        try {
            const response = await axios.delete(
                route("cards.groups.destroy", groupId)
            );
            if (response.data.success) {
                toast.success(response.data.message);
                router.reload({ only: ["cardsGroups", "companies"] });
            } else {
                toast.error(response.data.message || "Failed to delete group.");
            }
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to delete group."
            );
        }
    };

    // Delete only normal cards
    const handleDeleteCards = async (groupId) => {
        if (
            !confirm(
                "Are you sure? This will delete all normal cards in this group."
            )
        )
            return;
        try {
            const response = await axios.delete(
                route("cards.group.deleteCards", groupId)
            );
            if (response.data.success) {
                toast.success(response.data.message);
                router.reload({ only: ["cardsGroups", "companies"] });
            } else {
                toast.error(
                    response.data.message || "Failed to delete normal cards."
                );
            }
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to delete normal cards."
            );
        }
    };

    // Delete only NFC cards
    const handleDeleteNfcCards = async (groupId) => {
        if (
            !confirm(
                "Are you sure? This will delete all NFC cards in this group."
            )
        )
            return;
        try {
            const response = await axios.delete(
                route("cards.group.deleteNfcCards", groupId)
            );
            if (response.data.success) {
                toast.success(response.data.message);
                router.reload({ only: ["cardsGroups", "companies"] });
            } else {
                toast.error(
                    response.data.message || "Failed to delete NFC cards."
                );
            }
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to delete NFC cards."
            );
        }
    };

    // Render cards with delete button
    const renderCardsColumn = (data, type, row) => {
        const container = document.createElement("div");
        container.className = "flex items-center gap-2 justify-center";

        setTimeout(() => {
            const root = createRoot(container);
            root.render(
                <>
                    <span>{row.cards_count}</span>
                    <button
                        onClick={() => handleDeleteCards(row.id)}
                        className="text-red-600"
                        title="Delete normal cards"
                    >
                        <Trash2 size={16} strokeWidth={2} />
                    </button>
                </>
            );
        }, 0);

        return container;
    };

    // Render NFC cards with delete button
    const renderNfcCardsColumn = (data, type, row) => {
        const container = document.createElement("div");
        container.className = "flex items-center gap-2 justify-center";

        setTimeout(() => {
            const root = createRoot(container);
            root.render(
                <>
                    <span>{row.nfc_cards_count}</span>
                    <button
                        onClick={() => handleDeleteNfcCards(row.id)}
                        className="text-red-600"
                        title="Delete NFC cards"
                    >
                        <Trash2 size={16} strokeWidth={2} />
                    </button>
                </>
            );
        }, 0);

        return container;
    };

    // Actions column (Download + Preview + Delete group)
    const renderActionsColumn = (data, type, row) => {
        const container = document.createElement("div");
        container.className = "flex gap-2 justify-center";

        setTimeout(() => {
            const root = createRoot(container);
            root.render(
                <>
                    <a
                        target="_blank"
                        href={
                            row.nfc_cards && row.nfc_cards.length > 0
                                ? route("cards.group.download", row.id)
                                : "#"
                        }
                        onClick={(e) => {
                            if (!row.nfc_cards || row.nfc_cards.length === 0) {
                                e.preventDefault();
                                toast(
                                    "Only NFC cards are available for preview/download.",
                                    { icon: "ℹ️" }
                                );
                            }
                        }}
                        className={`inline-flex items-center ${
                            !row.nfc_cards || row.nfc_cards.length === 0
                                ? "opacity-50 cursor-pointer"
                                : "text-body hover:text-blue-600"
                        }`}
                    >
                        <Download size={16} strokeWidth={2} />
                    </a>

                    <button
                        onClick={() => {
                            if (!row.nfc_cards || row.nfc_cards.length === 0) {
                                toast(
                                    "Only NFC cards are available for preview/download.",
                                    { icon: "ℹ️" }
                                );
                                return;
                            }
                            handlePreviewCards(row.nfc_cards, row.company);
                        }}
                        className={`text-blue-600 ${
                            !row.nfc_cards || row.nfc_cards.length === 0
                                ? "opacity-40 cursor-pointer"
                                : ""
                        }`}
                    >
                        <Eye size={16} strokeWidth={2} />
                    </button>
                    <button
                        onClick={() => handleDeleteGroup(row.id)}
                        className="text-red-600"
                    >
                        <Trash2 size={16} strokeWidth={2} />
                    </button>
                </>
            );
        }, 0);

        return container;
    };

    const columns = [
        {
            title: "Created At",
            data: "created_at",
            render: (data, type, row) => {
                // Use raw data for sorting/searching
                if (type === "sort" || type === "type") {
                    return new Date(data).getTime();
                }
                // Format for display
                return dayjs(data).format("DD.MM.YYYY, HH:mm");
            },
        },
        { title: "Company", data: "company.name" },
        {
            title: "Cards",
            data: null,
            orderable: false,
            searchable: false,
            render: renderCardsColumn,
        },
        {
            title: "NFC Cards",
            data: null,
            orderable: false,
            searchable: false,
            render: renderNfcCardsColumn,
        },
        {
            title: "Actions",
            data: null,
            orderable: false,
            searchable: false,
            render: renderActionsColumn,
        },
    ];

    return (
        <div className="overflow-auto w-full max-h-[730px]">
            <DataTable
                data={previewGroups}
                columns={columns}
                paging={true}
                searching={false}
                ordering={true}
                options={{
                    responsive: true,
                    pageLength: 10,
                    dom:
                        "<'flex justify-between items-center mb-3 sd-top'<'flex items-center gap-2'l><'flex items-center gap-2'f>>" +
                        "rt" +
                        "<'flex justify-center mt-3 sd-bottom'p>",
                }}
                defaultOrder={[0, "desc"]}
                className="display site-datatable text-xs"
            />
        </div>
    );
}
