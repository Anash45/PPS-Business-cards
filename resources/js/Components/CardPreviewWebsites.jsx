import { GlobalProvider, useGlobal } from "@/context/GlobalProvider";
import { Globe } from "lucide-react";

export default function CardPreviewWebsites({ cardWebsites }) {
    const { cardFormData } = useGlobal(GlobalProvider);

    const visibleWebsites = cardWebsites?.filter((site) => !site.is_hidden);

    if (!visibleWebsites?.length) return null;

    return (
        <div className="grid gap-2 grid-cols-1">
            {visibleWebsites.map((site, index) => (
                <a
                    key={index}
                    href={
                        site.url?.startsWith("http")
                            ? site.url
                            : `https://${site.url}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        color:
                            cardFormData?.website_text_color ??
                            cardFormData?.btn_text_color,
                        backgroundColor:
                            cardFormData?.website_bg_color ??
                            cardFormData?.btn_bg_color,
                        borderColor:
                            cardFormData?.website_bg_color ??
                            cardFormData?.btn_bg_color,
                    }}
                    className="flex border text-sm leading-tight relative items-center gap-3 justify-start rounded-lg px-4 py-2.5 font-medium preview-btn"
                >
                    <span className="shrink-0 text-xl">
                        {site.icon ? (
                            <span>{site.icon}</span>
                        ) : (
                            <span>🌐</span>
                        )}</span>

                    <span className="truncate">
                        {site.label ? (
                            <span>{site.label}</span>
                        ) : (
                            site.url
                        )}
                    </span>

                    {site.is_hidden ? (
                        <span className="absolute -translate-y-1/2 translate-x-1 top-0 right-0 text-[10px] rounded bg-orange-500 py-0.5 px-2 italic text-white">
                            (Hidden)
                        </span>
                    ) : null}
                </a>
            ))}
        </div>
    );
}
