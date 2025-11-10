import { GlobalProvider, useGlobal } from "@/context/GlobalProvider";
import CardPreviewSocials from "./CardPreviewSocials";
import CardPreviewVCard from "./CardPreviewVCard";
import CardPreviewSections from "./CardPreviewSections";
import { useEffect, useRef, useState } from "react";
import AutoTranslate from "./AutoTranslate";

export default function CardPreview({ isReal = false }) {
    const { cardFormData } = useGlobal(GlobalProvider);

    const positionRef = useRef(null);
    const departmentRef = useRef(null);
    const [sameLine, setSameLine] = useState(true);

    useEffect(() => {
        const checkSameLine = () => {
            if (positionRef.current && departmentRef.current) {
                const posRect = positionRef.current.getBoundingClientRect();
                const depRect = departmentRef.current.getBoundingClientRect();
                setSameLine(Math.abs(posRect.top - depRect.top) < 5); // same line if Y positions are close
            }
        };

        // Run on mount and resize
        checkSameLine();
        window.addEventListener("resize", checkSameLine);
        return () => window.removeEventListener("resize", checkSameLine);
    }, [cardFormData?.position, cardFormData?.department]);

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
                <div className="relative border border-[#EAECF0] bg-gradient bg-gradient-to-b from-[#eaffec] to-transparent rounded-lg w-full">
                    {cardFormData.banner_image_url ? (
                        <img
                            src={cardFormData.banner_image_url}
                            alt="Banner"
                            className="w-full h-full object-cover rounded-lg aspect-[2/1]"
                        />
                    ) : (
                        <img
                            src={`/assets/images/white-placeholder.webp`}
                            alt="Banner"
                            className="w-full h-full object-cover rounded-lg aspect-[2/1]"
                        />
                    )}
                    {cardFormData.profile_image_url ? (
                        <img
                            src={cardFormData.profile_image_url}
                            alt="Profile"
                            className="rounded-full border-2 bg-white border-white absolute bottom-0 left-1/2 transform translate-y-1/2 -translate-x-1/2 w-[140px] h-[140px] object-cover"
                        />
                    ) : (
                        <img
                            src="/assets/images/profile-placeholder.png"
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
                            {cardFormData.title ||
                            cardFormData.first_name ||
                            cardFormData.last_name
                                ? `${cardFormData?.title} ${cardFormData?.first_name} ${cardFormData?.last_name}`
                                : "Dr. John Doe"}
                        </h2>
                        {cardFormData.degree ? (
                            <p
                                className="text-sm italic leading-tight font-bold"
                                style={{
                                    color:
                                        cardFormData?.name_text_color ||
                                        "#000000",
                                }}
                            >
                                {<AutoTranslate text={cardFormData.degree} />}
                            </p>
                        ) : null}
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
                                    <p className="text-sm font-medium flex items-center justify-center flex-wrap gap-1.5 text-center">
                                        {cardFormData?.position && (
                                            <span ref={positionRef}>
                                                {<AutoTranslate text={cardFormData.position} />}
                                            </span>
                                        )}

                                        {cardFormData?.position &&
                                            cardFormData?.department &&
                                            sameLine && (
                                                <span
                                                    className="inline-block h-1 w-1 rounded-full opacity-40"
                                                    style={{
                                                        backgroundColor:
                                                            cardFormData?.company_text_color ||
                                                            "#000",
                                                    }}
                                                ></span>
                                            )}

                                        {cardFormData?.department && (
                                            <span ref={departmentRef}>
                                                {<AutoTranslate text={cardFormData.department} />}
                                            </span>
                                        )}
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
                <CardPreviewSections />
            </div>
        </div>
    );
}
