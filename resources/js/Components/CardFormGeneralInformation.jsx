import {
    Accordion,
    AccordionHeader,
    AccordionBody,
} from "@material-tailwind/react";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function CardFormGeneralInformation() {
    const [open, setOpen] = useState(0);
    const handleOpen = (value) => setOpen(open === value ? 0 : value);

    return (
        <Accordion className="border border-[#F4F4F5] rounded-2xl"
            open={open === 1}
            icon={
                <ChevronDown
                    id={1}
                    open={open}
                    className={`${open ? "rotate-180" : ""} transition text-[#71717A]`}
                />
            }
        >
            <AccordionHeader className={`py-3 ${open ? 'rounded-t-2xl':'rounded-2xl'} px-5 border-0 bg-[#F4FAF5] transition duration-500`} onClick={() => handleOpen(1)}>
                <div className="flex flex-col gap-1.5 font-public-sans">
                    <h5 className="font-semibold text-xl text-black">General Information</h5>
                    <p className="text-sm text-[#71717A] font-normal">Company details, banner image...</p>
                </div>
            </AccordionHeader>
            <AccordionBody className="p-0">
                <div className="p-5 space-y-4">
                    
                </div>
            </AccordionBody>
        </Accordion>
    );
}
