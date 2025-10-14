import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, router } from "@inertiajs/react";
import { GlobalProvider, useGlobal } from "@/context/GlobalProvider";
import { useEffect, useMemo, useState } from "react";
import CardPreview from "@/Components/CardPreview";
import CardLayout from "@/Layouts/CardLayout";
import { mapCompanyTemplateData } from "@/utils/mapCompanyTemplateData";

export default function Company() {
    const {
        selectedCard,
        company,
        isSubscriptionActive,
        pageType = "card",
    } = usePage().props;
    const { setHeaderTitle, setHeaderText, setCardFormData, setIsCardReal } =
        useGlobal(GlobalProvider);

    useEffect(() => {
        setHeaderTitle("Business Card");
        setHeaderText("");
    }, []);

    useEffect(() => {
        if (company) {
            const mappedData = mapCompanyTemplateData(company, selectedCard);
            setCardFormData((prev) => ({
                ...prev,
                ...mappedData,
            }));
        }
    }, [company, selectedCard]);

    useEffect(() => {
        setIsCardReal(true);
    });

    return (
        <CardLayout>
            <Head title="Cards" />

            <div className="py-4 md:px-6 px-4 flex flex-col gap-6">
                {!isSubscriptionActive ? (
                    <div className="p-4 bg-red-100 text-red-700 rounded-md">
                        You can only access this page with a valid subscription.
                        Contact administrator for more information.
                    </div>
                ) : selectedCard?.status === "active" ? (
                    <CardPreview isReal={true} />
                ) : (
                    <div className="p-4 bg-orange-100 text-orange-700 rounded-md">
                        This card is currently inactive. Please contact the administrator for more information.
                    </div>
                )}
            </div>
        </CardLayout>
    );
}
