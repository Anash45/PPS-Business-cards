import { GlobalProvider, useGlobal } from "@/context/GlobalProvider";
import CardPreviewSocials from "./CardPreviewSocials";
import CardPreviewPhones from "./CardPreviewPhones";
import CardPreviewEmails from "./CardPreviewEmails";
import CardPreviewAdresses from "./CardPreviewAdresses";
import CardPreviewButtons from "./CardPreviewButtons";
import CardPreviewVCard from "./CardPreviewVCard";

export default function CardPreview({ isReal = false }) {
    const { cardFormData, setCardFormData } = useGlobal(GlobalProvider);
    return (
        <div
            className={`border ${
                isReal ? "border-transparent" : "border-[#EAECF0]"
            } rounded-lg p-3 mx-auto w-[430px] max-w-full`}
            style={{
                backgroundColor: cardFormData?.card_bg_color ?? "#ffffff",
            }}
        >
            <div className="space-y-4">
                <div className="relative border border-[#EAECF0] bg-gradient bg-gradient-to-b from-[#eaffec] to-transparent rounded-lg w-full h-[200px]">
                    {cardFormData.banner_image_url ? (
                        <img
                            src={cardFormData.banner_image_url}
                            alt="Banner"
                            className="w-full h-full object-cover rounded-lg"
                        />
                    ) : null}
                    {cardFormData.profile_image_url ? (
                        <img
                            src={cardFormData.profile_image_url}
                            alt="Profile"
                            className="rounded-full border-2 bg-white border-white absolute bottom-0 left-1/2 transform translate-y-1/2 -translate-x-1/2 w-[140px] h-[140px] object-cover"
                        />
                    ) : (
                        <img
                            src="/assets/images/profile-placeholder.svg"
                            alt="Profile"
                            className="rounded-full border-2 bg-white border-white absolute bottom-0 left-1/2 transform translate-y-1/2 -translate-x-1/2 w-[140px] h-[140px] object-cover"
                        />
                    )}
                </div>
                <div>
                    <div className="mt-20 space-y-2 text-center">
                        <h2
                            className="text-xl text-center leading-tight font-black font-public-sans"
                            style={{
                                color:
                                    cardFormData?.name_text_color || "#000000",
                            }}
                        >
                            {cardFormData.salutation ||
                            cardFormData.first_name ||
                            cardFormData.last_name
                                ? `${cardFormData?.salutation} ${cardFormData?.title} ${cardFormData?.first_name} ${cardFormData?.last_name}`
                                : "Mr. John Doe"}
                        </h2>
                        {cardFormData.position ||
                        cardFormData.department ||
                        cardFormData.company_name ? (
                            <div
                                className="space-y-1"
                                style={{
                                    color:
                                        cardFormData?.company_text_color ||
                                        "#000000",
                                }}
                            >
                                {cardFormData.position ||
                                cardFormData.department ? (
                                    <p className="text-sm font-medium flex items-center justify-center gap-1.5">
                                        <span>{cardFormData?.position}</span>{" "}
                                        <span className="inline-block h-1 w-1 rounded-full bg-gray-400"></span>
                                        <span>{cardFormData?.department}</span>
                                    </p>
                                ) : null}
                                {cardFormData.company_name ? (
                                    <p className="text-base leading-tight font-bold">
                                        {cardFormData.company_name}
                                    </p>
                                ) : null}
                            </div>
                        ) : null}
                    </div>
                </div>
                <CardPreviewVCard />
                <CardPreviewSocials
                    cardSocialsLinks={cardFormData?.card_social_links ?? []}
                />
                <CardPreviewPhones
                    cardPhones={cardFormData?.card_phone_numbers ?? []}
                />
                <CardPreviewEmails
                    cardEmails={cardFormData?.card_emails ?? []}
                />
                <CardPreviewAdresses
                    cardAddresses={cardFormData?.card_addresses ?? []}
                />
                <CardPreviewButtons
                    cardButtons={cardFormData?.card_buttons ?? []}
                />
            </div>
        </div>
    );
}
