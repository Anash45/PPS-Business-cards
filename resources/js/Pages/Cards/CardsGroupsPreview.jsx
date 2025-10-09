import { Link, router } from "@inertiajs/react";
import axios from "axios";
import dayjs from "dayjs";
import { Download, Eye, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function CardsGroupsPreview({
    previewGroups,
    domain,
    setPreviewCards,
}) {
    console.log(previewGroups);
    const handlePreviewCards = (cards, company) => {
        // Map each card to include company details
        const cardsWithCompany = cards.map((card) => ({
            ...card,
            company: {
                id: company.id,
                name: company.name,
                billing_email: company.billing_email,
            },
        }));

        console.log(cardsWithCompany);
        setPreviewCards(cardsWithCompany);
    };
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
                // Reload only cardsGroups from Inertia
                router.reload({ only: ["cardsGroups"] });
            } else {
                toast.error(response.data.message || "Failed to delete group.");
            }
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to delete group."
            );
        }
    };

    return (
        <div>
            <div className="overflow-auto w-full max-h-[730px]">
                <div className="xl:w-max min-w-full space-y-3">
                    {/* Header */}
                    <div className="hidden lg:flex border-b gap-4 border-gray-200 pb-2 px-4 text-xs font-semibold text-[#263238]">
                        <div className="w-28 shrink-0">Created at</div>
                        <div className="flex-1 min-w-[120px] shrink-0">
                            Company
                        </div>
                        <div className="w-14">Number</div>
                        <div className="w-20 text-center shrink-0">Action</div>
                    </div>

                    {/* Rows */}
                    {previewGroups.map((cg, idx) => (
                        <div
                            key={idx}
                            className="border border-gray-400 rounded-lg py-2 px-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:bg-gray-50 transition"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center lg:flex-1 lg:gap-4 w-full">
                                <div className="lg:w-28 shrink-0">
                                    <span className="lg:hidden text-[10px] text-gray-500">
                                        Created at:{" "}
                                    </span>
                                    <span className="text-xs text-body">
                                        <span>
                                            {dayjs(cg.created_at).format(
                                                "DD.MM.YYYY, HH:mm"
                                            )}
                                        </span>
                                    </span>
                                </div>
                                <div className="flex-1 min-w-[120px] shrink-0">
                                    <span className="lg:hidden text-[10px] text-gray-500">
                                        Company:{" "}
                                    </span>
                                    <span className="text-xs text-body">
                                        <span>{cg.company.name}</span>
                                    </span>
                                </div>
                                <div className="lg:w-14 shrink-0">
                                    <span className="lg:hidden text-[10px] text-gray-500">
                                        Number:{" "}
                                    </span>
                                    <span className="text-xs text-body">
                                        <span>{cg.cards_count}</span>
                                    </span>
                                </div>
                                <div className="lg:w-20 flex items-center gap-2 shrink-0">
                                    <span className="lg:hidden text-[10px] text-gray-500">
                                        Action:{" "}
                                    </span>
                                    <span className="text-xs text-body flex gap-1.5">
                                        <a
                                            target="_blank"
                                            href={route(
                                                "cards.group.download",
                                                cg.id
                                            )}
                                            className="text-center"
                                        >
                                            <Download
                                                size={16}
                                                className="text-body mx-auto"
                                                strokeWidth={2}
                                            />
                                        </a>
                                        <a
                                            onClick={() =>
                                                handlePreviewCards(
                                                    cg.cards,
                                                    cg.company
                                                )
                                            }
                                            className="text-center cursor-pointer"
                                        >
                                            <Eye
                                                size={16}
                                                className="text-blue-600 mx-auto"
                                                strokeWidth={2}
                                            />
                                        </a>
                                        <a
                                            onClick={() =>
                                                handleDeleteGroup(cg.id)
                                            }
                                            className="text-center cursor-pointer"
                                        >
                                            <Trash2
                                                size={16}
                                                className="text-red-600 mx-auto"
                                                strokeWidth={2}
                                            />
                                        </a>
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
