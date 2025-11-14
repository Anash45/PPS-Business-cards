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
        <div className="p-3 rounded-lg border border-[#EAECF0] space-y-3 bg-white">
            <div className="flex flex-wrap gap-4 justify-between items-end">
                <InputLabel
                    value={"Email Addresses"}
                    className="text-lg text-black font-semibold"
                />
                <Button
                    variant="primary-outline"
                    onClick={addEmail}
                    className="ms-auto"
                >
                    Add New Email
                </Button>
            </div>

            {(cardFormData.card_emails || []).map((item, index) => {
                const isReadOnly =
                    item.company_id && !item.card_id && !isTemplate;

                return (
                    <div
                        key={index}
                        className="space-y-3 border-b border-gray-100 pb-3"
                    >
                        {/* Row Container */}
                        <div className="flex flex-col gap-3">
                            {/* ✅ Inputs Group */}
                            <div className="flex sm:flex-nowrap flex-wrap items-center gap-3 grow">
                                <span className="shrink-0 text-xl">✉️</span>

                                {/* Type Selector */}
                                <div className="w-full sm:w-[120px] shrink-0">
                                    <SelectInput
                                        value={
                                            item?.type?.toLowerCase() || "work"
                                        }
                                        onChange={(e) => {
                                            if (isReadOnly) return;
                                            const newType = e.target
                                                ? e.target.value
                                                : e;
                                            updateEmailField(
                                                index,
                                                "type",
                                                newType
                                            );
                                        }}
                                        className="w-full block"
                                        placeholder="Type"
                                        options={[
                                            { value: "work", label: "Work" },
                                            { value: "home", label: "Home" },
                                        ]}
                                        disabled={isReadOnly}
                                    />
                                </div>

                                {/* Label Field */}
                                <div className="w-full">
                                    <TextInput
                                        className="w-full"
                                        placeholder="Label (e.g. Office, Personal)"
                                        value={item.label || ""}
                                        onChange={(e) => {
                                            if (isReadOnly) return;
                                            updateEmailField(
                                                index,
                                                "label",
                                                e.target.value
                                            );
                                        }}
                                        readOnly={isReadOnly}
                                    />
                                </div>
                                {/* Label Field */}
                                <div className="w-full">
                                    <TextInput
                                        className="w-full"
                                        placeholder="Label in german (z. B. Büro, Privat)"
                                        value={item.label_de || ""}
                                        onChange={(e) => {
                                            if (isReadOnly) return;
                                            updateEmailField(
                                                index,
                                                "label_de",
                                                e.target.value
                                            );
                                        }}
                                        readOnly={isReadOnly}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 ml-auto w-full">
                                {/* Email Field */}
                                <div className="w-full sm:flex-1 md:w-[200px]">
                                    <TextInput
                                        className="w-full"
                                        placeholder="Enter email address"
                                        value={item.email || ""}
                                        onChange={(e) => {
                                            if (isReadOnly) return;
                                            updateEmailField(
                                                index,
                                                "email",
                                                e.target.value
                                            );
                                        }}
                                        readOnly={isReadOnly}
                                    />
                                </div>
                                {/* Hidden Checkbox */}
                                <label className="flex items-center gap-2 shrink-0">
                                    <input
                                        type="checkbox"
                                        checked={item.is_hidden || false}
                                        onChange={(e) => {
                                            if (isReadOnly) return;
                                            updateEmailField(
                                                index,
                                                "is_hidden",
                                                e.target.checked
                                            );
                                        }}
                                        disabled={isReadOnly}
                                    />
                                    <span className="text-sm text-[#71717A]">
                                        Hidden
                                    </span>
                                </label>

                                {/* Delete Button */}
                                {(!item.company_id ||
                                    (item.company_id && isTemplate) ||
                                    item.card_id) && (
                                    <Button
                                        variant="danger-outline"
                                        className="w-fit shrink-0"
                                        onClick={() => removeEmail(index)}
                                        disabled={isReadOnly}
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* Second Row: Color Pickers */}
            {isTemplate ? (
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
