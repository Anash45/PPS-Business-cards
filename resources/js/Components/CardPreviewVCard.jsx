import { GlobalProvider, useGlobal } from "@/context/GlobalProvider";
import { getDomain } from "@/utils/viteConfig";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import AutoTranslate from "./AutoTranslate";
import { useAutoTranslate } from "@/context/AutoTranslateProvider";

export default function CardPreviewVCard() {
    const { cardFormData } = useGlobal(GlobalProvider);
    const context = useAutoTranslate();
    const isDE = context?.isDE || null;

    const [linkDomain, setLinkDomain] = useState(
        "https://app.ppsbusinesscards.de"
    );

    // Fetch domain on mount
    useEffect(() => {
        (async () => {
            const domain = await getDomain();
            setLinkDomain(domain);
        })();
    }, []);

    const handleSaveVCard = async () => {
        if (!cardFormData) return;

        console.log("cardFormData: ", cardFormData);

        const firstName = cardFormData.first_name || "";
        const lastName = cardFormData.last_name || "";
        const companyName = cardFormData.company_name || "";

        // ✅ Start vCard
        let vcard = `BEGIN:VCARD
VERSION:3.0
N:${lastName};${firstName};;${cardFormData.title || ""};
FN:${[cardFormData.salutation, firstName, lastName].filter(Boolean).join(" ")}
ORG:${companyName}
TITLE:${isDE && cardFormData.position_de ? cardFormData.position_de : cardFormData.position || ""}
ROLE:${isDE && cardFormData.department_de ? cardFormData.department_de : cardFormData.department || ""}
`;

        // ✅ Include profile image as base64 if available
        if (cardFormData.profile_image_url) {
            try {
                const base64Image = await convertImageToBase64(
                    `${linkDomain}${cardFormData.profile_image_url}`
                );
                if (base64Image) {
                    // Determine image type and format accordingly
                    const imageType = getImageType(
                        cardFormData.profile_image_url
                    );
                    vcard += `PHOTO;ENCODING=b;TYPE=${imageType}:${base64Image}\n`;
                }
            } catch (error) {
                console.warn(
                    "Failed to convert image to base64, falling back to URL:",
                    error
                );
                // Fallback to URL if base64 conversion fails
                vcard += `PHOTO;VALUE=URI:${linkDomain}${cardFormData.profile_image_url}\n`;
            }
        }

        // ✅ Websites (with optional label)
        (cardFormData.card_websites || []).forEach((w) => {
            if (w.url) {
                if (w.label) {
                    // Include label/type in vCard
                    vcard += `URL;TYPE=${w.label.toUpperCase()}:${w.url}\n`;
                } else {
                    // No label, just URL
                    vcard += `URL:${w.url}\n`;
                }
            }
        });
        vcard += `URL;TYPE=Update vcard:${linkDomain}/card/${cardFormData.code}\n`;

        // ✅ Phone numbers (with type + pref)
        (cardFormData.card_phone_numbers || []).forEach((p, index) => {
            if (p.phone_number) {
                const type = (p.type || "Work").toUpperCase();
                const pref = index === 0 ? "PREF," : "";
                vcard += `TEL;TYPE=${pref}${type},VOICE:${p.phone_number}\n`;
            }
        });

        // ✅ Emails (with type + pref)
        (cardFormData.card_emails || []).forEach((e, index) => {
            if (e.email) {
                const type = (e.type || "Work").toUpperCase();
                const pref = index === 0 ? "PREF," : "";
                vcard += `EMAIL;TYPE=${pref}${type}:${e.email}\n`;
            }
        });

        // ✅ Addresses (German format)
        (cardFormData.card_addresses || []).forEach((a, index) => {
            // Only include if at least street, house_number, city, or country is provided
            if (a.street || a.house_number || a.city || a.country) {
                const type = (a.type || "Work").toUpperCase();
                const pref = index === 0 ? "PREF," : "";

                // vCard ADR structure:
                // ADR;TYPE=WORK:;;Street House_number;City;;ZIP;Country
                const streetPart = [a.street, a.house_number].join(" ");
                const cityPart = a.city || "";
                const zipPart = a.zip || "";
                const countryPart = a.country || "";

                vcard += `ADR;TYPE=${pref}${type}:;;${streetPart};${cityPart};;${zipPart};${countryPart}\n`;
            }
        });

        vcard += "END:VCARD";

        // ✅ Create blob and download
        const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        // Use first_name_last_name_companyname.vcf
        const safeCompany = companyName.replace(/\s+/g, "_");
        link.download = `${firstName}_${lastName}_${safeCompany}.vcf`;
        link.href = url;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success("vCard downloaded!");

        // ✅ Increment downloads on server
        try {
            const response = await axios.post("/cards/increment-downloads", {
                code: cardFormData.code,
            });

            if (response.data.success) {
                console.log("Downloads updated:", response.data.downloads);
            } else {
                console.warn(
                    "Download increment failed:",
                    response.data.message
                );
            }
        } catch (error) {
            console.error("Error incrementing downloads:", error);
        }
    };

    // Helper function to convert image to base64
    const convertImageToBase64 = (imageUrl) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "Anonymous"; // Important for cross-origin images

            img.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                // Set canvas dimensions to image dimensions
                canvas.width = img.width;
                canvas.height = img.height;

                // Draw image on canvas
                ctx.drawImage(img, 0, 0);

                try {
                    // Convert to base64 - you can change format if needed
                    const base64 = canvas.toDataURL("image/jpeg").split(",")[1];
                    resolve(base64);
                } catch (error) {
                    reject(error);
                }
            };

            img.onerror = reject;
            img.src = imageUrl;

            // If image is already cached, trigger load manually
            if (img.complete) {
                img.onload();
            }
        });
    };

    // Helper function to determine image type from URL
    const getImageType = (imageUrl) => {
        const extension = imageUrl.split(".").pop()?.toLowerCase() || "jpeg";
        const typeMap = {
            jpg: "JPEG",
            jpeg: "JPEG",
            png: "PNG",
            gif: "GIF",
            bmp: "BMP",
            webp: "WEBP",
        };
        return typeMap[extension] || "JPEG";
    };

    return (
        <div className="flex items-center justify-center">
            <button
                onClick={handleSaveVCard}
                style={{
                    color:
                        cardFormData?.vcard_btn_text_color ||
                        cardFormData?.btn_text_color ||
                        "#ffffff",
                    backgroundColor:
                        cardFormData?.vcard_btn_bg_color ||
                        cardFormData?.btn_bg_color ||
                        "#87B88C",
                    borderColor:
                        cardFormData?.vcard_btn_bg_color ||
                        cardFormData?.btn_bg_color ||
                        "#87B88C",
                }}
                className="px-4 py-2.5 rounded-[10px] text-sm font-medium leading-tight w-fit"
            >
                {isDE && cardFormData.contact_btn_text_de
                    ? cardFormData.contact_btn_text_de
                    : cardFormData.contact_btn_text}
            </button>
        </div>
    );
}
