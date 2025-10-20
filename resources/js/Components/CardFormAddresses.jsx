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
        <div className="p-3 rounded-lg border border-[#EAECF0] space-y-3">
            <div className="flex flex-wrap gap-4 justify-between items-center">
                <InputLabel
                    value={"Addresses"}
                    className="text-sm text-black font-medium"
                />
                <Button
                    variant="primary-outline"
                    onClick={addAddress}
                    className="ms-auto"
                >
                    Add New Address
                </Button>
            </div>

            {(cardFormData.card_addresses || []).map((item, index) => (
                <div key={index} className="space-y-2">
                    {/* First Row: Type + Street + House Number */}
                    <div className="flex md:flex-row flex-col gap-3 md:items-center">
                        <div className="gap-4 grow flex items-center">
                            <span className="shrink-0 text-xl">📍</span>

                            {/* ✅ Type Selector */}
                            <div className="w-[100px] shrink-0">
                                <SelectInput
                                    value={item.type || "Work"}
                                    onChange={(e) => {
                                        const newType = e.target
                                            ? e.target.value
                                            : e;
                                        updateAddressField(
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

                            {/* ✅ Street */}
                            <TextInput
                                className="w-full"
                                placeholder="Street"
                                value={item.street || ""}
                                onChange={(e) =>
                                    updateAddressField(
                                        index,
                                        "street",
                                        e.target.value
                                    )
                                }
                            />

                            {/* ✅ House Number */}
                            <TextInput
                                className="w-[100px]"
                                placeholder="No."
                                value={item.house_number || ""}
                                onChange={(e) =>
                                    updateAddressField(
                                        index,
                                        "house_number",
                                        e.target.value
                                    )
                                }
                            />
                        </div>

                        {/* Hidden Checkbox */}
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={item.is_hidden || false}
                                onChange={(e) =>
                                    updateAddressField(
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
                                onClick={() => removeAddress(index)}
                            >
                                <Trash2 className="h-5 w-5" />
                            </Button>
                        )}
                    </div>

                    {/* ✅ Second Row: ZIP + City + Country */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <TextInput
                            className="w-full sm:w-[150px]"
                            placeholder="ZIP"
                            value={item.zip || ""}
                            onChange={(e) =>
                                updateAddressField(index, "zip", e.target.value)
                            }
                        />
                        <TextInput
                            className="w-full sm:w-[250px]"
                            placeholder="City"
                            value={item.city || ""}
                            onChange={(e) =>
                                updateAddressField(
                                    index,
                                    "city",
                                    e.target.value
                                )
                            }
                        />
                        <TextInput
                            className="w-full sm:w-[250px]"
                            placeholder="Country"
                            value={item.country || ""}
                            onChange={(e) =>
                                updateAddressField(
                                    index,
                                    "country",
                                    e.target.value
                                )
                            }
                        />
                    </div>
                </div>
            ))}

            {/* Second Row: Color Pickers */}
            {isTemplate && cardFormData.card_addresses.length > 0 ? (
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
