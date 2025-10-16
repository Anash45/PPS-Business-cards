import {
    Accordion,
    AccordionHeader,
    AccordionBody,
} from "@material-tailwind/react";
import { useEffect, useState } from "react";
import { ChevronDown, Trash2 } from "lucide-react";
import { GlobalProvider, useGlobal } from "@/context/GlobalProvider";
import SelectInput from "./SelectInput";
import {
    FaFacebook,
    FaInstagram,
    FaLinkedin,
    FaPinterest,
    FaTiktok,
    FaYoutube,
    FaTwitter,
    FaBehance,
} from "react-icons/fa";
import TextInput from "./TextInput";
import Button from "./Button";
import { toast } from "react-hot-toast";

export default function CardFormSocialLinks() {
    const [open, setOpen] = useState(1);
    const [delayedClass, setDelayedClass] = useState(false);

    const { cardFormData, setCardFormData, isTemplate } =
        useGlobal(GlobalProvider);

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

    const socialOptions = [
        { value: "FaFacebook", icon: FaFacebook, label: "Facebook" },
        { value: "FaInstagram", icon: FaInstagram, label: "Instagram" },
        { value: "FaPinterest", icon: FaPinterest, label: "Pinterest" },
        { value: "FaTiktok", icon: FaTiktok, label: "Tiktok" },
        { value: "FaLinkedin", icon: FaLinkedin, label: "Linkedin" },
        { value: "FaYoutube", icon: FaYoutube, label: "Youtube" },
        { value: "FaTwitter", icon: FaTwitter, label: "Twitter" },
        { value: "FaBehance", icon: FaBehance, label: "Behance" },
    ];

    // Add a new link
    const addSocialLink = () => {
        const maxLinks = 5;
        if (
            !isTemplate &&
            (cardFormData.card_social_links?.length || 0) >= maxLinks
        ) {
            toast.error("You can only add up to 5 links.");
            return;
        }

        const newLinks = [
            ...(cardFormData.card_social_links || []),
            { icon: "", url: "" },
        ];

        setCardFormData((prev) => ({
            ...prev,
            card_social_links: newLinks,
        }));
    };

    // Remove a link
    const removeSocialLink = (index) => {
        const link = cardFormData.card_social_links[index];

        // If it’s a company-owned link and we’re not in template mode, prevent delete
        if (!isTemplate && link.company_id && !link.card_id) {
            toast.error("You cannot delete company default links.");
            return;
        }

        const newLinks = cardFormData.card_social_links.filter(
            (_, i) => i !== index
        );

        setCardFormData((prev) => ({
            ...prev,
            card_social_links: newLinks,
        }));
    };

    // Update a link’s field
    const updateSocialLink = (index, key, value) => {
        const updatedLinks = [...(cardFormData.card_social_links || [])];
        updatedLinks[index] = { ...updatedLinks[index], [key]: value };

        setCardFormData((prev) => ({
            ...prev,
            card_social_links: updatedLinks,
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
                        Social Media Links
                    </h5>
                    <p className="text-sm text-[#71717A] font-normal">
                        {isTemplate
                            ? "Add social media links to your template."
                            : "Add social media links to your card. Max 5 links."}
                    </p>
                </div>
            </AccordionHeader>

            <AccordionBody className="overflow-visible p-0">
                <div className="p-5 space-y-4">
                    {(cardFormData.card_social_links || []).map(
                        (link, index) => (
                            <div
                                key={index}
                                className="p-3 rounded-lg flex md:flex-row flex-col gap-3 border border-[#EAECF0]"
                            >
                                <div className="md:w-[150px] w-full">
                                    <SelectInput
                                        className="w-full"
                                        options={socialOptions}
                                        value={link.icon || ""}
                                        onChange={(e) =>
                                            updateSocialLink(
                                                index,
                                                "icon",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                                <div className="grow">
                                    <TextInput
                                        className="w-full"
                                        placeholder="https://www.yourlink.com/yourprofile"
                                        value={link.url || ""}
                                        onChange={(e) =>
                                            updateSocialLink(
                                                index,
                                                "url",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>

                                {/* Only show delete if allowed */}
                                {(!link.company_id ||
                                    (link.company_id && isTemplate) ||
                                    link.card_id) && (
                                    <Button
                                        variant="danger-outline"
                                        className="w-fit ms-auto"
                                        onClick={() => removeSocialLink(index)}
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </Button>
                                )}
                            </div>
                        )
                    )}

                    <Button variant="primary-outline" onClick={addSocialLink}>
                        Add New Link
                    </Button>
                </div>
            </AccordionBody>
        </Accordion>
    );
}
