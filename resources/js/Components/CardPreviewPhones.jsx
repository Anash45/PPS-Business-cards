import { GlobalProvider, useGlobal } from "@/context/GlobalProvider";
import { Phone } from "lucide-react";
import AutoTranslate from "./AutoTranslate";
import { useAutoTranslate } from "@/context/AutoTranslateProvider";

export default function CardPreviewPhones({ cardPhones }) {
    const context = useAutoTranslate();
    const isDE = context?.isDE || null;
    const { isCardReal, cardFormData } = useGlobal(GlobalProvider);

    // ✅ Filter visible phone numbers
    const visiblePhones = cardPhones?.filter((phone) => !phone.is_hidden);

    // ✅ Fallback if no phone numbers exist
    const displayPhones =
        visiblePhones && visiblePhones.length > 0
            ? visiblePhones
            : [
                  {
                      icon: "📞",
                      label: "Sample",
                      phone_number: "+44 1234 567890",
                      is_hidden: false,
                  },
              ];

    return (
        <div className="grid gap-2 grid-cols-1">
            {displayPhones.map((phone, index) => (
                <a
                    key={index}
                    target="_blank"
                    href={`tel:${phone.phone_number}`}
                    style={{
                        color:
                            cardFormData?.phone_text_color ??
                            cardFormData?.btn_text_color,
                        backgroundColor:
                            cardFormData?.phone_bg_color ??
                            cardFormData?.btn_bg_color,
                        borderColor:
                            cardFormData?.phone_bg_color ??
                            cardFormData?.btn_bg_color,

                        fontSize: `${cardFormData.buttons_size}px`,
                    }}
                    className="flex relative border leading-tight items-center gap-3 justify-content-start rounded-lg px-4 py-2.5 font-medium preview-btn w-full"
                >
                    <span
                        className="shrink-0"
                        style={{
                            fontSize: `${
                                Number(cardFormData.buttons_size) + 4
                            }px`,
                        }}
                    >
                        {phone?.icon ?? "📞"}
                    </span>
                    <span>
                        {phone.label || phone.label_de ? (
                            <span>
                                {isDE && phone.label_de
                                    ? phone.label_de
                                    : phone.label}
                            </span>
                        ) : null}{" "}
                        {phone.phone_number}
                    </span>
                    {phone.is_hidden && (
                        <span className="absolute -translate-y-1/2 translate-x-1 top-0 right-0 text-[10px] rounded bg-orange-500 py-0.5 px-2 italic text-white">
                            (Hidden)
                        </span>
                    )}
                </a>
            ))}
        </div>
    );
}
