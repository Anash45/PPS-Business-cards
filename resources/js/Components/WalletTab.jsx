import { GlobalProvider, useGlobal } from "@/context/GlobalProvider";
import Button from "./Button";
import WalletFormInformation from "./WalletFormInformation";
import WalletPreview from "./WalletPreview";
import { useState } from "react";
import toast from "react-hot-toast";
import { mapCompanyTemplateData } from "@/utils/mapCompanyTemplateData";
import { router, usePage } from "@inertiajs/react";
import WalletStatusPill from "./WalletStatusPill";
import WalletEligibilityPill from "./WalletEligibilityPill";

export default function WalletTab() {
    const [isSaving, setIsSaving] = useState(false);
    const {
        cardFormData,
        setCardFormData,
        isTemplate,
        setIsChanged,
        isChanged,
    } = useGlobal(GlobalProvider);
    const {
        company,
        selectedCard = null,
        wallet_status = null,
        wallet_eligibility = null,
    } = usePage().props;

    const handleSaveWallet = async () => {
        setIsSaving(true);

        // 1. Create FormData object
        // This is required when sending files (like banner_image)
        const formData = new FormData();

        // Append all relevant data to the FormData object
        // Note: Only append fields that the backend expects for template update (from validation rules)
        if (isTemplate) {
            formData.append("company_name", cardFormData.company_name);
            formData.append(
                "wallet_text_color",
                cardFormData.wallet_text_color
            );
            formData.append("wallet_bg_color", cardFormData.wallet_bg_color);
            formData.append("wallet_title", cardFormData.wallet_title);
            formData.append("wallet_label_1", cardFormData.wallet_label_1);
            formData.append("wallet_label_2", cardFormData.wallet_label_2);
            formData.append("wallet_label_3", cardFormData.wallet_label_3);
            formData.append(
                "wallet_qr_caption",
                cardFormData.wallet_qr_caption
            );
            // Append the file if it exists
            if (cardFormData.wallet_logo_image) {
                formData.append(
                    "wallet_logo_image",
                    cardFormData.wallet_logo_image
                );
            }
            if (cardFormData.wallet_logo_image_url == null) {
                formData.append("wallet_logo_removed", true);
            }

            
            // Append the file if it exists
            if (cardFormData.google_wallet_logo_image) {
                formData.append(
                    "google_wallet_logo_image",
                    cardFormData.google_wallet_logo_image
                );
            }
            if (cardFormData.google_wallet_logo_image_url == null) {
                formData.append("google_wallet_logo_removed", true);
            }
        }

        console.log("Checking Wallet Upload:", cardFormData.primary_email);

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
                response = await axios.post(
                    `/company/cards/card_wallet/${selectedCard.id}/update`,
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

                router.reload({
                    only: [
                        "wallet_status",
                        "wallet_eligibility",
                        "company",
                        "selectedCard",
                    ],
                    onSuccess: (page) => {
                        const newCompany = page.props.company;
                        const newCard = page.props.selectedCard;

                        const mappedData = mapCompanyTemplateData(
                            newCompany,
                            newCard
                        );

                        setCardFormData((prev) => ({
                            ...prev,
                            ...mappedData,
                        }));

                        setIsChanged(false);
                    },
                });
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
                    const errors = error.response.data.message;
                    // Extract the first error message for simplicity
                    errorMessage = errors;
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

    const [walletType, setWalletType] = useState("apple");
    console.log(wallet_eligibility);

    return (
        <div className="grid 2xl:grid-cols-11 grid-cols-1 gap-5 relative">
            {isTemplate ? (
                <div className="2xl:col-span-7 col-span-1 bg-white rounded-[20px] shadow-box space-y-4 lg:order-1 order-2">
                    <div className="px-5 pt-4 pb-2 border-b border-b-[#EAECF0]">
                        <div className="flex gap-1 rounded-full bg-gray-100 p-1 border border-gray-200 text-xs w-fit">
                            <button
                                className={`px-4 py-2 rounded-full font-semibold transition-colors ${
                                    walletType === "apple"
                                        ? "bg-primary text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                                onClick={() =>
                                    setWalletType("apple")
                                }
                            >
                                Apple Wallet
                            </button>
                            <button
                                className={`px-4 py-2 rounded-full font-semibold transition-colors ${
                                    walletType === "google"
                                        ? "bg-primary text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                                onClick={() =>
                                    setWalletType("google")
                                }
                            >
                                Google Wallet
                            </button>
                        </div>
                    </div>

                    <WalletFormInformation  walletType={walletType} />

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
            ) : null}

            <div
                className={`${
                    isTemplate ? "2xl:col-span-4" : "2xl:col-span-11"
                } col-span-1  lg:order-2 order-1`}
            >
                <div className="bg-white rounded-2xl shadow-box border border-[#EAECF0] sticky top-3">
                    <div className="p-5 border-b border-b-[#EAECF0] flex items-center justify-between gap-3 flex-wrap">
                        <h4 className="text-xl leading-tight font-semibold">
                            Live Wallet Preview
                        </h4>
                        {!isTemplate ? (
                            <>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <WalletEligibilityPill
                                        eligibility={
                                            wallet_eligibility?.eligible
                                        }
                                    />
                                    <WalletStatusPill
                                        status={wallet_status?.status}
                                    />
                                </div>
                            </>
                        ) : null}
                    </div>
                    <div className="px-5 pb-5 pt-4">
                        <WalletPreview isTemplate={isTemplate} walletType={walletType} />
                        {!isTemplate ? (
                            <>
                                <div className="space-y-3 mt-4">
                                    <p className="font-bold">
                                        Required Fields for Wallet Pass
                                    </p>
                                    <div className="space-y-1">
                                        {Array.isArray(
                                            wallet_eligibility?.missing_fields
                                        ) &&
                                        wallet_eligibility.missing_fields
                                            .length > 0 ? (
                                            wallet_eligibility.missing_fields.map(
                                                (field, idx) => {
                                                    const formatted = field
                                                        .replace(/_/g, " ")
                                                        .replace(/\b\w/g, (c) =>
                                                            c.toUpperCase()
                                                        );

                                                    return (
                                                        <p
                                                            className="text-red-700 text-sm font-semibold"
                                                            key={idx}
                                                        >
                                                            {formatted}
                                                        </p>
                                                    );
                                                }
                                            )
                                        ) : (
                                            <p className="font-semibold text-green-700 text-sm">
                                                All required fields filled!
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {isTemplate ? (
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
                                ) : null}
                            </>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}
