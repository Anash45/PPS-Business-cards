import { GlobalProvider, useGlobal } from "@/context/GlobalProvider";
import { MapPin, Smile } from "lucide-react";
import AutoTranslate from "./AutoTranslate";

export default function CardPreviewButtons({ cardButtons }) {
    const { cardFormData } =
        useGlobal(GlobalProvider);
    return cardButtons?.length > 0 ? (
        <div className="grid gap-2 grid-cols-1">
            {cardButtons.map(
                (button, index) =>
                    button.button_text && (
                        <a
                            target="_blank"
                            href={button.button_link}
                            key={index}
                            style={{
                                color: cardFormData?.btn_text_color,
                                backgroundColor: cardFormData?.btn_bg_color,
                                borderColor:
                                    cardFormData?.btn_bg_color ?? "#87B88C",
                            }}
                            className="flex border text-sm leading-tight items-center gap-3 justify-content-start rounded-lg px-4 py-2.5 font-medium preview-btn"
                        >
                            <span className="shrink-0 text-xl">
                                {button.icon ? (
                                    button.icon
                                ) : (
                                    <Smile className="h-7 w-7" />
                                )}
                            </span>
                            <span>{<AutoTranslate text={button.button_text} />}</span>
                        </a>
                    )
            )}
        </div>
    ) : null;
}
