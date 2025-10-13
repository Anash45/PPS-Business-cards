import { GlobalProvider, useGlobal } from "@/context/GlobalProvider";

export default function CardPreview() {
    const { cardFormData, setCardFormData } = useGlobal(GlobalProvider);
    return (
        <div className="border border-[#EAECF0] rounded-lg p-3 mx-auto max-w-[430px]">
            <div className="space-y-4">
                <div className="relative border border-[#EAECF0] bg-gradient bg-gradient-to-b from-[#eaffec] to-transparent rounded-xl w-full h-[200px]">
                    {cardFormData.banner_image_url ? (
                        <img
                            src={cardFormData.banner_image_url}
                            alt="Banner"
                            className="w-full h-full object-cover rounded-xl"
                        />
                    ) : null}
                    {cardFormData.profile_image_url ? (
                        <img
                            src={cardFormData.profile_image_url}
                            alt="Profile"
                            className="rounded-full border-2 bg-white border-white absolute -bottom-10 left-1/2 transform -translate-x-1/2 w-[140px] h-[140px] object-cover"
                        />
                    ) : (
                        <img
                            src="/assets/images/profile-placeholder.svg"
                            alt="Profile"
                            className="rounded-full border-2 bg-white border-white absolute -bottom-10 left-1/2 transform -translate-x-1/2 w-[140px] h-[140px] object-cover"
                        />
                    )}
                </div>
                <div>
                    <div className="mt-12 space-y-3 text-center">
                        <h2
                            className="text-xl text-center leading-tight font-extrabold"
                            style={{
                                color:
                                    cardFormData?.name_text_color || "#000000",
                            }}
                        >
                            {cardFormData.first_name || cardFormData.last_name
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
                                    <p className="text-base leading-tight font-semibold">
                                        {cardFormData.company_name}
                                    </p>
                                ) : null}
                            </div>
                        ) : null}
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-center">
                    {(cardFormData.card_social_links || []).map(
                        (link, index) => (
                            <a
                                key={index}
                                href={link.url || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-500 hover:text-gray-700 transition"
                            >
                                <img
                                    src={`/assets/images/icons/${link.icon
                                        .replace(/^Fa/, "")
                                        .toLowerCase()}.png`}
                                    alt={link.icon}
                                    className="h-7"
                                />
                            </a>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
