import { useEffect, useState } from "react";
import Button from "./Button";
import CardFormBanner from "./CardFormBanner";
import CardFormGeneralInformation from "./CardFormGeneralInformation";
import { GlobalProvider, useGlobal } from "@/context/GlobalProvider";
import toast from "react-hot-toast";
import { usePage } from "@inertiajs/react";
import { mapCompanyTemplateData } from "@/utils/mapCompanyTemplateData";
import CardFormSocialLinks from "./CardFormSocialLinks";
import CardPreview from "./CardPreview";
import CardFormProfile from "./CardFormProfile";
import CardFormButtons from "./CardFormButtons";

export default function LandingTab() {
    const { company, selectedCard = null } = usePage().props;
    const { cardFormData, setCardFormData, isTemplate } =
        useGlobal(GlobalProvider);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (company) {
            const mappedData = mapCompanyTemplateData(company, selectedCard);
            setCardFormData((prev) => ({
                ...prev,
                ...mappedData,
            }));
        }
    }, [company, selectedCard]);

    console.log("Current cardFormData:", cardFormData);

    const handleSaveTemplate = async () => {
        setIsSaving(true);

        // 1. Create FormData object
        // This is required when sending files (like banner_image)
        const formData = new FormData();

        // Append all relevant data to the FormData object
        // Note: Only append fields that the backend expects for template update (from validation rules)
        if (isTemplate) {
            formData.append("company_name", cardFormData.company_name);
            formData.append("name_text_color", cardFormData.name_text_color);
            formData.append(
                "company_text_color",
                cardFormData.company_text_color
            );

            // Assuming you have these fields in your form/state to match backend validation
            formData.append("card_bg_color", cardFormData.card_bg_color);
            formData.append("btn_bg_color", cardFormData.btn_bg_color);
            formData.append("btn_text_color", cardFormData.btn_text_color);
            formData.append("contact_btn_text", cardFormData.contact_btn_text);
            formData.append("phone_bg_color", cardFormData.phone_bg_color);
            formData.append("phone_text_color", cardFormData.phone_text_color);
            formData.append("email_bg_color", cardFormData.email_bg_color);
            formData.append("email_text_color", cardFormData.email_text_color);
            formData.append("address_bg_color", cardFormData.address_bg_color);
            formData.append(
                "address_text_color",
                cardFormData.address_text_color
            );

            // Append the file if it exists
            if (cardFormData.banner_image) {
                formData.append("banner_image", cardFormData.banner_image);
            }
            if (cardFormData.banner_image_url == null) {
                formData.append("banner_removed", true);
            }
        }

        console.log("Checking:", !isTemplate && selectedCard);

        if (!isTemplate && selectedCard) {
            formData.append("salutation", cardFormData.salutation);
            formData.append("title", cardFormData.title);
            formData.append("first_name", cardFormData.first_name);
            formData.append("last_name", cardFormData.last_name);
            formData.append("position", cardFormData.position);
            formData.append("degree", cardFormData.degree);
            formData.append("department", cardFormData.department);

            // Append the file if it exists
            if (cardFormData.profile_image) {
                formData.append("profile_image", cardFormData.profile_image);
            }
            if (cardFormData.profile_image_url == null) {
                formData.append("profile_removed", true);
            }
        }

        if (Array.isArray(cardFormData.card_social_links)) {
            cardFormData.card_social_links.forEach((link, index) => {
                formData.append(
                    `card_social_links[${index}][id]`,
                    link.id || ""
                );
                formData.append(
                    `card_social_links[${index}][icon]`,
                    link.icon || ""
                );
                formData.append(
                    `card_social_links[${index}][url]`,
                    link.url || ""
                );
                formData.append(
                    `card_social_links[${index}][company_id]`,
                    link.company_id || ""
                );
                formData.append(
                    `card_social_links[${index}][card_id]`,
                    link.card_id || ""
                );
            });
        }

        if (Array.isArray(cardFormData.card_phone_numbers)) {
            cardFormData.card_phone_numbers.forEach((phone, index) => {
                formData.append(
                    `card_phone_numbers[${index}][id]`,
                    phone.id || ""
                );
                formData.append(
                    `card_phone_numbers[${index}][phone_number]`,
                    phone.phone_number || ""
                );
                formData.append(
                    `card_phone_numbers[${index}][is_hidden]`,
                    phone.is_hidden ? "1" : "0"
                );
                formData.append(
                    `card_phone_numbers[${index}][company_id]`,
                    phone.company_id || ""
                );
                formData.append(
                    `card_phone_numbers[${index}][card_id]`,
                    phone.card_id || ""
                );
                formData.append(
                    `card_phone_numbers[${index}][type]`,
                    phone.type || "Work"
                );
            });
        }

        if (Array.isArray(cardFormData.card_emails)) {
            cardFormData.card_emails.forEach((email, index) => {
                formData.append(`card_emails[${index}][id]`, email.id || "");
                formData.append(
                    `card_emails[${index}][email]`,
                    email.email || ""
                );
                formData.append(
                    `card_emails[${index}][is_hidden]`,
                    email.is_hidden ? "1" : "0"
                );
                formData.append(
                    `card_emails[${index}][company_id]`,
                    email.company_id || ""
                );
                formData.append(
                    `card_emails[${index}][card_id]`,
                    email.card_id || ""
                );
                formData.append(
                    `card_emails[${index}][type]`,
                    email.type || "Work"
                );
            });
        }

        if (Array.isArray(cardFormData.card_addresses)) {
            cardFormData.card_addresses.forEach((addr, index) => {
                formData.append(`card_addresses[${index}][id]`, addr.id || "");
                formData.append(
                    `card_addresses[${index}][street]`,
                    addr.street || ""
                );
                formData.append(
                    `card_addresses[${index}][house_number]`,
                    addr.house_number || ""
                );
                formData.append(
                    `card_addresses[${index}][zip]`,
                    addr.zip || ""
                );
                formData.append(
                    `card_addresses[${index}][city]`,
                    addr.city || ""
                );
                formData.append(
                    `card_addresses[${index}][country]`,
                    addr.country || ""
                );
                formData.append(
                    `card_addresses[${index}][is_hidden]`,
                    addr.is_hidden ? "1" : "0"
                );
                formData.append(
                    `card_addresses[${index}][company_id]`,
                    addr.company_id || ""
                );
                formData.append(
                    `card_addresses[${index}][card_id]`,
                    addr.card_id || ""
                );
                formData.append(
                    `card_addresses[${index}][type]`,
                    addr.type || "Work"
                );
            });
        }

        if (Array.isArray(cardFormData.card_buttons)) {
            cardFormData.card_buttons.forEach((btn, index) => {
                formData.append(`card_buttons[${index}][id]`, btn.id || "");
                formData.append(
                    `card_buttons[${index}][button_text]`,
                    btn.button_text || ""
                );
                formData.append(
                    `card_buttons[${index}][button_link]`,
                    btn.button_link || ""
                );
                formData.append(`card_buttons[${index}][icon]`, btn.icon || "");
                formData.append(
                    `card_buttons[${index}][company_id]`,
                    btn.company_id || ""
                );
                formData.append(
                    `card_buttons[${index}][card_id]`,
                    btn.card_id || ""
                );
            });
        }

        try {
            // 2. Send data using Axios
            console.log("Submitting form data:");
            for (let [key, value] of formData.entries()) {
                console.log(key, value);
            }

            let response;

            if (isTemplate && !selectedCard) {
                response = await axios.post(
                    "/design/createOrUpdate",
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data", // Important for file uploads
                        },
                    }
                );
            } else if (!isTemplate && selectedCard) {
                response = await axios.post(
                    `/company/cards/${selectedCard.id}/update`,
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data", // Important for file uploads
                        },
                    }
                );
            } else {
                throw new Error(
                    "Invalid state: isTemplate and selectedCard mismatch."
                );
            }

            // 3. Handle Success
            if (response?.data?.success) {
                toast.success(
                    response.data.message || "Template saved successfully!"
                );
                // You can update state here with the new template data if needed:
                // ✅ Get the updated company from backend
                const companyDetails = response.data.company;
                const cardDetails = response.data.selectedCard;

                // ✅ Map it and set form data
                const mappedData1 = mapCompanyTemplateData(
                    companyDetails,
                    cardDetails
                );
                setCardFormData((prev) => ({
                    ...prev,
                    ...mappedData1,
                }));
            } else {
                // Should generally not be hit if status is 2xx, but good for custom success:false responses
                toast.error(
                    response.data.message ||
                        "Something went wrong during saving."
                );
            }
        } catch (error) {
            // 4. Handle Errors
            console.error("Template Save Error:", error);

            let errorMessage = "An unexpected error occurred.";

            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx (e.g., 403, 422, 500)

                if (error.response.status === 422) {
                    // Validation Error from Laravel (e.g., required field missing)
                    const errors = error.response.data.errors;
                    // Extract the first error message for simplicity
                    errorMessage = errors[Object.keys(errors)[0]][0];
                } else if (error.response.data.message) {
                    // General API error message (e.g., the 403 message from your backend)
                    errorMessage = error.response.data.message;
                } else {
                    errorMessage = `Server Error: ${error.response.status} ${error.response.statusText}`;
                }
            } else if (error.request) {
                // The request was made but no response was received (e.g., network error)
                errorMessage = "Network Error. Please check your connection.";
            }

            toast.error(errorMessage);
        } finally {
            // 5. Reset saving status
            setIsSaving(false);
        }
    };

    return (
        <div className="grid lg:grid-cols-11 grid-cols-1 gap-5 relative">
            <div className="lg:col-span-7 col-span-1 bg-white lg:p-6 p-5 rounded-[20px] shadow-box space-y-4 lg:order-1 order-2">
                {isTemplate && <CardFormBanner />}
                <CardFormProfile />
                <CardFormGeneralInformation />
                <CardFormSocialLinks />
                <CardFormButtons />
                <div className="flex flex-wrap gap-5 justify-end">
                    <Button
                        className="px-8"
                        variant="primary"
                        onClick={handleSaveTemplate}
                        disabled={isSaving}
                    >
                        {isSaving ? "Saving..." : selectedCard ? "Save Card" : "Save Template"}
                    </Button>
                </div>
            </div>

            <div className="lg:col-span-4 col-span-1  lg:order-2 order-1">
                <div className="bg-white rounded-2xl shadow-box border border-[#EAECF0] sticky top-3">
                    <div className="p-5 border-b border-b-[#EAECF0]">
                        <h4 className="text-xl leading-tight font-semibold">
                            Live Preview
                        </h4>
                    </div>
                    <div className="px-5 pb-5 pt-4">
                        <CardPreview />
                    </div>
                </div>
            </div>
        </div>
    );
}
