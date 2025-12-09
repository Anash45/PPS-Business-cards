import { GlobalProvider, useGlobal } from "@/context/GlobalProvider";
import { MapPin, Smile } from "lucide-react";
import AutoTranslate from "./AutoTranslate";
import { useAutoTranslate } from "@/context/AutoTranslateProvider";

export default function CardPreviewButtons({ cardButtons }) {
    const context = useAutoTranslate();
    const isDE = context?.isDE || null;
    const { cardFormData } = useGlobal(GlobalProvider);
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
                                fontSize: `${cardFormData.buttons_size}px`,
                            }}
                            className="flex border leading-tight items-center gap-3 justify-content-start rounded-lg px-4 py-2.5 font-medium preview-btn"
                        >
                            {button.icon ? (
                                <span
                                    className="shrink-0"
                                    style={{
                                        fontSize: `${
                                            Number(cardFormData.buttons_size) +
                                            4
                                        }px`,
                                    }}
                                >
                                    {button.icon}
                                </span>
                            ) : null}
                            <span>
                                {isDE && button.button_text_de
                                    ? button.button_text_de
                                    : button.button_text}
                            </span>
                        </a>
                    )
            )}
        </div>
    ) : null;
}
