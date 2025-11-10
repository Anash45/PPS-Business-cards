import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, router } from "@inertiajs/react";
import { GlobalProvider, useGlobal } from "@/context/GlobalProvider";
import { useEffect, useMemo, useState } from "react";
import CardPreview from "@/Components/CardPreview";
import CardLayout from "@/Layouts/CardLayout";
import { mapCompanyTemplateData } from "@/utils/mapCompanyTemplateData";
import AutoTranslate from "@/Components/AutoTranslate";

export default function Company() {
    const {
        selectedCard,
        company,
        isSubscriptionActive,
        pageType = "card",
    } = usePage().props;
    const {
        setHeaderTitle,
        setHeaderText,
        cardFormData,
        setCardFormData,
        setIsCardReal,
    } = useGlobal(GlobalProvider);

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
            <Head>
                {/* ✅ Page Title */}
                <title>
                    {cardFormData?.title ||
                    cardFormData?.first_name ||
                    cardFormData?.last_name
                        ? [
                              cardFormData?.title,
                              cardFormData?.first_name,
                              cardFormData?.last_name,
                          ]
                              .filter(Boolean)
                              .join(" ")
                        : "Great Guy To Know"}
                </title>

                {/* ✅ Favicon / Browser Tab Icon */}
                <link
                    rel="icon"
                    type="image/png"
                    href={
                        cardFormData.profile_image_url
                            ? `${cardFormData.profile_image_url}`
                            : cardFormData.banner_image_url
                            ? `${cardFormData.banner_image_url}`
                            : "/assets/images/profile-placeholder.png"
                    }
                />

                <meta
                    property="description"
                    content={
                        cardFormData?.meta_description ??
                        cardFormData?.description ??
                        (cardFormData?.position || cardFormData?.department
                            ? [cardFormData?.position, cardFormData?.department]
                                  .filter(Boolean)
                                  .join(" - ")
                            : "Get in touch via my digital business card.")
                    }
                />
            </Head>

            <div className="py-4 md:px-6 px-4 flex flex-col gap-6">
                {!isSubscriptionActive ? (
                    <div className="p-4 text-center bg-red-100 text-red-700 rounded-md">
                        <AutoTranslate
                            text={`You can only access this page with a valid subscription. Contact administrator for more information.`}
                        />
                    </div>
                ) : selectedCard?.status === "active" ? (
                    <CardPreview isReal={true} />
                ) : (
                    <div className="p-4 text-center bg-orange-100 text-orange-700 rounded-md">
                        <AutoTranslate
                            text={`This card is currently inactive. Please contact the
                        administrator for more information.`}
                        />
                    </div>
                )}
            </div>
        </CardLayout>
    );
}
