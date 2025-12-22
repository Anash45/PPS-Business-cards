import CardsForm from "@/Pages/Cards/CardsForm";
import CardsGroupsPreview from "@/Pages/Cards/CardsGroupsPreview";
import { usePage } from "@inertiajs/react";
import { useState } from "react";

export default function AssociatedCards() {
    const { cardsGroups, flash } = usePage().props;
    const [previewCards, setPreviewCards] = useState([]);
    console.log("cardsGroups:", cardsGroups);

    return (
        <div className="flex flex-col gap-6">
            <div className="grid xl:grid-cols-[60%,40%] grid-cols-1 gap-[14px] items-start">
                <div className="py-4 md:px-6 px-4 rounded-[14px] main-box bg-white flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                        <h5 className="font-semibold text-grey900 text-[18px] leading-[28px]">
                            Create new card block
                        </h5>
                        <p className="text-xs text-[#544854]">
                            Here you can create new cards with codes in numbers.
                        </p>
                    </div>
                    <CardsForm
                        independentCards={false}
                        previewCards={previewCards}
                        setPreviewCards={setPreviewCards}
                    />
                </div>
                <div className="py-4 md:px-6 px-4 rounded-[14px] main-box bg-white flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                        <h5 className="font-semibold text-grey900 text-[18px] leading-[28px]">
                            History
                        </h5>
                        <p className="text-xs text-[#544854]">
                            History of cards created.
                        </p>
                    </div>
                    <CardsGroupsPreview
                        cardsGroups={cardsGroups}
                        setPreviewCards={setPreviewCards}
                    />
                </div>
            </div>
        </div>
    );
}
