import { MapPin } from "lucide-react";

export default function CardPreviewButtons({ cardButtons }) {
    return cardButtons?.length > 0 ? (
        <div className="grid gap-2 grid-cols-1">
            {cardButtons.map((button, index) => (
                button.button_text && (
                    <a
                    target="_blank"
                    href={button.button_link}
                    key={index}
                    style={{
                        color: button?.text_color,
                        backgroundColor: button?.bg_color ?? "#87B88C",
                        borderColor: button?.bg_color ?? "#87B88C",
                    }}
                    className="flex border text-sm leading-tight items-center gap-3 justify-content-start rounded-lg px-4 py-2.5 font-medium preview-btn"
                >
                    <span className="shrink-0 text-xl">{button?.icon ?? ""}</span>
                    <span>{button.button_text}</span>
                </a>
                )
            ))}
        </div>
    ) : null;
}
