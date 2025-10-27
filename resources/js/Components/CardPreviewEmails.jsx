import { GlobalProvider, useGlobal } from "@/context/GlobalProvider";
import { Mail } from "lucide-react";

export default function CardPreviewEmails({ cardEmails }) {
    const { isCardReal, cardFormData } = useGlobal(GlobalProvider);
    const visibleEmails = cardEmails?.filter((email) => !email.is_hidden);

    // ✅ Fallback if no emails exist
    const displayEmails =
        visibleEmails && visibleEmails.length > 0
            ? visibleEmails
            : [
                  {
                      label: "Sample",
                      email: "sample@email.com",
                      is_hidden: false,
                  },
              ];

    return (
        <div className="grid gap-2 grid-cols-1">
            {displayEmails.map((email, index) => (
                <a
                    key={index}
                    target="_blank"
                    href={`mailto:${email.email}`}
                    style={{
                        color:
                            cardFormData?.email_text_color ??
                            cardFormData?.btn_text_color,
                        backgroundColor:
                            cardFormData?.email_bg_color ??
                            cardFormData?.btn_bg_color,
                        borderColor:
                            cardFormData?.email_bg_color ??
                            cardFormData?.btn_bg_color,
                    }}
                    className="flex border text-sm leading-tight relative items-center gap-3 justify-content-start rounded-lg px-4 py-2.5 font-medium preview-btn"
                >
                    <span className="shrink-0 text-xl">✉️</span>
                    <span>
                        {email.label ? (
                            <span>{email.label}: </span>
                        ) : null}
                        {email.email}
                    </span>

                    {email.is_hidden ? (
                        <span className="absolute -translate-y-1/2 translate-x-1 top-0 right-0 text-[10px] rounded bg-orange-500 py-0.5 px-2 italic text-white">
                            (Hidden)
                        </span>
                    ) : null}
                </a>
            ))}
        </div>
    );
}
