import { router } from "@inertiajs/react";
import axios from "axios";
import dayjs from "dayjs";
import { Download, Eye, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useMemo, useCallback } from "react";
import CustomDataTable from "@/Components/CustomDataTable";

export default function CardsGroupsPreview({ cardsGroups, setPreviewCards }) {
    // Preview cards
    const handlePreviewCards = useCallback((cards, company) => {
        const cardsWithCompany = cards.map((card) => ({
            ...card,
            company: {
                id: company.id,
                name: company.name,
                billing_email: company.billing_email,
            },
        }));
        setPreviewCards(cardsWithCompany);
    }, [setPreviewCards]);

    // Delete entire group
    const handleDeleteGroup = useCallback(async (groupId) => {
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
    }, []);

    // Delete only normal cards
    const handleDeleteCards = useCallback(async (groupId) => {
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
    }, []);

    // Delete only NFC cards
    const handleDeleteNfcCards = useCallback(async (groupId) => {
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
    }, []);

    const columns = useMemo(
        () => [
            {
                key: "created_at",
                label: "Created At",
                sortable: true,
                render: (value, row) => (
                    <div className="text-xs">
                        {dayjs(row.created_at).format("DD.MM.YYYY")}
                        <br />
                        {dayjs(row.created_at).format("HH:mm")}
                    </div>
                ),
            },
            {
                key: "company",
                label: "Company",
                sortable: true,
                render: (value, row) => row.company?.name || "-",
            },
            {
                key: "cards_count",
                label: "Employees",
                sortable: false,
                className: "text-center",
                render: (value, row) => (
                    <div className="flex items-center gap-2 justify-center">
                        <span>{row.cards_count}</span>
                        <button
                            onClick={() => handleDeleteCards(row.id)}
                            className="text-red-600"
                            title="Delete normal cards"
                        >
                            <Trash2 size={16} strokeWidth={2} />
                        </button>
                    </div>
                ),
            },
            {
                key: "nfc_cards_count",
                label: "NFC Cards",
                sortable: false,
                className: "text-center",
                render: (value, row) => (
                    <div className="flex items-center gap-2 justify-center">
                        <span>{row.nfc_cards_count}</span>
                        <button
                            onClick={() => handleDeleteNfcCards(row.id)}
                            className="text-red-600"
                            title="Delete NFC cards"
                        >
                            <Trash2 size={16} strokeWidth={2} />
                        </button>
                    </div>
                ),
            },
            {
                key: "actions",
                label: "Actions",
                sortable: false,
                className: "text-center",
                render: (value, row) => (
                    <div className="flex gap-2 justify-center">
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
                    </div>
                ),
            },
        ],
        [handleDeleteCards, handleDeleteNfcCards, handleDeleteGroup, handlePreviewCards]
    );

    console.log("cardsGroups:", cardsGroups);
    return (
        <div className="overflow-auto w-full max-h-[730px]">
            <CustomDataTable
                columns={columns}
                data={cardsGroups}
                endpoint={route("cards.index")}
                tableKey="cardsGroups"
                searchable={true}
                paginated={true}
                perPageOptions={[10, 25, 50]}
                className="text-xs"
                size="md"
            />
        </div>
    );
}
