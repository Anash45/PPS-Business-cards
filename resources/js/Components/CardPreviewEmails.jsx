import { GlobalProvider, useGlobal } from "@/context/GlobalProvider";
import { useAutoTranslate } from "@/context/AutoTranslateProvider";

export default function CardPreviewEmails({ cardEmails }) {
    const { cardFormData } = useGlobal(GlobalProvider);
    const context = useAutoTranslate();
    const isDE = context?.isDE || null;

    // Filter non-hidden emails
    const visibleEmails = cardEmails?.filter((email) => !email.is_hidden) || [];

    // Build final display list
    const displayEmails = [];

    // // 👉 Show Primary Email only when not empty
    // if (cardFormData?.primary_email?.trim()) {
    //     displayEmails.push({
    //         label: "Primary Email",
    //         label_de: "Primäre E-Mail-Adresse",
    //         email: cardFormData.primary_email,
    //         is_hidden: false,
    //     });
    // }

    // 👉 Add other saved emails
    if (visibleEmails.length > 0) {
        displayEmails.push(...visibleEmails);
    } else {
        // 👉 Only fallback if no emails at all
        displayEmails.push({
            label: "Sample",
            label_de: "Probe",
            email: "sample@email.com",
            is_hidden: false,
        });
    }

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
                        fontSize: `${cardFormData.buttons_size}px`,
                    }}
                    className="flex border leading-tight relative items-center gap-3 justify-content-start rounded-lg px-4 py-2.5 font-medium preview-btn"
                >
                    <span
                        className="shrink-0"
                        style={{
                            fontSize: `${
                                Number(cardFormData.buttons_size) + 4
                            }px`,
                        }}
                    >
                        ✉️
                    </span>

                    <span>
                        {(email.label || email.label_de) && (
                            <>
                                <span className="block">
                                    {isDE && email.label_de
                                        ? email.label_de
                                        : email.label}
                                </span>{" "}
                            </>
                        )}
                        {email.email}
                    </span>
                </a>
            ))}
        </div>
    );
}
