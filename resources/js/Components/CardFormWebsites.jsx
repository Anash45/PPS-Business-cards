import { Trash2 } from "lucide-react";
import { GlobalProvider, useGlobal } from "@/context/GlobalProvider";
import TextInput from "./TextInput";
import Picker from "emoji-picker-react";
import Button from "./Button";
import ColorInput from "./ColorInput";
import { toast } from "react-hot-toast";
import InputLabel from "./InputLabel";
import { useState } from "react";

export default function CardFormWebsites() {
    const { cardFormData, setCardFormData, handleCardChange, isTemplate } =
        useGlobal(GlobalProvider);
    const [showPickerIndex, setShowPickerIndex] = useState(null);

    // ✅ Add new website
    const addWebsite = () => {
        const maxWebsites = 4;

        if (
            !isTemplate &&
            (cardFormData.card_websites?.length || 0) >= maxWebsites
        ) {
            toast.error("You can only add up to 4 website links.");
            return;
        }

        const newWebsite = {
            label: "",
            url: "",
            is_hidden: false,
            text_color: cardFormData.btn_text_color || "#000000",
            bg_color: cardFormData.btn_bg_color || "#FFFFFF",
        };

        const newList = [...(cardFormData.card_websites || []), newWebsite];
        setCardFormData((prev) => ({
            ...prev,
            card_websites: newList,
        }));
    };

    // ✅ Remove website
    const removeWebsite = (index) => {
        const item = cardFormData.card_websites[index];

        if (!isTemplate && item.company_id && !item.card_id) {
            toast.error("You cannot delete company default websites.");
            return;
        }

        const updated = cardFormData.card_websites.filter(
            (_, i) => i !== index
        );
        setCardFormData((prev) => ({
            ...prev,
            card_websites: updated,
        }));
    };

    // ✅ Update field
    const updateWebsiteField = (index, key, value) => {
        const updated = [...(cardFormData.card_websites || [])];
        updated[index] = { ...updated[index], [key]: value };
        setCardFormData((prev) => ({
            ...prev,
            card_websites: updated,
        }));
    };

    return (
        <div className="p-3 rounded-lg border border-[#EAECF0] space-y-3 bg-white">
            <div className="flex flex-wrap gap-4 justify-between items-end">
                <InputLabel
                    value={"Websites"}
                    className="text-lg text-black font-semibold"
                />
                <Button
                    variant="primary-outline"
                    onClick={addWebsite}
                    className="ms-auto"
                >
                    Add New Website
                </Button>
            </div>

            {(cardFormData.card_websites || []).map((item, index) => {
                const isReadOnly =
                    item.company_id && !item.card_id && !isTemplate;

                return (
                    <div
                        key={index}
                        className="space-y-3 border-b border-gray-100 pb-3"
                    >
                        {/* Row Container */}
                        <div className="flex flex-col lg:flex-row md:items-center gap-3">
                            <div className="flex items-center gap-3 grow w-full">
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
                                            {item.icon || <span>🌐</span>}
                                        </span>
                                    </Button>
                                    {showPickerIndex === index && (
                                        <div className="absolute z-50 mt-2">
                                            <Picker
                                                onEmojiClick={(emojiData) => {
                                                    updateWebsiteField(
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

                                {/* Label */}
                                <div className="w-full">
                                    <TextInput
                                        className="w-full"
                                        placeholder="Label (e.g. Company Site)"
                                        value={item.label || ""}
                                        onChange={(e) => {
                                            if (isReadOnly) return;
                                            updateWebsiteField(
                                                index,
                                                "label",
                                                e.target.value
                                            );
                                        }}
                                        readOnly={isReadOnly}
                                    />
                                </div>
                                {/* Label */}
                                <div className="w-full">
                                    <TextInput
                                        className="w-full"
                                        placeholder="Label in german (z. B. Unternehmensseite)"
                                        value={item.label_de || ""}
                                        onChange={(e) => {
                                            if (isReadOnly) return;
                                            updateWebsiteField(
                                                index,
                                                "label_de",
                                                e.target.value
                                            );
                                        }}
                                        readOnly={isReadOnly}
                                    />
                                </div>
                            </div>

                            {/* URL */}
                            <div className="w-full">
                                <TextInput
                                    className="w-full"
                                    placeholder="Enter website URL"
                                    value={item.url || ""}
                                    onChange={(e) => {
                                        if (isReadOnly) return;
                                        updateWebsiteField(
                                            index,
                                            "url",
                                            e.target.value
                                        );
                                    }}
                                    readOnly={isReadOnly}
                                />
                            </div>

                            <div className="flex gap-2 ml-auto">
                                {/* Hidden Checkbox */}
                                <label className="flex items-center gap-2 shrink-0">
                                    <input
                                        type="checkbox"
                                        checked={item.is_hidden || false}
                                        onChange={(e) => {
                                            if (isReadOnly) return;
                                            updateWebsiteField(
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
                                        onClick={() => removeWebsite(index)}
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

            {/* Color Pickers for Template Mode */}
            {isTemplate ? (
                <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <InputLabel
                            className="text-black text-sm font-medium"
                            value={"Text Color"}
                            htmlFor="website_text_color"
                        />
                        <ColorInput
                            id="website_text_color"
                            name="website_text_color"
                            label="Text Color"
                            value={
                                cardFormData.website_text_color ??
                                cardFormData.btn_text_color
                            }
                            onChange={(e) => handleCardChange(e)}
                        />
                    </div>
                    <div className="space-y-1">
                        <InputLabel
                            className="text-black text-sm font-medium"
                            value={"Background Color"}
                            htmlFor="website_bg_color"
                        />
                        <ColorInput
                            id="website_bg_color"
                            name="website_bg_color"
                            label="Background Color"
                            value={
                                cardFormData.website_bg_color ??
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
