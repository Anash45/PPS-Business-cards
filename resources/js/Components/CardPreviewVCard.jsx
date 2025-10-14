import { GlobalProvider, useGlobal } from "@/context/GlobalProvider";
import { toast } from "react-hot-toast";

export default function CardPreviewVCard() {
    const { cardFormData } = useGlobal(GlobalProvider);

    const handleSaveVCard = () => {
        if (!cardFormData) return;

        // Build vCard string
        let vcard = `BEGIN:VCARD
VERSION:3.0
N:${cardFormData.last_name || ""};${cardFormData.first_name || ""};;${
            cardFormData.title || ""
        };
FN:${[cardFormData.salutation, cardFormData.first_name, cardFormData.last_name]
            .filter(Boolean)
            .join(" ")}
ORG:${cardFormData.company_name || ""}
TITLE:${cardFormData.position || ""}
ROLE:${cardFormData.department || ""}
`;

        // Phone numbers
        (cardFormData.card_phone_numbers || []).forEach((p) => {
            if (p.phone_number)
                vcard += `TEL;TYPE=WORK,VOICE:${p.phone_number}\n`;
        });

        // Emails
        (cardFormData.card_emails || []).forEach((e) => {
            if (e.email) vcard += `EMAIL;TYPE=WORK:${e.email}\n`;
        });

        // Addresses
        (cardFormData.card_addresses || []).forEach((a) => {
            if (a.address) vcard += `ADR;TYPE=WORK:;;${a.address};;;;\n`;
        });

        // Add links from card_buttons
        (cardFormData.card_buttons || []).forEach((btn) => {
            if (btn.button_link) {
                // Use URL field
                vcard += `URL;TYPE=WORK:${btn.button_link}\n`;

                // Optionally include the button text in a NOTE
                if (btn.button_text) {
                    vcard += `NOTE:${btn.button_text}\n`;
                }
            }
        });

        vcard += "END:VCARD";

        // Create blob and download
        const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${cardFormData.first_name || "contact"}_vcard.vcf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success("vCard downloaded!");
    };

    return (
        <div className="flex items-center justify-center">
            <button
                onClick={handleSaveVCard}
                style={{
                    color: cardFormData?.btn_text_color || "#ffffff",
                    backgroundColor: cardFormData?.btn_bg_color || "#87B88C",
                    borderColor: cardFormData?.btn_bg_color || "#87B88C",
                }}
                className="px-4 py-2.5 rounded-[10px] text-sm font-medium leading-tight w-fit"
            >
                Save contact details
            </button>
        </div>
    );
}
