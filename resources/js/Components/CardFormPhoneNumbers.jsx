import {
    Accordion,
    AccordionHeader,
    AccordionBody,
} from "@material-tailwind/react";
import { useEffect, useState } from "react";
import { ChevronDown, Phone, Trash2 } from "lucide-react";
import { GlobalProvider, useGlobal } from "@/context/GlobalProvider";
import TextInput from "./TextInput";
import Button from "./Button";
import ColorInput from "./ColorInput";
import { toast } from "react-hot-toast";
import InputLabel from "./InputLabel";
import SelectInput from "./SelectInput";

export default function CardFormPhoneNumbers() {
    const { cardFormData, setCardFormData, isTemplate } =
        useGlobal(GlobalProvider);

    // ✅ Add new phone number
    const addPhoneNumber = () => {
        const maxNumbers = 4;

        if (
            !isTemplate &&
            (cardFormData.card_phone_numbers?.length || 0) >= maxNumbers
        ) {
            toast.error("You can only add up to 4 phone numbers.");
            return;
        }

        const newPhone = {
            type: "Work",
            phone_number: "",
            is_hidden: false,
            text_color: cardFormData.btn_text_color || "#000000",
            bg_color: cardFormData.btn_bg_color || "#FFFFFF",
        };

        const newList = [...(cardFormData.card_phone_numbers || []), newPhone];
        setCardFormData((prev) => ({
            ...prev,
            card_phone_numbers: newList,
        }));
    };

    // ✅ Remove phone number
    const removePhoneNumber = (index) => {
        const item = cardFormData.card_phone_numbers[index];

        // Restrict removal if it’s company-owned and not in template mode
        if (!isTemplate && item.company_id && !item.card_id) {
            toast.error("You cannot delete company default phone numbers.");
            return;
        }

        const updated = cardFormData.card_phone_numbers.filter(
            (_, i) => i !== index
        );
        setCardFormData((prev) => ({
            ...prev,
            card_phone_numbers: updated,
        }));
    };

    // ✅ Update phone field
    const updatePhoneField = (index, key, value) => {
        const updated = [...(cardFormData.card_phone_numbers || [])];
        updated[index] = { ...updated[index], [key]: value };
        setCardFormData((prev) => ({
            ...prev,
            card_phone_numbers: updated,
        }));
    };
    // console.log("Phone: ", cardFormData);

    return (
        <div className="p-3 rounded-lg border border-[#EAECF0] space-y-3">
            <div className="flex flex-wrap gap-4 justify-between items-center">
                <InputLabel
                    value={"Phone Numbers"}
                    className="text-sm text-black font-medium"
                />
                <Button
                    variant="primary-outline"
                    onClick={addPhoneNumber}
                    className="ms-auto"
                >
                    Add New Number
                </Button>
            </div>
            {(cardFormData.card_phone_numbers || []).map((item, index) => (
                <div key={index} className="space-y-2">
                    {/* First Row: Input + Checkbox + Trash */}
                    <div className="flex md:flex-row flex-col gap-3 md:items-center">
                        <div className="gap-4 grow flex items-center">
                            <span className="shrink-0 text-xl w-9">📞</span>

                            {/* ✅ Type Selector */}
                            <div className="w-[125px]">
                                <SelectInput
                                    value={item.type || "Work"}
                                    onChange={(e) => {
                                        const newType = e.target
                                            ? e.target.value
                                            : e; // handle both normal and custom selects
                                        updatePhoneField(
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

                            {/* ✅ Phone number input */}
                            <TextInput
                                className="w-full"
                                placeholder="Enter phone number"
                                value={item.phone_number || ""}
                                onChange={(e) =>
                                    updatePhoneField(
                                        index,
                                        "phone_number",
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
                                    updatePhoneField(
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
                                onClick={() => removePhoneNumber(index)}
                            >
                                <Trash2 className="h-5 w-5" />
                            </Button>
                        )}
                    </div>

                    {/* Second Row: Color Pickers */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <ColorInput
                            label="Text Color"
                            value={
                                item.text_color ||
                                cardFormData.btn_text_color ||
                                "#000000"
                            }
                            onChange={(e) =>
                                updatePhoneField(
                                    index,
                                    "text_color",
                                    e.target.value
                                )
                            }
                        />
                        <ColorInput
                            label="Background Color"
                            value={
                                item.bg_color ||
                                cardFormData.btn_bg_color ||
                                "#FFFFFF"
                            }
                            onChange={(e) =>
                                updatePhoneField(
                                    index,
                                    "bg_color",
                                    e.target.value
                                )
                            }
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
