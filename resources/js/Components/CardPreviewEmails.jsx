import { GlobalProvider, useGlobal } from "@/context/GlobalProvider";
import { Mail } from "lucide-react";

export default function CardPreviewEmails({ cardEmails }) {
    const { isCardReal } = useGlobal(GlobalProvider);
    return cardEmails?.length > 0 ? (
        <div className="grid gap-2 grid-cols-1">
            {cardEmails.map((email, index) =>
                !(email.hidden && isCardReal) ? (
                    <a
                        target="_blank"
                        href={`mailto:${email.email}`}
                        key={index}
                        style={{
                            color: email?.text_color,
                            backgroundColor: email?.bg_color ?? "#87B88C",
                            borderColor: email?.bg_color ?? "#87B88C",
                        }}
                        className="flex border text-sm leading-tight relative items-center gap-3 justify-content-start rounded-lg px-4 py-2.5 font-medium preview-btn"
                    >
                        <span className="shrink-0 text-xl">✉️</span>
                        <span>{email.type} email: {email.email}</span>

                        {email.is_hidden ? (
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
