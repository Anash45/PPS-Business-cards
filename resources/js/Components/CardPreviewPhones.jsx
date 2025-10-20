import { GlobalProvider, useGlobal } from "@/context/GlobalProvider";
import { Phone } from "lucide-react";

export default function CardPreviewPhones({ cardPhones }) {
    const { isCardReal } = useGlobal(GlobalProvider);

    // Filter out hidden phones (if isCardReal)
    const visiblePhones = cardPhones?.filter(
        (phone) => !(phone.is_hidden && isCardReal)
    );

    return visiblePhones?.length > 0 ? (
        <div className={`grid gap-2 grid-cols-1`}>
            {visiblePhones.map((phone, index) => (
                <a
                    key={index}
                    target="_blank"
                    href={`tel:${phone.phone_number}`}
                    style={{
                        color: phone?.text_color,
                        backgroundColor: phone?.bg_color ?? "#87B88C",
                        borderColor: phone?.bg_color ?? "#87B88C",
                    }}
                    className="flex relative border text-sm leading-tight items-center gap-3 justify-content-start rounded-lg px-4 py-2.5 font-medium preview-btn w-full"
                >
                    <span className="shrink-0 text-xl">📞</span>
                    <span>{phone.type} Phone: {phone.phone_number}</span>
                    {phone.is_hidden && (
                        <span className="absolute -translate-y-1/2 translate-x-1 top-0 right-0 text-[10px] rounded bg-orange-500 py-0.5 px-2 italic text-white">
                            (Hidden)
                        </span>
                    )}
                </a>
            ))}
        </div>
    ) : null;
}
