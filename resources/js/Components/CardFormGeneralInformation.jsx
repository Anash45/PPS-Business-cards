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
import CardFormPhoneNumbers from "./CardFormPhoneNumbers";
import CardFormEmails from "./CardFormEmails";
import CardFormAddresses from "./CardFormAddresses";

export default function CardFormGeneralInformation() {
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

    const { cardFormData, handleCardChange, setCardFormData } =
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
                        General Information
                    </h5>
                    <p className="text-sm text-[#71717A] font-normal">
                        Company details, personal details...
                    </p>
                </div>
            </AccordionHeader>
            <AccordionBody className="overflow-visible p-0">
                <div className="p-5 space-y-4">
                    <div className="p-3 rounded-lg grid md:grid-cols-3 sm:grid-cols-2 gap-4 border border-[#EAECF0]">
                        <div className="space-y-1">
                            <InputLabel
                                className="text-black text-sm font-medium"
                                value={"Salutation"}
                            />
                            <SelectInput
                                id="salutation"
                                name="salutation"
                                value={cardFormData.salutation}
                                onChange={(e) => handleCardChange(e)}
                                className="w-full block"
                                placeholder="Select status"
                                options={[
                                    {
                                        value: "Mr.",
                                        label: "Mr.",
                                    },
                                    {
                                        value: "Ms.",
                                        label: "Ms.",
                                    },
                                    {
                                        value: "Mrs.",
                                        label: "Mrs.",
                                    },
                                ]}
                            />
                        </div>
                        <div className="space-y-1">
                            <InputLabel
                                className="text-black text-sm font-medium"
                                value={"Title"}
                            />
                            <TextInput
                                id="title"
                                value={cardFormData.title}
                                onChange={(e) => handleCardChange(e)}
                                name="title"
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-1">
                            <InputLabel
                                className="text-black text-sm font-medium"
                                value={"Name Color"}
                            />
                            <ColorInput
                                id="name_text_color"
                                value={cardFormData.name_text_color}
                                onChange={(e) => handleCardChange(e)}
                                name="name_text_color"
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-1">
                            <InputLabel
                                className="text-black text-sm font-medium"
                                value={"First name"}
                            />
                            <TextInput
                                id="first_name"
                                value={cardFormData.first_name}
                                onChange={(e) => handleCardChange(e)}
                                name="first_name"
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-1">
                            <InputLabel
                                className="text-black text-sm font-medium"
                                value={"Last name"}
                            />
                            <TextInput
                                id="last_name"
                                value={cardFormData.last_name}
                                onChange={(e) => handleCardChange(e)}
                                name="last_name"
                                className="w-full"
                            />
                        </div>
                    </div>
                    <div className="p-3 rounded-lg grid md:grid-cols-3 sm:grid-cols-2 gap-4 border border-[#EAECF0]">
                        <div className="space-y-1">
                            <InputLabel
                                className="text-black text-sm font-medium"
                                value={"Page BG Color"}
                            />
                            <ColorInput
                                id="card_bg_color"
                                value={cardFormData.card_bg_color}
                                onChange={(e) => handleCardChange(e)}
                                name="card_bg_color"
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-1">
                            <InputLabel
                                className="text-black text-sm font-medium"
                                value={"Buttons BG Color"}
                            />
                            <ColorInput
                                id="btn_bg_color"
                                value={cardFormData.btn_bg_color}
                                onChange={(e) => handleCardChange(e)}
                                name="btn_bg_color"
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-1">
                            <InputLabel
                                className="text-black text-sm font-medium"
                                value={"Button text Color"}
                            />
                            <ColorInput
                                id="btn_text_color"
                                value={cardFormData.btn_text_color}
                                onChange={(e) => handleCardChange(e)}
                                name="btn_text_color"
                                className="w-full"
                            />
                        </div>
                    </div>
                    <div className="p-3 rounded-lg grid sm:grid-cols-2 gap-4 border border-[#EAECF0]">
                        <div className="space-y-1">
                            <InputLabel
                                className="text-black text-sm font-medium"
                                value={"Company name"}
                            />
                            <TextInput
                                id="company_name"
                                value={cardFormData.company_name}
                                onChange={(e) => handleCardChange(e)}
                                name="company_name"
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-1">
                            <InputLabel
                                className="text-black text-sm font-medium"
                                value={"Department"}
                            />
                            <TextInput
                                id="department"
                                value={cardFormData.department}
                                onChange={(e) => handleCardChange(e)}
                                name="department"
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-1">
                            <InputLabel
                                className="text-black text-sm font-medium"
                                value={"Position"}
                            />
                            <TextInput
                                id="position"
                                value={cardFormData.position}
                                onChange={(e) => handleCardChange(e)}
                                name="position"
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-1">
                            <InputLabel
                                className="text-black text-sm font-medium"
                                value={"Company Color"}
                            />
                            <ColorInput
                                id="company_text_color"
                                value={cardFormData.company_text_color}
                                onChange={(e) => handleCardChange(e)}
                                name="company_text_color"
                                className="w-full"
                            />
                        </div>
                    </div>

                    <CardFormPhoneNumbers />

                    <CardFormEmails />

                    <CardFormAddresses />
                </div>
            </AccordionBody>
        </Accordion>
    );
}
