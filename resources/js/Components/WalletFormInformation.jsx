import {
    Accordion,
    AccordionHeader,
    AccordionBody,
} from "@material-tailwind/react";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import InputLabel from "./InputLabel";
import TextInput from "./TextInput";
import SelectInput from "./SelectInput";
import { GlobalProvider, useGlobal } from "@/context/GlobalProvider";
import ColorInput from "./ColorInput";
import CardImageUploader from "./CardImagesUploader";
import card from "@material-tailwind/react/theme/components/card";

export default function WalletFormInformation({ walletType }) {
    const [open, setOpen] = useState(1);
    const [delayedClass, setDelayedClass] = useState(false);
    useEffect(() => {
        let timer;

        if (open) {
            // Add class after 1 second
            timer = setTimeout(() => {
                setDelayedClass(true);
            }, 1000);
        } else {
            // Remove class immediately
            setDelayedClass(false);
        }

        return () => clearTimeout(timer);
    }, [open]);

    const handleOpen = (value) => setOpen(open === value ? 0 : value);

    const { cardFormData, handleCardChange, isTemplate } =
        useGlobal(GlobalProvider);

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
                        Wallet Information
                    </h5>
                    <p className="text-sm text-[#71717A] font-normal">
                        {isTemplate
                            ? "Wallet information for template."
                            : "Wallet information for card."}
                    </p>
                </div>
            </AccordionHeader>
            <AccordionBody className="overflow-visible p-0">
                <div className="p-5 space-y-4">
                    <div className="p-3 rounded-lg grid grid-cols-1 gap-4 border border-[#EAECF0]">
                        <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
                            <div className="space-y-1">
                                <InputLabel
                                    className="text-black text-sm font-medium"
                                    value={"Wallet BG Color"}
                                    isDemo={!isTemplate}
                                />
                                <ColorInput
                                    id="wallet_bg_color"
                                    value={cardFormData.wallet_bg_color}
                                    onChange={(e) => handleCardChange(e)}
                                    name="wallet_bg_color"
                                    className="w-full"
                                />
                            </div>
                            {walletType === "apple" ? (
                                <div className="space-y-1">
                                    <InputLabel
                                        className="text-black text-sm font-medium"
                                        value={"Wallet Text Color"}
                                        isDemo={!isTemplate}
                                    />
                                    <ColorInput
                                        id="wallet_text_color"
                                        value={cardFormData.wallet_text_color}
                                        onChange={(e) => handleCardChange(e)}
                                        name="wallet_text_color"
                                        className="w-full"
                                    />
                                </div>
                            ) : null}
                        </div>
                        {isTemplate ? (
                            <div className="space-y-1">
                                <InputLabel
                                    className="text-black text-sm font-medium"
                                    value={"Wallet Logo Image"}
                                />
                                <CardImageUploader
                                    name="wallet_logo_image"
                                    value={
                                        cardFormData.wallet_logo_image ??
                                        cardFormData.wallet_logo_image_url
                                    }
                                    onChange={handleCardChange}
                                    label="Logo Image"
                                />
                            </div>
                        ) : null}
                    </div>
                    <div className="p-3 rounded-lg grid sm:grid-cols-2 gap-4 border border-[#EAECF0]">
                        <div className="space-y-1">
                            <InputLabel
                                className="text-black text-sm font-medium"
                                isDemo={!isTemplate}
                                value={"Label 1 - Name"}
                            />
                            <TextInput
                                id="wallet_label_1"
                                value={cardFormData.wallet_label_1}
                                onChange={(e) => handleCardChange(e)}
                                name="wallet_label_1"
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-1">
                            <InputLabel
                                className="text-black text-sm font-medium"
                                isDemo={!isTemplate}
                                value={"Label 2 - Company Name"}
                            />
                            <TextInput
                                id="wallet_label_2"
                                value={cardFormData.wallet_label_2}
                                onChange={(e) => handleCardChange(e)}
                                name="wallet_label_2"
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-1">
                            <InputLabel
                                className="text-black text-sm font-medium"
                                isDemo={!isTemplate}
                                value={"Label 3 - Titel"}
                            />
                            <TextInput
                                id="wallet_label_3"
                                value={cardFormData.wallet_label_3}
                                onChange={(e) => handleCardChange(e)}
                                name="wallet_label_3"
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-1">
                            <InputLabel
                                className="text-black text-sm font-medium"
                                isDemo={!isTemplate}
                                value={"Pass Title"}
                            />
                            <TextInput
                                id="wallet_title"
                                value={cardFormData.wallet_title}
                                onChange={(e) => handleCardChange(e)}
                                name="wallet_title"
                                className="w-full"
                            />
                        </div>
                    </div>
                    <div className="p-3 rounded-lg grid sm:grid-cols-2 gap-4 border border-[#EAECF0]">
                        <div className="space-y-1">
                            <InputLabel
                                className="text-black text-sm font-medium"
                                isDemo={true}
                                value={"Name"}
                            />
                            <TextInput
                                id="wallet_name"
                                value={cardFormData.wallet_name}
                                onChange={(e) => handleCardChange(e)}
                                name="wallet_name"
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-1">
                            <InputLabel
                                className="text-black text-sm font-medium"
                                isDemo={true}
                                value={
                                    "Primary Email (Used to send wallet pass)"
                                }
                            />
                            <TextInput
                                id="primary_email"
                                value={cardFormData.primary_email}
                                onChange={(e) => handleCardChange(e)}
                                name="primary_email"
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-1">
                            <InputLabel
                                className="text-black text-sm font-medium"
                                isDemo={true}
                                value={"Company Name"}
                            />
                            <TextInput
                                id="wallet_company_name"
                                value={cardFormData.wallet_company_name}
                                name="wallet_company_name"
                                onChange={(e) => handleCardChange(e)}
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-1">
                            <InputLabel
                                className="text-black text-sm font-medium"
                                isDemo={true}
                                value={"Titel"}
                            />
                            <TextInput
                                id="wallet_position"
                                value={cardFormData.wallet_position}
                                name="wallet_position"
                                onChange={(e) => handleCardChange(e)}
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-1">
                            <InputLabel
                                className="text-black text-sm font-medium"
                                isDemo={!isTemplate}
                                value={"QR-Caption (max. 18 Zeichen)"}
                            />
                            <TextInput
                                id="wallet_qr_caption"
                                value={cardFormData.wallet_qr_caption}
                                name="wallet_qr_caption"
                                onChange={(e) => handleCardChange(e)}
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>
            </AccordionBody>
        </Accordion>
    );
}
