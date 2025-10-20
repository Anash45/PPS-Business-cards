import { useEffect, useState } from "react";
import { Trash2, Smile, ChevronDown } from "lucide-react";
import Picker from "emoji-picker-react";
import { GlobalProvider, useGlobal } from "@/context/GlobalProvider";
import TextInput from "./TextInput";
import Button from "./Button";
import ColorInput from "./ColorInput";
import InputLabel from "./InputLabel";
import { toast } from "react-hot-toast";
import {
    Accordion,
    AccordionBody,
    AccordionHeader,
} from "@material-tailwind/react";

export default function CardFormButtons() {
    const [open, setOpen] = useState(1);
    const [delayedClass, setDelayedClass] = useState(false);
    const { cardFormData, setCardFormData, isTemplate } =
        useGlobal(GlobalProvider);

    const [showPickerIndex, setShowPickerIndex] = useState(null);

    const handleOpen = (value) => setOpen(open === value ? 0 : value);

    useEffect(() => {
        let timer;
        if (open) {
            timer = setTimeout(() => setDelayedClass(true), 1000);
        } else {
            setDelayedClass(false);
        }
        return () => clearTimeout(timer);
    }, [open]);

    // ✅ Add new button
    const addButton = () => {
        const maxButtons = 4;

        // Count only buttons that belong to a card (card_id not null)
        const cardButtonsCount = (cardFormData.card_buttons || []).filter(
            (btn) => btn.card_id !== null
        ).length;

        if (!isTemplate && cardButtonsCount >= maxButtons) {
            toast.error("You can only add up to 4 buttons.");
            return;
        }

        const newButton = {
            button_text: "",
            button_link: "",
            icon: "",
        };

        const newList = [...(cardFormData.card_buttons || []), newButton];
        setCardFormData((prev) => ({
            ...prev,
            card_buttons: newList,
        }));
    };

    // ✅ Remove button
    const removeButton = (index) => {
        const item = cardFormData.card_buttons[index];

        // Restrict removal if company-owned and not in template mode
        if (!isTemplate && item.company_id && !item.card_id) {
            toast.error("You cannot delete company default buttons.");
            return;
        }

        const updated = cardFormData.card_buttons.filter((_, i) => i !== index);
        setCardFormData((prev) => ({
            ...prev,
            card_buttons: updated,
        }));
    };

    // ✅ Update button field
    const updateButtonField = (index, key, value) => {
        const updated = [...(cardFormData.card_buttons || [])];
        updated[index] = { ...updated[index], [key]: value };
        setCardFormData((prev) => ({
            ...prev,
            card_buttons: updated,
        }));
    };

    return (
        <Accordion
            className="border border-[#F4F4F5] rounded-2xl"
            open={open === 1}
            icon={
                <ChevronDown
                    id={1}
                    open={open}
                    className={`${
                        open ? "rotate-180" : ""
                    } transition text-[#71717A]`}
                />
            }
        >
            <AccordionHeader
                className={`py-3 ${delayedClass ? "remove-overflow" : ""} ${
                    open ? "rounded-t-2xl" : "rounded-2xl"
                } px-5 border-0 bg-[#F4FAF5] transition duration-500`}
                onClick={() => handleOpen(1)}
            >
                <div className="flex flex-col gap-1.5 font-public-sans">
                    <h5 className="font-semibold text-xl text-black">
                        Additional Buttons
                    </h5>
                    <p className="text-sm text-[#71717A] font-normal">
                        {isTemplate
                            ? "Add additional buttons to your template."
                            : "Add additional buttons to your card. Max 4 links."}
                    </p>
                </div>
            </AccordionHeader>
            <AccordionBody className="overflow-visible p-0">
                <div className="p-3 rounded-lg border border-[#EAECF0] space-y-3">
                    {(cardFormData.card_buttons || []).map((item, index) => (
                        <div key={index} className="space-y-2 relative">
                            {/* First Row: Emoji Picker + Text + Link + Delete */}
                            <div className="flex md:flex-row flex-col gap-3 md:items-center">
                                <div className="flex items-center gap-3 grow">
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
                                            {item.icon || (
                                                <Smile className="h-8 w-8 shrink-0" />
                                            )}
                                        </Button>
                                        {showPickerIndex === index && (
                                            <div className="absolute z-50 mt-2">
                                                <Picker
                                                    onEmojiClick={(
                                                        emojiData
                                                    ) => {
                                                        updateButtonField(
                                                            index,
                                                            "icon",
                                                            emojiData.emoji
                                                        );
                                                        setShowPickerIndex(
                                                            null
                                                        );
                                                    }}
                                                    theme="light"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Button Text */}
                                    <TextInput
                                        className="w-full"
                                        placeholder="Button Text"
                                        value={item.button_text || ""}
                                        onChange={(e) =>
                                            updateButtonField(
                                                index,
                                                "button_text",
                                                e.target.value
                                            )
                                        }
                                    />

                                    {/* Button Link */}
                                    <TextInput
                                        className="w-full"
                                        placeholder="Button URL"
                                        value={item.button_link || ""}
                                        onChange={(e) =>
                                            updateButtonField(
                                                index,
                                                "button_link",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>

                                {/* Delete Button */}
                                {(!item.company_id ||
                                    (item.company_id && isTemplate) ||
                                    item.card_id) && (
                                    <Button
                                        variant="danger-outline"
                                        className="w-fit ms-auto"
                                        onClick={() => removeButton(index)}
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                    <div className="flex items-center">
                        <Button
                            variant="primary-outline"
                            onClick={addButton}
                        >
                            Add New Button
                        </Button>
                    </div>
                </div>
            </AccordionBody>
        </Accordion>
    );
}
