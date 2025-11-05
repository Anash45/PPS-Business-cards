import { GlobalProvider, useGlobal } from "@/context/GlobalProvider";
import Button from "./Button";
import WalletFormInformation from "./WalletFormInformation";
import WalletPreview from "./WalletPreview";
import { useState } from "react";
import toast from "react-hot-toast";
import { mapCompanyTemplateData } from "@/utils/mapCompanyTemplateData";

export default function WalletTab() {
    const [isSaving, setIsSaving] = useState(false);
    const { cardFormData, selectedCard = null, setCardFormData, isTemplate, setIsChanged, isChanged } =
        useGlobal(GlobalProvider);

    const handleSaveWallet = async () => {
        setIsSaving(true);

        // 1. Create FormData object
        // This is required when sending files (like banner_image)
        const formData = new FormData();

        // Append all relevant data to the FormData object
        // Note: Only append fields that the backend expects for template update (from validation rules)
        if (isTemplate) {
            formData.append("company_name", cardFormData.company_name);
            formData.append("wallet_text_color", cardFormData.wallet_text_color);
            formData.append("wallet_bg_color", cardFormData.wallet_bg_color);
            formData.append("wallet_title", cardFormData.wallet_title);
            formData.append("wallet_label_1", cardFormData.wallet_label_1);
            formData.append("wallet_label_2", cardFormData.wallet_label_2);
            formData.append("wallet_label_3", cardFormData.wallet_label_3);
            formData.append("wallet_qr_caption", cardFormData.wallet_qr_caption);
            // Append the file if it exists
            if (cardFormData.wallet_logo_image) {
                formData.append("wallet_logo_image", cardFormData.wallet_logo_image);
            }
            if (cardFormData.wallet_logo_image_url == null) {
                formData.append("wallet_logo_removed", true);
            }

        }

        console.log("Checking:", !isTemplate && selectedCard);

        // if (!isTemplate && selectedCard) {
        //     formData.append("salutation", cardFormData.salutation);
        //     formData.append("title", cardFormData.title);
        //     formData.append("first_name", cardFormData.first_name);
        //     formData.append("last_name", cardFormData.last_name);
        //     formData.append("position", cardFormData.position);
        //     formData.append("degree", cardFormData.degree);
        //     formData.append("department", cardFormData.department);

        //     // Append the file if it exists
        //     if (cardFormData.profile_image) {
        //         formData.append("profile_image", cardFormData.profile_image);
        //     }
        //     if (cardFormData.profile_image_url == null) {
        //         formData.append("profile_removed", true);
        //     }
        // }

        try {
            // 2. Send data using Axios
            console.log("Submitting form data:");
            for (let [key, value] of formData.entries()) {
                console.log(key, value);
            }

            let response;

            if (isTemplate && !selectedCard) {
                response = await axios.post(
                    "/design/card_wallet/update",
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data", // Important for file uploads
                        },
                    }
                );
            } else if (!isTemplate && selectedCard) {
                // response = await axios.post(
                //     `/company/cards/card_wallet/${selectedCard.id}/update`,
                //     formData,
                //     {
                //         headers: {
                //             "Content-Type": "multipart/form-data", // Important for file uploads
                //         },
                //     }
                // );
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

                setTimeout(() => {
                    setIsChanged(false);
                }, 500);
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
        <div className="grid 2xl:grid-cols-11 grid-cols-1 gap-5 relative">
            <div className="2xl:col-span-7 col-span-1 bg-white lg:p-6 p-5 rounded-[20px] shadow-box space-y-4 lg:order-1 order-2">
                <WalletFormInformation />

                <div className="flex flex-wrap gap-5 justify-end">
                    <Button
                        className="px-8"
                        variant="primary"
                        onClick={handleSaveWallet}
                        disabled={isSaving}
                    >
                        {isSaving
                            ? "Saving..."
                            : selectedCard
                            ? "Save Wallet"
                            : "Save Wallet Template"}
                    </Button>
                </div>
            </div>

            <div className="2xl:col-span-4 col-span-1  lg:order-2 order-1">
                <div className="bg-white rounded-2xl shadow-box border border-[#EAECF0] sticky top-3">
                    <div className="p-5 border-b border-b-[#EAECF0]">
                        <h4 className="text-xl leading-tight font-semibold">
                            Live Wallet Preview
                        </h4>
                    </div>
                    <div className="px-5 pb-5 pt-4">
                        <WalletPreview />
                    </div>
                </div>
            </div>
        </div>
    );
}
