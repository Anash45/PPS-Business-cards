import { GlobalProvider, useGlobal } from "@/context/GlobalProvider";
import { MapPin } from "lucide-react";
import AutoTranslate from "./AutoTranslate";

export default function CardPreviewAdresses({ cardAddresses }) {
    const { isCardReal, cardFormData } = useGlobal(GlobalProvider);

    const visibleAddresses = cardAddresses?.filter(
        (address) => !address.is_hidden
    );
    return visibleAddresses?.length > 0 ? (
        <div className="grid gap-2 grid-cols-1">
            {visibleAddresses.map((address, index) =>
                !(address.is_hidden && isCardReal) ? (
                    <a
                        key={index}
                        target="_blank"
                        rel="noopener noreferrer"
                        href={`https://www.google.de/maps/search/?api=1&query=${encodeURIComponent(
                            [
                                address.street,
                                address.house_number,
                                address.zip,
                                address.city,
                                address.country,
                            ]
                                .filter(Boolean)
                                .join(" ")
                        )}`}
                        style={{
                            color:
                                cardFormData?.address_text_color ??
                                cardFormData?.btn_text_color,
                            backgroundColor:
                                cardFormData?.address_bg_color ??
                                cardFormData?.btn_bg_color,
                            borderColor:
                                cardFormData?.address_bg_color ??
                                cardFormData?.btn_bg_color,
                        }}
                        className="flex border text-sm leading-tight relative items-center gap-3 justify-content-start rounded-lg px-4 py-2.5 font-medium preview-btn"
                    >
                        <span className="shrink-0 text-xl">📍</span>
                        <span>
                            {address.label ? (
                                <span>{<AutoTranslate text={address.label} />}</span>
                            ) : (
                                <span>
                                    {[address.street, address.house_number]
                                        .filter(Boolean)
                                        .join(" ")}
                                    {address.street || address.house_number
                                        ? ", "
                                        : ""}
                                    {[address.zip, address.city]
                                        .filter(Boolean)
                                        .join(" ")}
                                    {address.zip || address.city ? ", " : ""}
                                    {address.country || ""}
                                </span>
                            )}
                        </span>

                        {address.is_hidden ? (
                            <span className="absolute -translate-y-1/2 translate-x-1 top-0 right-0 text-[10px] rounded bg-orange-500 py-0.5 px-2 italic text-white">
                                (Hidden)
                            </span>
                        ) : null}
                    </a>
                ) : null
            )}
        </div>
    ) : null;
}
