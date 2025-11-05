import {
    Accordion,
    AccordionHeader,
    AccordionBody,
} from "@material-tailwind/react";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import InputLabel from "./InputLabel";
import { GlobalProvider, useGlobal } from "@/context/GlobalProvider";
import CardImageUploader from "./CardImagesUploader";

export default function CardFormBanner() {
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
                        Banner
                    </h5>
                    <p className="text-sm text-[#71717A] font-normal">
                        Company banner image...
                    </p>
                </div>
            </AccordionHeader>
            <AccordionBody className="overflow-visible p-0">
                <div className="p-5 space-y-4">
                    <div className="p-3 rounded-lg grid grid-cols-1 gap-4 border border-[#EAECF0]">
                        <div className="space-y-1">
                            <InputLabel
                                className="text-black text-sm font-medium"
                                value={"Banner Image"}
                            />
                            <CardImageUploader
                            name="banner_image"
                            value={
                                cardFormData.banner_image ??
                                cardFormData.banner_image_url
                            }
                            message="File size should be less than 5MB. Ideal dimensions: 1600x800 pixels OR 2/1 ratio."
                            onChange={handleCardChange}
                            label="Logo Image"
                        />
                        </div>
                    </div>
                </div>
            </AccordionBody>
        </Accordion>
    );
}
