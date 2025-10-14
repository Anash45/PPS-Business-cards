import { GlobalProvider, useGlobal } from "@/context/GlobalProvider";
import { MapPin } from "lucide-react";

export default function CardPreviewAdresses({ cardAddresses }) {
    const { isCardReal } = useGlobal(GlobalProvider);
    return cardAddresses?.length > 0 ? (
        <div className="grid gap-2 grid-cols-1">
            {cardAddresses.map((address, index) =>
                !(address.is_hidden && isCardReal) ? (
                    <a
                        target="_blank"
                        href={`https://www.google.com/maps/search/?api=1&query=${address.address}`}
                        key={index}
                        style={{
                            color: address?.text_color,
                            backgroundColor: address?.bg_color ?? "#87B88C",
                            borderColor: address?.bg_color ?? "#87B88C",
                        }}
                        className="flex border text-sm leading-tight relative items-center gap-3 justify-content-start rounded-lg px-4 py-2.5 font-medium preview-btn"
                    >
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span>{address.address}</span>

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
