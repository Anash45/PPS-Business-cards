import { useEffect, useState } from "react";
import axios from "axios";
import { getDomain } from "@/utils/viteConfig";
import InputLabel from "@/Components/InputLabel";
import SelectInput from "@/Components/SelectInput";
import TextInput from "@/Components/TextInput";
import CardsPreview from "./CardsPreview";
import Divider from "@/Components/Divider";
import Button from "@/Components/Button";
import { toast } from "react-hot-toast";
import { router, usePage } from "@inertiajs/react";

export default function CardsForm({ previewCards, setPreviewCards }) {
    const { companies } = usePage().props;

    const [linkDomain, setLinkDomain] = useState(
        "https://app.ppsbusinesscards.de"
    );
    const [loading, setLoading] = useState(false);

    const [data, setData] = useState({
        company_id: companies.length > 0 ? companies[0].id : "",
        quantity: 10,
        nfc_quantity: 50,
        domain: linkDomain,
    });

    // Track selected company info
    const [companyInfo, setCompanyInfo] = useState({
        used_cards: 0,
        total_cards_allowed: 0,
        remaining_cards: 0,
        nfc_used: 0,
        total_nfc_cards: 0,
        nfc_remaining: 0,
    });

    // Initialize domain on mount
    useEffect(() => {
        (async () => {
            const domain = await getDomain();
            setLinkDomain(domain);
            setData((prev) => ({ ...prev, domain }));
        })();
    }, []);

    // Update company info when company changes
    useEffect(() => {
        const company = companies.find(
            (c) => c.id === parseInt(data.company_id)
        );
        if (company) {
            setCompanyInfo({
                used_cards: company.used_cards,
                total_cards_allowed: company.total_cards_allowed,
                remaining_cards: company.remaining_cards,
                nfc_used: company.nfc_used,
                total_nfc_cards: company.total_nfc_cards,
                nfc_remaining: company.nfc_remaining,
            });
        }
    }, [data.company_id, companies]);

    const clearPreview = () => setPreviewCards([]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setPreviewCards([]);

        try {
            const response = await axios.post("/cards", {
                company_id: data.company_id,
                quantity: data.quantity,
                nfc_quantity: data.nfc_quantity,
            });

            console.log("Cards: ",response.data);

            if (response.data.success) {
                setPreviewCards(response.data.createdNfcCards);
                toast.success(
                    `${response.data.cards_created} cards generated successfully!`
                );
                router.reload({ only: ["cardsGroups", "companies"] });
            } else {
                toast.error(
                    response.data.message || "Failed to generate cards"
                );
            }
        } catch (err) {
            console.error(err);
            toast.error(
                err.response?.data?.message || "Failed to generate cards"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <form
                onSubmit={handleSubmit}
                className="grid gap-3 md:grid-cols-2 grid-cols-1"
            >
                {/* Company Select */}
                <div className="space-y-1">
                    <InputLabel
                        htmlFor="company"
                        value="Company"
                        className="text-[#344054] font-medium"
                    />
                    <SelectInput
                        id="company"
                        name="company_id"
                        value={data.company_id}
                        onChange={(e) =>
                            setData({ ...data, company_id: e.target.value })
                        }
                        className="w-full block"
                        options={companies.map((company) => ({
                            value: company.id,
                            label: company.name,
                        }))}
                    />
                </div>

                {/* Number of employees */}
                <div className="space-y-1">
                    <div className="flex gap-2 flex-wrap items-center">
                        <InputLabel
                            htmlFor="quantity"
                            value="Number of employees"
                            className="text-[#344054] font-medium leading-tight"
                        />
                        <span className="text-xs font-semibold text-[#344054] leading-tight">
                            ({companyInfo.used_cards}/
                            {companyInfo.total_cards_allowed})
                        </span>
                    </div>
                    <TextInput
                        id="quantity"
                        name="quantity"
                        type="number"
                        value={data.quantity}
                        onChange={(e) =>
                            setData({ ...data, quantity: e.target.value })
                        }
                        className="block w-full"
                        required
                    />
                </div>

                {/* Number of NFC cards */}
                <div className="space-y-1">
                    <div className="flex gap-2 flex-wrap items-center">
                        <InputLabel
                            htmlFor="nfc_quantity"
                            value="Number of NFC cards"
                            className="text-[#344054] font-medium leading-tight"
                        />
                        <span className="text-xs font-semibold text-[#344054] leading-tight">
                            ({companyInfo.nfc_used}/{companyInfo.total_nfc_cards})
                        </span>
                    </div>
                    <TextInput
                        id="nfc_quantity"
                        name="nfc_quantity"
                        type="number"
                        value={data.nfc_quantity}
                        onChange={(e) =>
                            setData({ ...data, nfc_quantity: e.target.value })
                        }
                        className="block w-full"
                        required
                    />
                </div>

                {/* Domain (read-only) */}
                <div className="space-y-1">
                    <InputLabel
                        htmlFor="domain"
                        value="Domain (read-only)"
                        className="text-[#344054] font-medium"
                    />
                    <TextInput
                        id="domain"
                        name="domain"
                        value={linkDomain}
                        readOnly
                        className="block w-full"
                    />
                </div>

                {/* Buttons */}
                <div className="flex-wrap gap-1 items-center md:col-span-2 flex mt-3">
                    <Button type="submit" disabled={loading}>
                        {loading ? "Generating..." : "Generate Cards"}
                    </Button>
                    <Button
                        variant="light"
                        type="button"
                        onClick={clearPreview}
                    >
                        Clear Preview
                    </Button>
                </div>
            </form>

            {previewCards.length > 0 && (
                <CardsPreview domain={linkDomain} previewCards={previewCards} />
            )}
        </>
    );
}
