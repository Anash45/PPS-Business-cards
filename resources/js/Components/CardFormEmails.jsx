import { useState } from "react";
import { Mail, Trash2 } from "lucide-react";
import { GlobalProvider, useGlobal } from "@/context/GlobalProvider";
import TextInput from "./TextInput";
import Button from "./Button";
import ColorInput from "./ColorInput";
import { toast } from "react-hot-toast";
import InputLabel from "./InputLabel";
import SelectInput from "./SelectInput";

export default function CardFormEmails() {
    const { cardFormData, setCardFormData, handleCardChange, isTemplate } =
        useGlobal(GlobalProvider);

    // ✅ Add new email
    const addEmail = () => {
        const maxEmails = 4;

        if (
            !isTemplate &&
            (cardFormData.card_emails?.length || 0) >= maxEmails
        ) {
            toast.error("You can only add up to 4 email addresses.");
            return;
        }

        const newEmail = {
            type: "Work",
            email: "",
            is_hidden: false,
            text_color: cardFormData.btn_text_color || "#000000",
            bg_color: cardFormData.btn_bg_color || "#FFFFFF",
        };

        const newList = [...(cardFormData.card_emails || []), newEmail];
        setCardFormData((prev) => ({
            ...prev,
            card_emails: newList,
        }));
    };

    // ✅ Remove email
    const removeEmail = (index) => {
        const item = cardFormData.card_emails[index];

        // Restrict removal if company-owned and not in template mode
        if (!isTemplate && item.company_id && !item.card_id) {
            toast.error("You cannot delete company default emails.");
            return;
        }

        const updated = cardFormData.card_emails.filter((_, i) => i !== index);
        setCardFormData((prev) => ({
            ...prev,
            card_emails: updated,
        }));
    };

    // ✅ Update email field
    const updateEmailField = (index, key, value) => {
        const updated = [...(cardFormData.card_emails || [])];
        updated[index] = { ...updated[index], [key]: value };
        setCardFormData((prev) => ({
            ...prev,
            card_emails: updated,
        }));
    };


    return (
        <div className="p-3 rounded-lg border border-[#EAECF0] space-y-3">
            <div className="flex flex-wrap gap-4 justify-between items-center">
                <InputLabel
                    value={"Email Addresses"}
                    className="text-sm text-black font-medium"
                />
                <Button
                    variant="primary-outline"
                    onClick={addEmail}
                    className="ms-auto"
                >
                    Add New Email
                </Button>
            </div>

            {(cardFormData.card_emails || []).map((item, index) => (
                <div key={index} className="space-y-2">
                    {/* First Row: Input + Checkbox + Trash */}
                    <div className="flex md:flex-row flex-col gap-3 md:items-center">
                        <div className="gap-4 grow flex items-center">
                            <span className="shrink-0 text-xl">✉️</span>

                            {/* ✅ Type Selector */}
                            <div className="w-[100px] shrink-0">
                                <SelectInput
                                    value={item.type || "Work"}
                                    onChange={(e) => {
                                        const newType = e.target
                                            ? e.target.value
                                            : e; // handle both normal and custom selects
                                        updateEmailField(
                                            index,
                                            "type",
                                            newType
                                        );
                                    }}
                                    className="w-full block"
                                    placeholder="Type"
                                    options={[
                                        { value: "Work", label: "Work" },
                                        { value: "Home", label: "Home" },
                                    ]}
                                />
                            </div>
                            <TextInput
                                className="w-full"
                                placeholder="Enter email address"
                                value={item.email || ""}
                                onChange={(e) =>
                                    updateEmailField(
                                        index,
                                        "email",
                                        e.target.value
                                    )
                                }
                            />
                        </div>

                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={item.is_hidden || false}
                                onChange={(e) =>
                                    updateEmailField(
                                        index,
                                        "is_hidden",
                                        e.target.checked
                                    )
                                }
                            />
                            <span className="text-sm text-[#71717A]">
                                Hidden
                            </span>
                        </label>

                        {/* Delete button */}
                        {(!item.company_id ||
                            (item.company_id && isTemplate) ||
                            item.card_id) && (
                            <Button
                                variant="danger-outline"
                                className="w-fit ms-auto"
                                onClick={() => removeEmail(index)}
                            >
                                <Trash2 className="h-5 w-5" />
                            </Button>
                        )}
                    </div>
                </div>
            ))}

            {/* Second Row: Color Pickers */}
            {isTemplate && cardFormData.card_emails.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <InputLabel
                            className="text-black text-sm font-medium"
                            value={"Text Color"}
                            htmlFor="email_text_color"
                        />
                        <ColorInput
                            id="email_text_color"
                            name="email_text_color"
                            label="Text Color"
                            value={
                                cardFormData?.email_text_color ??
                                cardFormData?.btn_text_color
                            }
                            onChange={(e) => handleCardChange(e)}
                        />
                    </div>
                    <div className="space-y-1">
                        <InputLabel
                            className="text-black text-sm font-medium"
                            value={"Background Color"}
                            htmlFor="email_bg_color"
                        />
                        <ColorInput
                            id="email_bg_color"
                            name="email_bg_color"
                            label="Background Color"
                            value={
                                cardFormData.email_bg_color ||
                                cardFormData.btn_bg_color
                            }
                            onChange={(e) => handleCardChange(e)}
                        />
                    </div>
                </div>
            ) : null}
        </div>
    );
}
