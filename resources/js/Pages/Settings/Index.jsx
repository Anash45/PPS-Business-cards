import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage } from "@inertiajs/react";
import { GlobalProvider, useGlobal } from "@/context/GlobalProvider";
import { useEffect, useState } from "react";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";
import TextInput from "@/Components/TextInput";
import Button from "@/Components/Button";
import toast from "react-hot-toast";
import axios from "axios";
import CompanyPlans from "@/Components/CompanyPlans";

export default function Settings() {
    const { plans, company, subscription } = usePage().props;
    const { setHeaderTitle, setHeaderText } = useGlobal(GlobalProvider);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // ✅ Always controlled — use safe defaults
    const [formData, setFormData] = useState({
        name: company?.name ?? "",
        billing_email: company?.billing_email ?? "",
        street_address: company?.street_address ?? "",
        postal_code: company?.postal_code ?? "",
        city: company?.city ?? "",
        country: company?.country ?? "",
        vat_id: company?.vat_id ?? "",
        created_at: company?.created_at ?? "",
        updated_at: company?.updated_at ?? "",
    });

    useEffect(() => {
        setHeaderTitle("Settings");
        setHeaderText("");
    }, []);

    const handleChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value ?? "" }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        try {
            const { data } = await axios.put(
                route("settings.company.update"),
                formData,
                {
                    headers: { Accept: "application/json" },
                }
            );

            if (data.success) {
                toast.success(
                    data.message || "Company details updated successfully."
                );

                // ✅ Update UI immediately with new data
                setFormData((prev) => ({
                    ...prev,
                    ...Object.fromEntries(
                        Object.entries(data.company || {}).map(([k, v]) => [
                            k,
                            v ?? "",
                        ])
                    ),
                }));
            } else {
                toast.error(
                    data.message || "Failed to update company details."
                );
            }
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors || {});
                toast.error("Please fix the highlighted errors.");
            } else {
                toast.error(
                    error.response?.data?.message ||
                        "Something went wrong. Try again later."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Settings" />

            <form
                onSubmit={handleSubmit}
                className="py-4 md:px-6 px-4"
            >
                <div className="py-4 md:px-6 px-4 rounded-[14px] main-box bg-white flex flex-col gap-6">
                    <CompanyPlans plans={plans} subscription={subscription} />
                    <div className="space-y-5">
                        <h2 className="text-xl font-bold">Company Details</h2>

                        <div className="space-y-3">
                            <div className="grid xl:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-3">
                                {[
                                    { name: "name", label: "Company Name" },
                                    {
                                        name: "billing_email",
                                        label: "Billing Email",
                                    },
                                    {
                                        name: "street_address",
                                        label: "Street Address",
                                    },
                                    {
                                        name: "postal_code",
                                        label: "Postal Code",
                                    },
                                    { name: "city", label: "City" },
                                    { name: "country", label: "Country" },
                                    { name: "vat_id", label: "VAT ID" },
                                ].map(({ name, label, disabled }) => (
                                    <div key={name} className="space-y-1">
                                        <InputLabel
                                            htmlFor={name}
                                            className="leading-tight"
                                            value={label}
                                        />
                                        <TextInput
                                            id={name}
                                            name={name}
                                            value={formData[name] ?? ""}
                                            onChange={(e) =>
                                                handleChange(
                                                    name,
                                                    e.target.value
                                                )
                                            }
                                            className="w-full block"
                                            disabled={disabled}
                                        />
                                        <InputError message={errors[name]} />
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-end">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={loading}
                                >
                                    {loading ? "Saving..." : "Save changes"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
