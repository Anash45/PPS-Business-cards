import {
    Accordion,
    AccordionHeader,
    AccordionBody,
} from "@material-tailwind/react";
import { useEffect, useState } from "react";
import { ChevronDown, Phone, Smile, Trash2 } from "lucide-react";
import { GlobalProvider, useGlobal } from "@/context/GlobalProvider";
import Picker from "emoji-picker-react";
import TextInput from "./TextInput";
import Button from "./Button";
import ColorInput from "./ColorInput";
import { toast } from "react-hot-toast";
import InputLabel from "./InputLabel";
import SelectInput from "./SelectInput";

export default function CardFormPhoneNumbers() {
    const { cardFormData, setCardFormData, handleCardChange, isTemplate } =
        useGlobal(GlobalProvider);
    const [showPickerIndex, setShowPickerIndex] = useState(null);

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
            icon: "",
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
    console.log("Colors: ", cardFormData?.card_phone_numbers);

    return (
        <div className="p-3 rounded-lg border border-[#EAECF0] space-y-3 bg-white">
            <div className="flex flex-wrap gap-4 justify-between items-end">
                <InputLabel
                    value={"Phone Numbers"}
                    className="text-lg text-black font-semibold"
                />
                <Button
                    variant="primary-outline"
                    onClick={addPhoneNumber}
                    className="ms-auto"
                >
                    Add New Number
                </Button>
            </div>
            {(cardFormData.card_phone_numbers || []).map((item, index) => {
                const isReadOnly =
                    item.company_id && !isTemplate && item.card_id == null;

                return (
                    <div
                        key={index}
                        className="space-y-3 border-b border-gray-100 pb-3"
                    >
                        <div className="flex flex-col gap-3">
                            {/* ✅ Input Group */}
                            <div className="flex flex-wrap items-center gap-3 grow">
                                {/* Emoji Selector */}
                                <div className="relative">
                                    <Button
                                        variant="secondary"
                                        type="button"
                                        onClick={() =>
                                            setShowPickerIndex(
                                                showPickerIndex === index
                                                    ? null
                                                    : index
                                            )
                                        }
                                        className="w-10 h-10 flex items-center justify-center p-0 text-2xl"
                                    >
                                        <span className="text-xl">
                                            {item.icon || (
                                                <Smile className="h-8 w-8 shrink-0" />
                                            )}
                                        </span>
                                    </Button>
                                    {showPickerIndex === index && (
                                        <div className="absolute z-50 mt-2">
                                            <Picker
                                                onEmojiClick={(emojiData) => {
                                                    updatePhoneField(
                                                        index,
                                                        "icon",
                                                        emojiData.emoji
                                                    );
                                                    setShowPickerIndex(null);
                                                }}
                                                theme="light"
                                            />
                                        </div>
                                    )}
                                </div>

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
                                            updatePhoneField(
                                                index,
                                                "type",
                                                newType
                                            );
                                        }}
                                        disabled={isReadOnly}
                                        className="w-full block"
                                        placeholder="Type"
                                        options={[
                                            { value: "work", label: "Work" },
                                            { value: "home", label: "Home" },
                                            { value: "cell", label: "Mobil" },
                                        ]}
                                    />
                                </div>

                                {/* Label Field */}
                                <div className="w-full sm:flex-1 md:w-[200px]">
                                    <TextInput
                                        className="w-full"
                                        placeholder="Label (e.g. Office, Personal)"
                                        value={item.label || ""}
                                        onChange={(e) => {
                                            if (isReadOnly) return;
                                            updatePhoneField(
                                                index,
                                                "label",
                                                e.target.value
                                            );
                                        }}
                                        readOnly={isReadOnly}
                                    />
                                </div>
                                {/* Label Field */}
                                <div className="w-full sm:flex-1 md:w-[200px]">
                                    <TextInput
                                        className="w-full"
                                        placeholder="Label in german (z. B. Büro, Privat)"
                                        value={item.label_de || ""}
                                        onChange={(e) => {
                                            if (isReadOnly) return;
                                            updatePhoneField(
                                                index,
                                                "label_de",
                                                e.target.value
                                            );
                                        }}
                                        readOnly={isReadOnly}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 flex-wrap">
                                {/* Phone Number Field */}
                                <div className="w-full flex-1 min-w-[200px]">
                                    <TextInput
                                        className="w-full"
                                        placeholder="Enter phone number"
                                        value={item.phone_number || ""}
                                        onChange={(e) => {
                                            if (isReadOnly) return;
                                            updatePhoneField(
                                                index,
                                                "phone_number",
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
                                            updatePhoneField(
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
                                        className="w-fit shrink-0 ml-auto"
                                        onClick={() => {
                                            if (isReadOnly) return;
                                            removePhoneNumber(index);
                                        }}
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
                            htmlFor="phone_text_color"
                        />
                        <ColorInput
                            id="phone_text_color"
                            name="phone_text_color"
                            label="Text Color"
                            value={
                                cardFormData.phone_text_color ||
                                cardFormData.btn_text_color
                            }
                            onChange={(e) => handleCardChange(e)}
                        />
                    </div>
                    <div className="space-y-1">
                        <InputLabel
                            className="text-black text-sm font-medium"
                            value={"Background Color"}
                            htmlFor="phone_bg_color"
                        />
                        <ColorInput
                            id="phone_bg_color"
                            name="phone_bg_color"
                            label="Background Color"
                            value={
                                cardFormData.phone_bg_color ||
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
