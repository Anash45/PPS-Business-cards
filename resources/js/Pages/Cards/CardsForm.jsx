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

export default function CardsForm({previewCards, setPreviewCards}) {
    const { companies } = usePage().props;

    const [linkDomain, setLinkDomain] = useState(
        "https://app.ppsbusinesscards.de"
    );
    const [loading, setLoading] = useState(false);

    const [data, setData] = useState({
        company_id: companies.length > 0 ? companies[0].id : "",
        quantity: 10,
        domain: linkDomain,
    });

    // Fetch domain on mount
    useEffect(() => {
        (async () => {
            const domain = await getDomain();
            setLinkDomain(domain);
            setData((prev) => ({ ...prev, domain }));
        })();
    }, []);

    const clearPreview = () => setPreviewCards([]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setPreviewCards([]); // clear previous preview

        try {
            const response = await axios.post("/cards", {
                company_id: data.company_id,
                quantity: data.quantity,
            });

            if (response.data.success) {
                // Use actual data returned by API
                // response.data.createdCards can be an array of objects if needed
                setPreviewCards(response.data.createdCards);

                console.log(response.data);
                toast.success(
                    `${response.data.cards_created} cards generated successfully!`
                );
                router.reload({ only: ['cardsGroups'] });

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

    console.log(previewCards);

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
                            label: `${company.name} -- ${company.used_cards}/${company.total_cards_allowed}`,
                        }))}
                    />
                </div>

                {/* Number of Cards */}
                <div className="space-y-1">
                    <InputLabel
                        htmlFor="quantity"
                        value="Number of cards"
                        className="text-[#344054] font-medium"
                    />
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

            {/* Preview */}
            {previewCards.length > 0 && (
                <div className="flex flex-col gap-3 py-3">
                    <p className="text-[#079E04] text-xs font-medium">
                        {previewCards.length} URLs generated.
                    </p>
                    <p className="text-xs leading-5 font-medium text-[#475569]">
                        Once generated, the URLs are immediately active. The CSV
                        is automatically downloaded and stored in the History.
                    </p>
                    <Divider className="mt-3" />
                </div>
            )}

            {previewCards.length > 0 && (
                <CardsPreview domain={linkDomain} previewCards={previewCards} />
            )}
        </>
    );
}
