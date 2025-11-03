import { useState } from "react";
import { MapPin, Trash2 } from "lucide-react";
import { GlobalProvider, useGlobal } from "@/context/GlobalProvider";
import TextInput from "./TextInput";
import Button from "./Button";
import ColorInput from "./ColorInput";
import { toast } from "react-hot-toast";
import InputLabel from "./InputLabel";
import SelectInput from "./SelectInput";

export default function CardFormAddresses() {
    const { cardFormData, setCardFormData, handleCardChange, isTemplate } =
        useGlobal(GlobalProvider);

    // ✅ Add new address
    const addAddress = () => {
        const maxAddresses = 4;

        if (
            !isTemplate &&
            (cardFormData.card_addresses?.length || 0) >= maxAddresses
        ) {
            toast.error("You can only add up to 4 addresses.");
            return;
        }

        const newAddress = {
            type: "Work",
            address: "",
            is_hidden: false,
            text_color: cardFormData.btn_text_color || "#000000",
            bg_color: cardFormData.btn_bg_color || "#FFFFFF",
        };

        const newList = [...(cardFormData.card_addresses || []), newAddress];
        setCardFormData((prev) => ({
            ...prev,
            card_addresses: newList,
        }));
    };

    // ✅ Remove address
    const removeAddress = (index) => {
        const item = cardFormData.card_addresses[index];

        // Restrict removal if company-owned and not in template mode
        if (!isTemplate && item.company_id && !item.card_id) {
            toast.error("You cannot delete company default addresses.");
            return;
        }

        const updated = cardFormData.card_addresses.filter(
            (_, i) => i !== index
        );
        setCardFormData((prev) => ({
            ...prev,
            card_addresses: updated,
        }));
    };

    // ✅ Update address field
    const updateAddressField = (index, key, value) => {
        const updated = [...(cardFormData.card_addresses || [])];
        updated[index] = { ...updated[index], [key]: value };
        setCardFormData((prev) => ({
            ...prev,
            card_addresses: updated,
        }));
    };

    return (
        <div className="p-3 rounded-lg border border-[#EAECF0] space-y-3 bg-white">
            <div className="flex flex-wrap gap-4 justify-between items-end">
                <InputLabel
                    value={"Addresses"}
                    className="text-lg text-black font-semibold"
                />
                <Button
                    variant="primary-outline"
                    onClick={addAddress}
                    className="ms-auto"
                >
                    Add New Address
                </Button>
            </div>

            {(cardFormData.card_addresses || []).map((item, index) => {
                const isReadOnly =
                    item.company_id && !isTemplate && item.card_id == null;

                return (
                    <div
                        key={index}
                        className="space-y-3 border-b border-gray-100 pb-3"
                    >
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className="shrink-0 text-xl w-9">📍</span>

                            {/* Type Selector */}
                            <div className="w-full sm:w-[120px] shrink-0">
                                <SelectInput
                                    value={item.type?.toLowerCase() || "work"}
                                    onChange={(e) => {
                                        if (isReadOnly) return;
                                        const newType = e.target
                                            ? e.target.value
                                            : e;
                                        updateAddressField(
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
                                    ]}
                                />
                            </div>

                            {/* Label Field */}
                            <div className="w-full sm:flex-1 md:w-full">
                                <TextInput
                                    className="w-full"
                                    placeholder="Label (e.g. Office, HQ)"
                                    value={item.label || ""}
                                    onChange={(e) => {
                                        if (isReadOnly) return;
                                        updateAddressField(
                                            index,
                                            "label",
                                            e.target.value
                                        );
                                    }}
                                    readOnly={isReadOnly}
                                />
                            </div>
                        </div>
                        {/* ✅ First Row: Type + Label + Street + House Number */}
                        <div className="flex flex-col md:flex-row md:items-center gap-3">
                            <div className="grid gap-3 2xl:grid-cols-3 xl:grid-cols-2 md:grid-cols-3 sm:grid-cols-2 grow">
                                {/* Street */}
                                <div>
                                    <TextInput
                                        className="w-full"
                                        placeholder="Street"
                                        value={item.street || ""}
                                        onChange={(e) => {
                                            if (isReadOnly) return;
                                            updateAddressField(
                                                index,
                                                "street",
                                                e.target.value
                                            );
                                        }}
                                        readOnly={isReadOnly}
                                    />
                                </div>

                                {/* House Number */}
                                <div>
                                    <TextInput
                                        className="w-full"
                                        placeholder="No."
                                        value={item.house_number || ""}
                                        onChange={(e) => {
                                            if (isReadOnly) return;
                                            updateAddressField(
                                                index,
                                                "house_number",
                                                e.target.value
                                            );
                                        }}
                                        readOnly={isReadOnly}
                                    />
                                </div>
                                <TextInput
                                    placeholder="ZIP"
                                    value={item.zip || ""}
                                    onChange={(e) => {
                                        if (isReadOnly) return;
                                        updateAddressField(
                                            index,
                                            "zip",
                                            e.target.value
                                        );
                                    }}
                                    readOnly={isReadOnly}
                                />
                                <TextInput
                                    placeholder="City"
                                    value={item.city || ""}
                                    onChange={(e) => {
                                        if (isReadOnly) return;
                                        updateAddressField(
                                            index,
                                            "city",
                                            e.target.value
                                        );
                                    }}
                                    readOnly={isReadOnly}
                                />
                                <TextInput
                                    placeholder="Country"
                                    value={item.country || ""}
                                    onChange={(e) => {
                                        if (isReadOnly) return;
                                        updateAddressField(
                                            index,
                                            "country",
                                            e.target.value
                                        );
                                    }}
                                    readOnly={isReadOnly}
                                />
                                <div className="flex items-center gap-3 justify-end">
                                    {/* Hidden Checkbox */}
                                    <label className="flex items-center gap-2 shrink-0">
                                        <input
                                            type="checkbox"
                                            checked={item.is_hidden || false}
                                            onChange={(e) => {
                                                if (isReadOnly) return;
                                                updateAddressField(
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
                                            onClick={() => {
                                                if (isReadOnly) return;
                                                removeAddress(index);
                                            }}
                                            disabled={isReadOnly}
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </Button>
                                    )}
                                </div>
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
                            htmlFor="address_text_color"
                        />
                        <ColorInput
                            id="address_text_color"
                            name="address_text_color"
                            label="Text Color"
                            value={
                                cardFormData.address_text_color ||
                                cardFormData.btn_text_color
                            }
                            onChange={(e) => handleCardChange(e)}
                        />
                    </div>
                    <div className="space-y-1">
                        <InputLabel
                            className="text-black text-sm font-medium"
                            value={"Background Color"}
                            htmlFor="address_bg_color"
                        />
                        <ColorInput
                            id="address_bg_color"
                            name="address_bg_color"
                            label="Background Color"
                            value={
                                cardFormData.address_bg_color ||
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
